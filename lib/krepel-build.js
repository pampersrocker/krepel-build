'use babel';

const originalNodePath = process.env.NODE_PATH;

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import EventEmitter from 'events';
import { exec } from 'child_process';
import { existsSync, stat, watch } from 'fs';
import { Task } from 'atom';
import Promise from 'bluebird';

export function provideBuilder()
{
  const execAsync = Promise.promisify(exec);
  return class KrepelBuildProvider extends EventEmitter
  {
    constructor(cwd)
    {
      super();
      this.cwd = cwd;
      this.fileWatchers = [];
    }

    destructor()
    {
      this.fileWatchers.forEach(fw => fw.close());
    }

    getNiceName()
    {
      return 'krepel-build';
    }

    isEligible()
    {
      this.file = [ 'build.bat' ]
        .map(file => path.join(this.cwd, file))
        .filter(fs.existsSync)
        .slice(0, 1)
        .pop();
      return !!this.file;
    }

    settings()
    {
      const buildRuleToConfig = function(config) {
        return {
          name: config,
          exec: 'build.bat',
          args: [config],
          errorMatch:
            ["(?<file>[:\\/0-9a-zA-Z\\._\\\\\\-]+)\\((?<line>\\d+),(?<col>\\d+)\\): Error:.*",
            "core.exception.AssertError\\@(?<file>[:\\/0-9a-zA-Z\\._\\\\\\-]+)\\((?<line>\\d+)\\):.*",
            "Failed compiling",
            "Exit code: -\\d+"],
          warningMatch:
            ["(?<file>[:\\/0-9a-zA-Z\\._\\\\\\-]+)\\((?<line>\\d+),(?<col>\\d+)\\): Warning:.*"],
          sh: true
        };
      };
      return execAsync("build.bat" + " -rules",{cwd: this.cwd})
      .catch(err => {
        console.log("Error:" + err);
      })
      .then(outputBuffer => {
          return outputBuffer
          .toString("utf-8")
          .split(os.EOL)
          .filter((name)=>{
            const regex = "\\s*\\w+\\s*";
            const regex2 = "[^!]+"
            return name.match(regex) != null && name.match(regex2) != null;
          })
          .map(buildRuleToConfig);
        });
    }
  }
}

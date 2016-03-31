'use babel';

const originalNodePath = process.env.NODE_PATH;

import fs from 'fs';
import path from 'path';
import util from 'util';
import { Task } from 'atom';
import EventEmitter from 'events';

export function provideBuilder()
{
  return class GulpBuildProvider extends EventEmitter
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
      const buildRuleToConfig = function(config, name) =>
      {
        cmd: "build.bat",
        name: name,
        args: [config],
        errorMatch:
          - "(?<file>[:\\/0-9a-zA-Z\\._\\\\\\-]+)\\((?<line>\\d+),(?<col>\\d+)\\): Error:.*"
          - "core.exception.AssertError\\@(?<file>[:\\/0-9a-zA-Z\\._\\\\\\-]+)\\((?<line>\\d+)\\):.*"
        sh: true
      };
      // Child process is required to spawn any kind of asynchronous process
      var childProcess = require("child_process");
      // This line initiates bash
      return Promise.promisify(childProcess('build.bat',["-rules"],{env: process.env})).then(outputBuffer =>
        {
          console.log("Output: " + outputBuffer);
          return outputBuffer
          .toString(utf-8)
          .split(os.EOL)
          .map(buildRuleToConfig.bind(buildRuleToConfig));
        });
    }
  }
}

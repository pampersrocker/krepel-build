'use babel';

import KrepelBuildView from './krepel-build-view';
import { CompositeDisposable } from 'atom';

export default {

  krepelBuildView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.krepelBuildView = new KrepelBuildView(state.krepelBuildViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.krepelBuildView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'krepel-build:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.krepelBuildView.destroy();
  },

  serialize() {
    return {
      krepelBuildViewState: this.krepelBuildView.serialize()
    };
  },

  toggle() {
    console.log('KrepelBuild was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};

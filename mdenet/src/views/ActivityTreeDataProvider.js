const vscode = require('vscode');
const fs = require('fs');
const LocalRepoManager = require('../utils/LocalRepoManager');


class ActivityTreeDataProvider{
    constructor(items) {
        this.playingFile = null;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    setPlaying(file) {
        this.playingFile = file.label;
        this.refresh();
    }

    setStopped(file) {
        this.playingFile = null;
        this.refresh();
    }

    getTreeItem(element) {
        const isPlaying = this.playingFile === element.label;
        return {
            label: element.label,
            command: isPlaying
            ? {
                command: 'activities.stop',
                title: 'Stop',
                arguments: [element],
                }
            : {
                command: 'activities.play',
                title: 'Play',
                arguments: [element],
                },
            iconPath: isPlaying
            ? new vscode.ThemeIcon('debug-stop')
            : new vscode.ThemeIcon('debug-start'),
            contextValue: 'activityItem',
        };
    }

    getChildren() {
        const localRepoManager = new LocalRepoManager();
        return localRepoManager.getFiles().map((file) => ({ label: file }));
    }
}
module.exports = ActivityTreeDataProvider;

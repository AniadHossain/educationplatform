const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

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
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            console.log('No workspace is opened');
            return Promise.resolve([]);
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        console.log('Root path:', rootPath);
        const files = fs
            .readdirSync(rootPath)
            .filter((file) => file.endsWith('activity.json') || file.endsWith('activity.yml'));
        console.log('Files:', files);

        return files.map((file) => ({ label: file }));
    }
}
module.exports = ActivityTreeDataProvider;

const vscode = require('vscode');
const fs = require('fs');

class LocalRepoManager {
    constructor(){
        if(LocalRepoManager.instance){
            return LocalRepoManager.instance;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            // console.log('No workspace is opened');
            return Promise.resolve([]);
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        // console.log('Root path:', rootPath);
        const files = fs
            .readdirSync(rootPath)
            .filter((file) => file.endsWith('activity.json') || file.endsWith('activity.yml'));
        // console.log('Files:', files);

        this.files = files;
        LocalRepoManager.instance = this;
    }

    getFiles(){
        return this.files;
    }
}

module.exports = LocalRepoManager;
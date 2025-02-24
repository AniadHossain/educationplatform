const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class LocalRepoManager {
    constructor(){
        if(LocalRepoManager.instance){
            return LocalRepoManager.instance;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            // console.log('No workspace is opened');
            this.files = [];
        }
        else{
            const rootPath = workspaceFolders[0].uri.fsPath;
            this.rootPath = rootPath;
            // console.log('Root path:', rootPath);
            const files = fs
                .readdirSync(rootPath)
                .filter((file) => file.endsWith('activity.json') || file.endsWith('activity.yml'));
            // console.log('Files:', files);
            this.files = files;
        }
        LocalRepoManager.instance = this;
    }

    getFiles(){
        return this.files;
    }

    fetchActivityFile(fileName){
        const filePath = path.join(this.rootPath, fileName);
        // const fileContents = await fs.promises.readFile(filePath, 'utf-8');
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        return fileContents;
    }
}

module.exports = LocalRepoManager;
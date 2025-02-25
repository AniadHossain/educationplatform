const ExtensionPanel = require('./ExtensionPanel');
const vscode = require('vscode');

class ExtensionProgramPanel extends ExtensionPanel{
    constructor(id, fileLocation){
        super(id);
        this.type = 'program';
        this.fileLocation = fileLocation;
    }

    async displayPanel(targetColumn=vscode.ViewColumn.One){
        let doc = null;
        if (this.fileLocation){
            doc = await vscode.workspace.openTextDocument(this.fileLocation);
        }
        else{
            doc = await vscode.workspace.openTextDocument();
        }
        await vscode.window.showTextDocument(doc, { preview: false, viewColumn: targetColumn });
    }
}

module.exports = ExtensionProgramPanel;
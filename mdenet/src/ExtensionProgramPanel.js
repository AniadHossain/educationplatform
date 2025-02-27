const ExtensionPanel = require('./ExtensionPanel');
const vscode = require('vscode');

class ExtensionProgramPanel extends ExtensionPanel{
    constructor(id, fileLocation){
        super(id);
        this.fileLocation = fileLocation;
        this.doc = null;
    }

    async displayPanel(targetColumn=vscode.ViewColumn.One){
        let doc = null;
        if (this.fileLocation){
            doc = await vscode.workspace.openTextDocument(this.fileLocation);
        }
        else{
            doc = await vscode.workspace.openTextDocument();
        }
        this.doc = doc;
        await vscode.window.showTextDocument(doc, { preview: false, viewColumn: targetColumn });
    }

    getValue(){
        return this.doc.getText();
    }

}

module.exports = ExtensionProgramPanel;
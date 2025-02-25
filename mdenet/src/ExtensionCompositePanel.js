const ExtensionPanel = require('./ExtensionPanel');
const vscode = require('vscode');

class ExtensionCompositePanel extends ExtensionPanel{
    panels;

    constructor(id){
        super(id);
        this.type = 'composite';
        this.panels = [];
    }

    addPanel(panel){
        this.panels.push(panel);
    }

    async displayPanel(targetColumn=vscode.ViewColumn.One){
        for (let panel of this.panels){
            await panel.displayPanel(targetColumn);
        }
    }
}

module.exports = ExtensionCompositePanel;
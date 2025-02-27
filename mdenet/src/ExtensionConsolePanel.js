const ExtensionPanel = require('./ExtensionPanel');
const vscode = require('vscode');

class ExtensionConsolePanel extends ExtensionPanel{

    constructor(id){
        super(id);
        this.type = 'console';
        this.outputChannel = vscode.window.createOutputChannel("MDENet"+this.id);
        this.outputChannel.show();
    }

    displayPanel(){
        this.outputChannel.show(true);
    }

    setError(str){
        this.outputChannel.appendLine(`[Error] ${str}`);
        this.outputChannel.show(true);
    }

    setValue(str){
        this.outputChannel.appendLine(str);
        this.outputChannel.show(true);
    }
}

module.exports = ExtensionConsolePanel;
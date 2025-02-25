const ExtensionPanel = require('./ExtensionPanel');
const vscode = require('vscode');

class ExtensionOutputPanel extends ExtensionPanel{

    constructor(id){
        super(id);
        const panel = vscode.window.createWebviewPanel(
            id,       // Unique ID
            'My Webview',      // Panel title
            vscode.ViewColumn.One, // Where to show (e.g., left, right, main area)
            { enableScripts: true } // Webview options (allows JavaScript)
          );
      
          // Set HTML content for the Webview
          panel.webview.html = this.getWebviewContent();
    }

    displayPanel(){
        this.outputChannel.show(true);
    }

    getWebviewContent(){
        return `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Webview Example</title>
            </head>
            <body>
                <h1>Hello from Webview!</h1>
            </body>
        </html>`;
    }
}

module.exports = ExtensionOutputPanel;
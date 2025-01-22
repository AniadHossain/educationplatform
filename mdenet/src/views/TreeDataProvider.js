const vscode = require('vscode');

class TreeDataProvider {
    constructor(items) {
      this.items = items;
      this._onDidChangeTreeData = new vscode.EventEmitter();
      this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
  
    refresh() {
      this._onDidChangeTreeData.fire();
    }
  
    getTreeItem(element) {
      return new vscode.TreeItem(element, vscode.TreeItemCollapsibleState.None);
    }
  
    getChildren() {
      return this.items.map((item) => new vscode.TreeItem(item));
    }
  }

module.exports = TreeDataProvider;
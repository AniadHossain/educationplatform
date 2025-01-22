// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const TreeDataProvider = require('./src/views/TreeDataProvider');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const activityProvider = new TreeDataProvider(['Activity 1', 'Activity 2']);
	const taskProvider = new TreeDataProvider(['Task 1', 'Task 2']);
	const panelProvider = new TreeDataProvider(['Panel 1', 'Panel 2']);

	vscode.window.registerTreeDataProvider('activities', activityProvider);
	vscode.window.registerTreeDataProvider('tasks', taskProvider);
	vscode.window.registerTreeDataProvider('panels', panelProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('activities.refresh', () => activityProvider.refresh()),
		vscode.commands.registerCommand('tasks.refresh', () => taskProvider.refresh()),
		vscode.commands.registerCommand('panels.refresh', () => panelProvider.refresh())
	  );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

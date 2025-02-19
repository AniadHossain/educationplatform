// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const TreeDataProvider = require('./src/views/TreeDataProvider');
const ActivityTreeDataProvider = require('./src/views/ActivityTreeDataProvider');
const TaskTreeDataProvider = require('./src/views/TaskTreeDataProvider');
const LocalRepoManager = require('./src/utils/LocalRepoManager');
const { ActivityManager } = require('../platform-commonjs/src/ActivityManager');
const { ActivityConfigValidator } = require('../platform-commonjs/src/ActivityConfigValidator');
console.log(require('../platform-commonjs/src/ActivityManager'));

// const EducationPlatformApp =  require('../platform/src/EducationPlatformApp').EducationPlatformApp;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const localRepoManager = new LocalRepoManager();
	const activityProvider = new ActivityTreeDataProvider();
	const taskProvider = new TaskTreeDataProvider();
	const panelProvider = new TreeDataProvider(['Panel 1', 'Panel 2']);
	// const activityManager = new ActivityManager(1,1)
	const activityConfigValidator = new ActivityConfigValidator();

	vscode.window.registerTreeDataProvider('activities', activityProvider);
	vscode.window.registerTreeDataProvider('tasks', taskProvider);
	vscode.window.registerTreeDataProvider('panels', panelProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('activities.refresh', () => activityProvider.refresh()),
		vscode.commands.registerCommand('tasks.refresh', () => taskProvider.refresh()),
		vscode.commands.registerCommand('panels.refresh', () => panelProvider.refresh()),
		vscode.commands.registerCommand('activities.play', async (file) => {
			try {
				const fileContents = await localRepoManager.fetchActivityFile(file.label);

				// console.log('File Contents:', fileContents);
				// vscode.window.showInformationMessage(`Fetched contents of: ${file.label}`);
				if (fileContents.activities) {
					taskProvider.setTasks(fileContents.activities);
				} else {
					vscode.window.showWarningMessage('No activities found in the file.');
				}

				activityProvider.setPlaying(file);
			  } catch (error) {
				vscode.window.showErrorMessage(`Error fetching file: ${error.message}`);
			}
		  }),
		vscode.commands.registerCommand('activities.stop', (file) => {
			vscode.window.showInformationMessage(`Stopping: ${file.label}`);
			activityProvider.setStopped(file);
		})
	  );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

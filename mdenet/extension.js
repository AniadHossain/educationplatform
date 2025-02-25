// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const TreeDataProvider = require('./src/views/TreeDataProvider');
const ActivityTreeDataProvider = require('./src/views/ActivityTreeDataProvider');
const TaskTreeDataProvider = require('./src/views/TaskTreeDataProvider');
const LocalRepoManager = require('./src/utils/LocalRepoManager');
const { ActivityManager } = require('../platform-commonjs/src/ActivityManager');
const { ActivityValidator } = require('../platform-commonjs/src/ActivityValidator');
const { ActivityConfigValidator } = require('../platform-commonjs/src/ActivityConfigValidator');
const { ToolManager } = require('../platform-commonjs/src/ToolsManager');
const ExtensionToolsManager = require('./src/ExtensionToolsManager');
const ExtensionErrorHandler = require('./src/ExtensionErrorHandler');
const ExtensionActivityManager = require('./src/ExtensionActivityManager');
const ExtensionProgramPanel = require('./src/ExtensionProgramPanel');
const ExtensionConsolePanel = require('./src/ExtensionConsolePanel');
const ExtensionCompositePanel = require('./src/ExtensionCompositePanel');
const ExtensionOutputPanel = require('./src/ExtensionOutputPanel');
const ExtensionButton = require('./src/ExtensionButton');


const COMMON_UTILITY_URL = "https://ep.mde-network.org/common/utility.json"
// let selectedActivity = null;
let outputLanguage = null;
let panels = []

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
	const errorHandler = new ExtensionErrorHandler();
	const toolManager = new ExtensionToolsManager(errorHandler.notify.bind(errorHandler));

	

	vscode.window.registerTreeDataProvider('activities', activityProvider);
	vscode.window.registerTreeDataProvider('tasks', taskProvider);
	vscode.window.registerTreeDataProvider('panels', panelProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('activities.refresh', () => activityProvider.refresh()),
		vscode.commands.registerCommand('tasks.refresh', () => taskProvider.refresh()),
		vscode.commands.registerCommand('panels.refresh', () => panelProvider.refresh()),
		vscode.commands.registerCommand('activities.play', async (file) => {
			try {
				const activityManager = new ExtensionActivityManager((toolManager.getPanelDefinition).bind(toolManager), localRepoManager, taskProvider, context,file.label);
				activityProvider.setPlaying(file);
				activityManager.initializeActivities();
				await toolManager.setToolsUrls(activityManager.getToolUrls().add(COMMON_UTILITY_URL));
				console.log("Tool Manager Initialized", toolManager.tools);
				activityManager.hideActivitiesNavEntries();
				console.log("Activity Manager Initialized");
				const selectedActivity = activityManager.getSelectedActivity();
				console.log('Selected Activity:', selectedActivity);
				console.log("Errors", ActivityValidator.validate(selectedActivity, toolManager.tools))
				// initializePanels();
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

async function initializePanels(){
	if(selectedActivity.outputLanguage != null){
		outputLanguage = selectedActivity.outputLanguage;
	}

	for (let apanel of selectedActivity.panels){
		var newPanel = createPanelForDefinition(apanel); // panel objects
		if (newPanel != null){
			panels.push(newPanel);
		}
	}

	await generatePanels(panels,selectedActivity.layout.area);
}

async function generatePanels(panels, layout){
	await vscode.workspace.saveAll();
	await vscode.commands.executeCommand('workbench.action.closeAllEditors');

	for(let i = 0; i < layout.length; i++){
		for(let j = 0; j < layout[i].length; j++){
			const focus = (i > 0 && j == 0) ? true : false;
			const panel = panels.find(panel => panel.getId() === layout[i][j]);
			panel.displayPanel();
		}
	}
}

function createPanelForDefinition(panel){
	const panelDefinition = panel.ref;
	console.log("Panel Definition", panelDefinition);
	var newPanel = null;
	const newPanelId = panel.id;

	if (panelDefinition != null){

		switch(panelDefinition.panelclass){
			case "ProgramPanel":{
				newPanel = new ExtensionProgramPanel(newPanelId,panel.file);
				break;
			}
			case "ConsolePanel":{
				newPanel = new ExtensionConsolePanel(newPanelId);
				break;
			}
			case "CompositePanel":{
				newPanel = new ExtensionCompositePanel(newPanelId);
				if(panel.childPanels){
					for (let childPanelConfig of panel.childPanels){
						var childPanel = createPanelForDefinition(childPanelConfig);
						newPanel.addPanel(childPanel);
					}
				}
				break;
			}
			case "OutputPanel":{
				newPanel = new ExtensionOutputPanel(newPanelId);
				break;
			}
			default:{
				console.log("Panel class not found");
				break;
			}
		}
		if(newPanel != null){
			newPanel.setTitle(panel.name);

			if(panel.icon != null){
				newPanel.setIcon(panel.icon);
			}else{
				newPanel.setIcon(panelDefinition.icon);
			}

			if(panel.buttons == null && panelDefinition.buttons != null){
				newPanel.addButtons(ExtensionButton.createButtons(panelDefinition.buttons, panel.id));
			} else if(panel.buttons != null){
				let resolvedButtonConfigs = panel.buttons.map(btn =>{    
					let resolvedButton;

					if (btn.ref){
						if (panelDefinition.buttons != null) {
							// button reference so resolve
							resolvedButton = panelDefinition.buttons.find((pdBtn)=> pdBtn.id===btn.ref);
						}
					} else {
						// activity defined button
						resolvedButton = btn;
					}
					return resolvedButton;
				});
				panel.buttons = resolvedButtonConfigs;
				newPanel.addButtons( Button.createButtons( resolvedButtonConfigs, panel.id));
			}
		}
	}
	return newPanel
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

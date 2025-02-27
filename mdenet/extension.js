// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const TreeDataProvider = require('./src/views/TreeDataProvider');
const ActivityTreeDataProvider = require('./src/views/ActivityTreeDataProvider');
const TaskTreeDataProvider = require('./src/views/TaskTreeDataProvider');
const PanelTreeDataProvider = require('./src/views/PanelTreeDataProvider');
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
let selectedActivity = null;
let outputLanguage = null;
let panels = []
let activityManager = null;
let toolManager = null;
let current_context = null;

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
	const panelProvider = new PanelTreeDataProvider();
	const errorHandler = new ExtensionErrorHandler();
	toolManager = new ExtensionToolsManager(errorHandler.notify.bind(errorHandler));
	current_context = context;

	

	vscode.window.registerTreeDataProvider('activities', activityProvider);
	vscode.window.registerTreeDataProvider('tasks', taskProvider);
	vscode.window.registerTreeDataProvider('panels', panelProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('activities.refresh', () => activityProvider.refresh()),
		vscode.commands.registerCommand('tasks.refresh', () => taskProvider.refresh()),
		vscode.commands.registerCommand('panels.refresh', () => panelProvider.refresh()),
		vscode.commands.registerCommand('activities.play', async (file) => {
			try {
				activityManager = new ExtensionActivityManager((toolManager.getPanelDefinition).bind(toolManager), localRepoManager, taskProvider, context,file.label);
				activityProvider.setPlaying(file);
				activityManager.initializeActivities();
				await toolManager.setToolsUrls(activityManager.getToolUrls().add(COMMON_UTILITY_URL));
				activityManager.hideActivitiesNavEntries();
				selectedActivity = activityManager.getSelectedActivity();
				console.log('Selected Activity:', selectedActivity);
				console.log("Errors", ActivityValidator.validate(selectedActivity, toolManager.tools))
				console.log("Tools", toolManager.tools);
				initializePanels();
				const displayPanels = getVisiblePanels(panels,selectedActivity.layout.area);
				panelProvider.setPanels(displayPanels);
			  } catch (error) {
				vscode.window.showErrorMessage(`Error fetching file: ${error.message}`);
			}
		  }),
		vscode.commands.registerCommand('activities.stop', (file) => {
			vscode.window.showInformationMessage(`Stopping: ${file.label}`);
			activityProvider.setStopped(file);
		}),
		vscode.commands.registerCommand('panels.displayPanel', (panel) => {
			console.log(panel);
			panel.displayPanel();
		}
	  ),
		vscode.commands.registerCommand('panels.run', async () => {
			let options = [];
			const selectedEditor = vscode.window.activeTextEditor;
			const selectedPanel = panels.find(panel => panel.doc === selectedEditor.document);
			const buttonMap = new Map();
			//console.log("selectedPanel", selectedPanel);
			// console.log("selectedEditor", selectedEditor);
			if (selectedPanel){
				options = selectedPanel.getButtons().map(button => {buttonMap.set(button.hint,button); return button.hint});
			}
			// Show QuickPick menu
			const selectedOption = await vscode.window.showQuickPick(options, {
				placeHolder: "Select an option"
			});

			// Print the selected option
			if (selectedOption) {
				const selectedButton = buttonMap.get(selectedOption);
				eval(selectedButton.action);
			}
		}
	));
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

	const test_layout = [
		["panel-xtext", "panel-xtext"],
		["panel-xtext"]
	]
	// await generatePanels(panels,selectedActivity.layout.area);
	// await generatePanels(panels,test_layout);
}

function getVisiblePanels(panels,layout){
	let visiblePanels = [];
	for(let i = 0; i < layout.length; i++){
		for(let j = 0; j < layout[i].length; j++){
			const panel = panels.find(panel => panel.getId() === layout[i][j]);
			visiblePanels.push(panel);
		}
	}
	return visiblePanels;
}

// async function generatePanels(panels, layout){
// 	await vscode.commands.executeCommand('workbench.action.closeAllEditors');

// 	for(let i = 0; i < layout.length; i++){
// 		for(let j = 0; j < layout[i].length; j++){
// 			const panel = panels.find(panel => panel.getId() === layout[i][j]);
// 			if (panel.type === "console"){
// 				continue;
// 			}
// 			activeEditor = vscode.window.activeTextEditor;
// 			const targetColumn = activeEditor ? activeEditor.viewColumn + 1 : vscode.ViewColumn.One; 
// 			panel.displayPanel(targetColumn);
// 		}
// 	}
// }

function createPanelForDefinition(panel){
	const panelDefinition = panel.ref;
	var newPanel = null;
	const newPanelId = panel.id;

	if (panelDefinition != null){

		switch(panelDefinition.panelclass){
			case "ProgramPanel":{
				newPanel = new ExtensionProgramPanel(newPanelId,panel.file);
				newPanel.setType(panelDefinition.language);
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
				console.log()
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
				newPanel.addButtons( ExtensionButton.createButtons( resolvedButtonConfigs, panel.id));
			}
		}
	}
	return newPanel
}

function runAction(source, sourceButton){
	// Get the action
	var action = activityManager.getActionForCurrentActivity(source, sourceButton);
       
	if (!action){
		vscode.window.showInformationMessage("No action found");

	} else {
		// Action found so try and invoke
		let buttonConfig;
		
		if(action.source.buttons){
			//Buttons defined by activity
			buttonConfig = action.source.buttons.find (btn => btn.id == sourceButton);
		} else {
			//Buttons defined by tool
			console.log("button config found in tool")
			buttonConfig = action.source.ref.buttons.find (btn => btn.id == sourceButton);
		}  

		// Create map containing panel values
		let parameterMap = new Map();

		for (let paramName of Object.keys(action.parameters)){

			let param = {};
			const panelId = action.parameters[paramName].id;
			
			if (panelId) { 
				const panel = activityManager.findPanel(panelId, panels);
				param.type = panel.getType();
				param.value = panel.getValue();

			} else {
				// No panel with ID so it use as the parameter value
				const parameterValue = action.parameters[paramName];
				param.type = 'text';
				param.value = parameterValue;
			}

			parameterMap.set(paramName, param);
		}

		// Add the platform language parameter
		let languageParam = {};
		languageParam.type = "text";
		languageParam.value = action.source.ref.language; // Source panel language
		parameterMap.set("language", languageParam);

			// TODO support output and language 
			//actionRequestData.outputType = outputType;
			//actionRequestData.outputLanguage = outputLanguage;

		// Call backend conversion and service functions
		let actionResultPromise = toolManager.invokeActionFunction(buttonConfig.actionfunction, parameterMap);

		handleResponseActionFunction(action , actionResultPromise);
		// log the response
		// actionResultPromise.then((response) => {
		// 	console.log("Response", response);
		// });
		vscode.window.showInformationMessage("Executing program");
	}
}

/**
     * Handle the response from the remote tool service
     * 
     * @param {Object} action 
     * @param {Promise} requestPromise
     */
function handleResponseActionFunction(action, requestPromise){
        
	requestPromise.then( (responseText) => {

		var response = JSON.parse(responseText);
		console.log("Response", response);
		const outputPanel = activityManager.findPanel( action.output.id, panels);

		var outputConsole;
		if (action.outputConsole != null){
			outputConsole = activityManager.findPanel(action.outputConsole.id, panels);
		} else {
			outputConsole = outputPanel;
		}

		if ( Object.prototype.hasOwnProperty.call(response, "error")) {
			outputConsole.setError(response.error);
		} else {

			var responseDiagram = Object.keys(response).find( key => key.toLowerCase().includes("diagram") );

			if (response.output) {
				// Text
				outputConsole.setValue(response.output)  
			}
			
			if (response.editorUrl) {
				// Language workbench
				vscode.window.showInformationMessage("Building editor");
				checkEditorReady( response.editorStatusUrl, response.editorUrl, action.source.editorPanel, action.source.editorActivity, outputConsole);
				

			} else if (responseDiagram != undefined) {
			
				outputPanel.renderDiagram( response[responseDiagram] );
				
			} else if (response.generatedFiles) {
				// Multiple text files
				outputPanel.setGeneratedFiles(response.generatedFiles);

			} else if (response.generatedText) {
				// Generated file

				switch (action.outputType){
					case "code":
						// Text
						outputPanel.getEditor().setValue(response.generatedText.trim(), 1);
						break;

					case "html":
						// Html
						outputPanel.setOutput(response.output);
						var iframe = document.getElementById("htmlIframe");
						if (iframe == null) {
							iframe = document.createElement("iframe");
							iframe.id = "htmlIframe"
							iframe.style.height = "100%";
							iframe.style.width = "100%";
							document.getElementById(outputPanel.getId() + "Diagram").appendChild(iframe);
						}
						
						iframe.srcdoc = response.generatedText;
						break; 

					case "puml": 
					case "dot":
						// UML or Graph
						let krokiEndpoint = action.outputType === "puml" ? "plantuml" : "graphviz/svg";

						fetch(`https://kroki.io/${krokiEndpoint}`, {
							method: "POST",
							headers: {
								"Accept": "image/svg+xml",
								"Content-Type": "text/plain"
							},
							body: response.generatedText
						})
						.then(response => {
							if (!response.ok) {
								throw new Error(`HTTP error! Status: ${response.status}`);
							}
							return response.text(); // Expecting an SVG response
						})
						.then(svgData => {
							outputPanel.renderDiagram(svgData);
						})
						.catch(error => {
							console.error("Error fetching diagram:", error);
						});
						break;

						default:
							console.log("Unknown output type: " + action.outputType);
				}
			}

		} 
	}).catch( (err) => {
		vscode.window.showErrorMessage("Error executing action: " + err);
	});

}

/**
     * Poll for editor to become available. 
     * @param {String} statusUrl - the url for checking the status of the editor panel.
     * @param {String} editorInstanceUrl - the editor instance's url. 
     * @param {String} editorPanelId - the id of the editor panel.
     * @param {String} editorActivityId - TODO remove as this can be found using editorPanelId to save having to specify in config.
     * @param {Panel} logPanel - the panel to log progress to.
     */
async function checkEditorReady(statusUrl, editorInstanceUrl, editorPanelId, editorActivityId, logPanel){
	console.log("Checking editor ready: " + statusUrl);
	let response  = await fetch(statusUrl);

	if (response.status == 200){ 
		const result = await response.json();

		if (result.output){
			logPanel.setValue(result.output);
		}
		
		if (result.error){
			// Unsuccessful
			console.log("Editor failed start.");
			current_context.workspaceState.update(editorPanelId, null);
			activityManager.setActivityVisibility(editorActivityId, false);
			vscode.window.showErrorMessage("Failed to start the editor.");

		} else if (!result.editorReady){
			await new Promise(resolve => setTimeout(resolve, 2000));
			await checkEditorReady(statusUrl, editorInstanceUrl, editorPanelId, editorActivityId, logPanel);

		} else {
			// Successful 
			console.log("Editor ready.");
			current_context.workspaceState.update( editorPanelId , editorInstanceUrl );
			console.log("Workspace state", current_context.workspaceState);
			activityManager.setActivityVisibility(editorActivityId, true);
			PlaygroundUtility.successNotification("Building complete.");
			vscode.window.showInformationMessage("Building complete.");
		}

	} else {
		console.log("ERROR: The editor response could not be checked: " + statusUrl);
		vscode.window.showErrorMessage("Failed to start the editor.");
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

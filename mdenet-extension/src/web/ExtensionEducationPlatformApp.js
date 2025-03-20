import { GeneralEducationPlatformApp } from "../../../platform/interfaces/GeneralEducationPlatformApp";
import { ExtensionButton } from "./ExtensionButton";
import { ExtensionProgramPanel } from "./ExtensionProgramPanel";
import { ExtensionConsolePanel } from "./ExtensionConsolePanel";
import { ExtensionOutputPanel } from "./ExtensionOutputPanel";
import { ExtensionCompositePanel } from "./ExtensionCompositePanel"; 
import { ExtensionErrorHandler } from "./ExtensionErorrHandler";
import * as vscode from 'vscode';
import { ExtensionToolsManager } from "./ExtensionToolsManager";
import { ExtensionActivityManager } from "./ExtensionActivityManager";
import { LocalRepoManager } from "./LocalRepoManager";

class ExtensionEducationPlatformApp extends GeneralEducationPlatformApp {
    constructor(context, provider, activityLabel){;
        const errorHandler = new ExtensionErrorHandler();
        super(errorHandler);
        this.wsUri = "ws://localhost:8080/tools/xtext/services/xtext/ws";
        this.context = context;
        this.provider = provider;
        this.activityLabel = activityLabel;
        this.fileHandler = new LocalRepoManager();
    }

    async initializeActivity(){
        const toolManager = new ExtensionToolsManager(this.errorHandler.notify.bind(this.errorHandler));
        const activityManager = new ExtensionActivityManager(toolManager.getPanelDefinition.bind(toolManager), this.fileHandler, this.provider, this.context, this.activityLabel);
        await super.initializeActivity(toolManager, activityManager, []);

    }

    handleToolImports(toolImports){
        console.log("Handling tool imports");
    }

    addToolIconStyles(toolUrl){
        console.log("Adding tool icon styles");
    }

    displayErrors(errors){
        for (let error of errors){
            vscode.window.showErrorMessage(error.message);
        }
    }

    async createPanel(panel, panelDefinition, newPanelId){
        let newPanel = null;
        console.log("Creating panel", panelDefinition.panelclass);
        switch(panelDefinition.panelclass){
			case "ProgramPanel":{
				newPanel = new ExtensionProgramPanel(newPanelId,panel.file);
				await newPanel.initialize();
				newPanel.setType(panelDefinition.language);
				break;
			}
			case "ConsolePanel":{
				newPanel = new ExtensionConsolePanel(newPanelId);
                newPanel.initialize();
				break;
			}
			case "CompositePanel":{
				newPanel = new ExtensionCompositePanel(newPanelId);
				if(panel.childPanels){
					for (let childPanelConfig of panel.childPanels){
						var childPanel = await this.createPanelForDefinitionId(childPanelConfig);
						newPanel.addPanel(childPanel);
					}
				}
                newPanel.initialize();
				break;
			}
			case "OutputPanel":{
				console.log(panel)
				newPanel = new ExtensionOutputPanel(newPanelId, panel.name, panelDefinition.language);
                newPanel.initialize();
				break;
			}
			case "XtextEditorPanel":{
				let editorUrl = this.context.workspaceState.get(newPanelId);
				newPanel = new ExtensionProgramPanel(newPanelId,panel.file);
				await newPanel.initialize();
				newPanel.setType(panelDefinition.language);
				break
			}
			default:{
				throw new Error("Panel class not found");
				break;
			}
		}
        return newPanel;
    }

    createButtons(buttons, panelId){
        return ExtensionButton.createButtons(buttons, panelId);
    }
    
    getVisiblePanels(){
        let visiblePanels = [];
        console.log("Getting visible panels for activity", this.activity);
        const layout = this.activity.layout.area;
        for(let i = 0; i < layout.length; i++){
            for(let j = 0; j < layout[i].length; j++){
                const panel = this.panels.find(panel => panel.getId() === layout[i][j]);
                if(panel){
                    visiblePanels.push(panel);
                }
                else{
                    throw new Error("Panel not found");
                }
            }
        }
        return visiblePanels;
    }

    displayLongMessage(message){
        vscode.window.showInformationMessage(message);
    }

    displaySuccessMessage(message){
        vscode.window.showInformationMessage(message);
    }

    removeNotification(){
       console.log("Removing notification");
    }

    updateSessionInfo(editorPanelId, editorInstanceUrl){
        //replace the origin of editorInstanceUrl with http://localhost:8080
        editorInstanceUrl = editorInstanceUrl.replace(/https:\/\/ep.mde-network\.org/,"http://localhost:8080");
        this.context.workspaceState.update(editorPanelId,editorInstanceUrl);
        console.log("Updated session info",this.context.workspaceState);
    }

    async switchActivityTask(task){
        this.activityManager.setSelectedActivity(task);
        this.activity = this.activityManager.getSelectedActivity();
        await this.initializePanels()

        
    }



}

export { ExtensionEducationPlatformApp }
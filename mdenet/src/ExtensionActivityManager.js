const vscode = require('vscode');
const { GeneralActivityManager } = require('../../platform-commonjs/interfaces/GeneralActivityManager');
const { parseConfigFile } = require('../../platform-commonjs/src/Utility.js');

class ExtensionActivityManager extends GeneralActivityManager {

    provider;
    context;
    lable;

    constructor(panelDefAccessor, fileHandler, provider, context, label) {
        super(panelDefAccessor, fileHandler);
        this.provider = provider;
        this.context = context;
        this.label = label;
    }

    fetchActivities() {
        let errors = [];
        let fileContent;
        try {
            let fileContent = this.fileHandler.fetchActivityFile(this.label);
            if (fileContent != null){
                errors = this.processActivityConfig(fileContent,errors);
            }
            return errors;
        }
        catch (error) {
            errors.push(error);
        }
        return errors;
    }

    getPanelFileLocation(panelURL){
        return panelURL;
    }

    handlePanelFile(panel,file){
        panel.file = file;
    }

    fetchFile(filePath){
        return vscode.workspace.workspaceFolders[0].uri.fsPath + '/' + filePath;
    }

    createActivitiesMenu(config){
        for (const activity of config.activities){
            if (activity.id) {
                this.storeActivity(activity);
            }
        }
        if (config.activities) {
            this.provider.setTasks(config.activities);
        } else {
            vscode.window.showWarningMessage('No activities found in the file.');
        }
    }

    setActivityVisibility(activityId, visible){
        if(visible){
            this.provider.showTask(activityId);
        }
        else{
            this.provider.hideTask(activityId);
        }
    }

    isPanelGenerated(panelId){
        return this.context.workspaceState.get(panelId, false);
    }

    hideActivitiesNavEntries(){
        for(var activityKey of Object.keys(this.activities)) {
            // Show activities that have no generated panels
            if (this.hasGeneratedPanel(activityKey)){
                this.setActivityVisibility(activityKey, false);
            }
        }
    }

    interpolate(someString){
        let result = someString;

        // Retrieve all stored keys
        const storedKeys = this.context.workspaceState.keys();

        for (let currentKey of storedKeys) {
            if (currentKey !== "isAuthenticated") {
                // Retrieve stored value
                let storedValue = this.context.workspaceState.get(currentKey, "").replace(/\/$/, ""); // Remove trailing slash

                // Replace placeholder in the string
                result = result.replace(`{{ID-${currentKey}}}`, storedValue);
            }
        }

        return result;
    }
}

module.exports = ExtensionActivityManager;
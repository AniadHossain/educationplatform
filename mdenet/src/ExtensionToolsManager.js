const { ToolManager } = require('../../platform-commonjs/src/ToolsManager')
const { utility } = require('../../platform-commonjs/src/Utility');
const ExtensionError = require('./ExtensionError');

class ExtensionToolsManager extends ToolManager {
    constructor() {
        super();
    }

    async setToolsUrls(urls){
        if(this.toolsUrls==null) {

            this.toolsUrls = [];
            
            for(let url of urls){
                
                let toolUrl = new Object();
                toolUrl.id = ""; // Populate when tool is fetched
                if(this.isIDPlaceHolder(url)){
                    // url is in the form of {{ID-...}}, no modification needed
                    toolUrl.url = url;
                }
                else if (this.isBaseUrlPlaceHolder(url)){
                    // the url variable is a placeholder, so it needs to be re-written with the correct path
                    var url_tail = '';
                    let url_port = this.getPort(url);

                    if(url.indexOf('/') > 0){
                        url_tail = url.split('/')[1];
                    }

                    if (url_port != null){
                        let path = this.fetchPathByPort(url_port);

                        if(path != null){
                            let base_url = utility.getBaseURL();
                            path = path.endsWith('/') ? path : path + '/';
                            toolUrl.url = base_url + path + url_tail;
                        }
                    }
                    else{
                        toolUrl.url = url;
                    }
                }
                else if (this.isValidUrl(url)){
                    // the url variable is hardcoded in the activity file, so no need for re-writing
                    toolUrl.url = url;
                }
                else{
                    // something is wrong
                    this.configErrors.push(new ExtensionError(`${url} is not a valid URL or a valid URL placeholder.`))
                }
                
                this.toolsUrls.push(toolUrl);
            }

            this.configErrors = this.configErrors.concat( await this.fetchTools() );
            this.registerToolFunctions();
            this.createClassesFromConfig();
        }
    }

    async fetchTools() {
        let errors = [];

        for (let toolUrl of this.toolsUrls) {
            try {
                const response = await fetch(toolUrl.url);

                if (!response.ok) {
                    errors.push(new ExtensionError(`A tool configuration file was not accessible at: ${toolUrl.url}.
                                                            Check the tool's URL in the activity file and ensure the tool 
                                                            service is available.`));
                    continue;
                }

                let responseText = await response.text(); // Read response as text

                // var toolConfig = this.rewriteUrl(utility.getBaseURL(), toolUrl.url, responseText);
                var toolConfig = this.rewriteUrl("extension-platform", toolUrl.url, responseText);
                // console.log("From extensionToolsManager",toolConfig);
                // Now parse tool config
                let validatedConfig = this.parseAndValidateToolConfig(toolConfig);

                if (validatedConfig.errors.length === 0) {
                    const config = validatedConfig.config;

                    // Store the tool found in the given JSON
                    if (config.tool.id) {
                        this.storeTool(config.tool);
                        toolUrl.id = config.tool.id;

                        // TODO: Update any tool management menu.
                    }
                } else {
                    // Tool file parsing error
                    errors = errors.concat(validatedConfig.errors);
                }
            } catch (err) {
                if (err instanceof TypeError) {
                    errors.push(new ExtensionError(`A tool configuration file was not accessible at: ${toolUrl.url}.
                                                            Check the tool's URL in the activity file and ensure the tool 
                                                            service is available.`));
                } else {
                    throw err;
                }
            }
        }

        return errors;
    }

    getTools(){
        return this.tools;
    }
}

module.exports = ExtensionToolsManager;
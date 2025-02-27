const { FunctionRegistry } = require('../../platform-commonjs/src/FunctionRegistry');
const { jsonRequestConversion, jsonRequest } = require('./Utility'); 

class ExtensionFunctionRegistry extends FunctionRegistry {
    constructor(theToolsManager) {
        super(theToolsManager);
    }

    /**
     * 
     * @param {string} functionId url of the function to call
     * @param {Object} parameters object containing the parameters request data
     * @returns 
     */
    call(functionId, parameters ){

        let actionFunction = this.toolsManager.getActionFunction(functionId);
        let parametersJson = JSON.stringify(parameters);

        let requestPromise = jsonRequest(actionFunction.getPath(), parametersJson)

        return requestPromise;
    }

    /**
     * Requests the conversion function from the remote tool service
     * 
     * @param {Object} parameters 
     * @param {ActionFunction} conversionFunction
     * @param {String} parameterName name of the parameter
     * @returns Promise for the translated data
     */
    requestTranslation(parameters, conversionFunction, parameterName){
        
        let parametersJson = JSON.stringify(parameters);

        return jsonRequestConversion(conversionFunction.getPath(), parametersJson, parameterName);
    }
    
}

module.exports = ExtensionFunctionRegistry;
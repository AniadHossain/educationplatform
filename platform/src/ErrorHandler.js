import { EducationPlatformError } from "./EducationPlatformError";

class ErrorHandler {

    displayError;

    /**
     * @param {Function} notifier - The function to use for displaying error messages. 
     */
    constructor(notifier){

        this.displayError = notifier;

        window.onerror = (event, source, lineno, colno, err) => {
            
            this.notify("An unexpected error has occurred", err);

            // TODO log unhandled exceptions/errors to remote server
        };
    }

    /**
     * Displays the given error 
     * @param message - The message to display if provided
     * @param {EducationPlatformError} error - The error to display if provided
     */
    notify(message, error){
        let displayMessage = "";

        if (message){
            displayMessage = message;
        }

        if (message && error){
            displayMessage += "<br><br>"
        }

        if (error) {
            if (error instanceof EducationPlatformError){
                displayMessage += `<i>${error.message}</i>`;
            } else if (error instanceof Error){ 
                // Other errors mark as unknown
                displayMessage += `<i>${error.constructor.name} - ${error.message}</i>`;
            } else {
                // Anything else mark as unknown
                displayMessage += `<i>value - ${String(error)}</i>`;
            }
        }

        this.displayError(displayMessage);
    }
    
}

export {ErrorHandler}
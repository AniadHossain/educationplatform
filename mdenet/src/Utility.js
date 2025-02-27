/**
 * Posts a json request to the given url.
 * @param {String} url the destination url
 * @param {String} json the data to send
 * @param {boolean} useCredentials xhr setting
 * @returns Promise to the response
 */
function jsonRequest(url, json, useCredentials = false) {
    return new Promise(function(resolve, reject) {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: json,
            credentials: useCredentials ? "include" : "same-origin"
        })
        .then(response => {
            if (!response.ok) {
                reject({
                    status: response.status,
                    statusText: response.statusText
                });
            } else {
                return response.text();
            }
        })
        .then(data => resolve(data))
        .catch(error => reject({
            status: error.status || 0,
            statusText: error.statusText || "Network error"
        }));
    });
}


/**
 * Posts a json request to the given url formatting the respose in the format expected
 * of conversion function Promises.
 * @param {String} url the destination url
 * @param {String} json the data to send
 * @param {String} parameterName the paramter name
 * @returns Promise to the response
 */
function jsonRequestConversion(url, json, parameterName) {
    return new Promise(function (resolve, reject) {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: json
        })
        .then(response => {
            if (!response.ok) {
                reject({
                    status: response.status,
                    statusText: response.statusText
                });
            }
            return response.json(); // Parse the JSON response
        })
        .then(responseData => {
            resolve({
                name: parameterName,
                data: responseData.output
            });
        })
        .catch(error => {
            reject({
                status: error.status || 0,
                statusText: error.statusText || "Network error"
            });
        });
    });
}


module.exports = {
    jsonRequest,
    jsonRequestConversion
}
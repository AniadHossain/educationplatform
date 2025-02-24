class ExtensionError extends Error {
    constructor(message) {
        super(message);
        this.name = "ExtensionError";
    }
}

module.exports = ExtensionError;
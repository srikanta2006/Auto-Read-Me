/**
 * Abstract Base Class for AI Providers
 */
export class AIProvider {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Validates the API key by making a lightweight request (e.g., list models).
     * @returns {Promise<boolean>}
     */
    async validate() {
        throw new Error("Method 'validate()' must be implemented.");
    }

    /**
     * Lists available models for this provider.
     * @returns {Promise<string[]>} List of model IDs
     */
    async listModels() {
        throw new Error("Method 'listModels()' must be implemented.");
    }

    /**
     * Generates content using the specified model.
     * @param {string} model - Model ID
     * @param {string} prompt - The prompt to send
     * @returns {Promise<string>} The generated text
     */
    async generate(model, prompt) {
        throw new Error("Method 'generate()' must be implemented.");
    }
}

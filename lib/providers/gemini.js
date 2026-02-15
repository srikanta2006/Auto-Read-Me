import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./base.js";
import chalk from 'chalk';

export class GeminiProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.client = new GoogleGenerativeAI(apiKey);
    }

    async validate() {
        try {
            const models = await this.listModels();
            return models.length > 0;
        } catch (e) {
            return false;
        }
    }

    async listModels() {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (!response.ok) {
                if (response.status === 400 || response.status === 403) {
                    throw new Error("Invalid API Key");
                }
                throw new Error(`Failed to list models: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.models) return [];

            return data.models
                .filter(m => {
                    // 1. Must support generateContent
                    if (!m.supportedGenerationMethods || !m.supportedGenerationMethods.includes("generateContent")) return false;

                    // 2. If outputModalities is defined, it MUST include "TEXT"
                    // (Some models only output AUDIO or IMAGE)
                    if (m.outputModalities && !m.outputModalities.includes("TEXT")) return false;

                    // 3. Heuristic: Filter out specific incompatible variations if metadata is missing/unclear
                    if (m.name.toLowerCase().includes("tts")) return false;
                    if (m.name.toLowerCase().includes("vision-only")) return false;

                    return true;
                })
                .map(m => m.name.replace("models/", ""));
        } catch (e) {
            if (e.message.includes("Invalid API Key")) throw e;

            // If listing fails, we should NOT provide a fallback list because it leads to 404s 
            // if the user selects a model they don't have access to.
            // Instead, let's propagate the error or return empty to force a retry/check.
            console.error(chalk.red(`\n✖ Error listing models: ${e.message}`));
            throw new Error("Could not fetch available models. Check your network or API key.");
        }
    }

    async generate(modelName, prompt) {
        let lastError;
        // Exponential backoff strategy: 2s, 4s, 8s
        const backoffDelays = [2000, 4000, 8000];

        for (let attempt = 0; attempt <= backoffDelays.length; attempt++) {
            try {
                const model = this.client.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                lastError = error;
                const isRateLimit = error.message.includes("429") ||
                    error.message.includes("Quota") ||
                    (error.status === 429);

                // If 429 and we have retries left
                if (isRateLimit && attempt < backoffDelays.length) {
                    const delay = backoffDelays[attempt];
                    // Cleanly clear line and log warning so spinner can resume below?
                    // Actually, if we just console.log, it might mess up spinner.
                    // But we don't have access to spinner here.
                    // Let's just log a warning.
                    console.warn(chalk.yellow(`\n⚠️  Rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${backoffDelays.length})`));

                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // If we're out of retries or it's not a rate limit error, throw.
                break;
            }
        }

        if (lastError) {
            if (lastError.message.includes("429") || lastError.message.includes("Quota")) {
                throw new Error("💰 Quota Exceeded (429). I tried 3 times but the API is busy. Please try a different model (e.g., Flash) or wait a minute.");
            }
            throw lastError;
        }
    }
}

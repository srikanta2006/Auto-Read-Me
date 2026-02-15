import OpenAI from "openai";
import { AIProvider } from "./base.js";
import chalk from 'chalk';

export class OpenAIProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.client = new OpenAI({ apiKey });
    }

    async validate() {
        try {
            await this.client.models.list();
            return true;
        } catch (e) {
            return false;
        }
    }

    async listModels() {
        const list = await this.client.models.list();
        // Filter for chat models primarily and sort intelligently
        return list.data
            .filter(m => m.id.startsWith("gpt-4") || m.id.startsWith("gpt-3.5"))
            .map(m => m.id)
            .sort((a, b) => {
                // Pin gpt-4o to top if available
                if (a.includes("gpt-4o") && !b.includes("gpt-4o")) return -1;
                if (!a.includes("gpt-4o") && b.includes("gpt-4o")) return 1;
                // Otherwise normal sort (newer usually better but alphabetical is okay)
                return b.localeCompare(a); // Reverse alphabetical to put higher numbers (gpt-4) on top
            });
    }

    async generate(model, prompt) {
        // Exponential backoff strategy: 2s, 4s, 8s
        const backoffDelays = [2000, 4000, 8000];

        for (let attempt = 0; attempt <= backoffDelays.length; attempt++) {
            try {
                const completion = await this.client.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: model,
                });
                return completion.choices[0].message.content;
            } catch (error) {
                const isRateLimit = error.status === 429;
                const isServerOverload = error.status >= 500;

                if ((isRateLimit || isServerOverload) && attempt < backoffDelays.length) {
                    const delay = backoffDelays[attempt];
                    console.warn(chalk.yellow(`\n⚠️  OpenAI busy/limited. Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${backoffDelays.length})`));
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (isRateLimit) {
                    throw new Error("💰 OpenAI Quota Exceeded (429). Please check your plan or try a different model.");
                }
                throw error;
            }
        }
    }
}

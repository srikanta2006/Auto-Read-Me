import Anthropic from "@anthropic-ai/sdk";
import { AIProvider } from "./base.js";
import chalk from 'chalk';

export class AnthropicProvider extends AIProvider {
    constructor(apiKey) {
        super(apiKey);
        this.client = new Anthropic({ apiKey });
    }

    async validate() {
        try {
            // Anthropic doesn't have a lightweight list models endpoint we can hit easily with just a key in all contexts,
            // but we can try a very small completion with a known model to validate.
            // Using a cheaper model for validation
            await this.generate("claude-3-haiku-20240307", "Hello");
            return true;
        } catch (e) {
            // If it fails with authentication error, return false.
            if (e.status === 401) return false;
            // If it fails because of model, it might still be a valid key but just that model.
            // But for now, let's assume if we can't run a simple prompt, it's invalid.
            return false;
        }
    }

    async listModels() {
        // Anthropic doesn't provide a dynamic list endpoint for clients.
        return [
            "claude-3-5-sonnet-20240620",
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307"
        ];
    }

    async generate(model, prompt) {
        // Exponential backoff strategy: 2s, 4s, 8s
        const backoffDelays = [2000, 4000, 8000];

        for (let attempt = 0; attempt <= backoffDelays.length; attempt++) {
            try {
                const msg = await this.client.messages.create({
                    model: model,
                    max_tokens: 4000,
                    messages: [{ role: "user", content: prompt }],
                });
                return msg.content[0].text;
            } catch (error) {
                const isRateLimit = error.status === 429;
                const isOverloaded = error.status === 529;
                const isServerOverload = error.status >= 500;

                if ((isRateLimit || isOverloaded || isServerOverload) && attempt < backoffDelays.length) {
                    const delay = backoffDelays[attempt];
                    const reason = isRateLimit ? "Rate limited" : "Overloaded";
                    console.warn(chalk.yellow(`\n⚠️  Anthropic ${reason}. Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${backoffDelays.length})`));
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (isRateLimit) {
                    throw new Error("💰 Anthropic Quota Exceeded (429). Please check your plan or try a different model.");
                }
                if (isOverloaded) {
                    throw new Error("🐢 Anthropic API is Overloaded (529). Please try again later.");
                }
                throw error;
            }
        }
    }
}

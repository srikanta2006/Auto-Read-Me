import { GeminiProvider } from "./providers/gemini.js";
import { OpenAIProvider } from "./providers/openai.js";
import { AnthropicProvider } from "./providers/anthropic.js";

export class ProviderFactory {
    static get(providerName, apiKey) {
        switch (providerName.toLowerCase()) {
            case 'google':
            case 'gemini':
                return new GeminiProvider(apiKey);
            case 'openai':
                return new OpenAIProvider(apiKey);
            case 'anthropic':
            case 'claude':
                return new AnthropicProvider(apiKey);
            default:
                throw new Error(`Unknown provider: ${providerName}`);
        }
    }

    static detectProvider(apiKey) {
        if (apiKey.startsWith('sk-ant')) return 'anthropic';
        if (apiKey.startsWith('sk-proj') || apiKey.startsWith('sk-')) return 'openai'; // OpenAI keys usually start with sk-
        return 'gemini'; // Fallback / Google keys don't have a strict prefix that is unique enough to be 100% sure without validation, but often generic
    }
}

import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export function getLLM(providerWithName: string, apiKey: string) {
    const commonConfig = {
        temperature: 0.5,
        maxRetries: 2,
    };

    // Extract provider from "name:provider" format
    const provider = providerWithName.split(':')[1] ?? providerWithName;
    const modelName = providerWithName.split(':')[0] ?? "gpt-4o-mini";

    switch (provider) {
        case "openai":
            return new ChatOpenAI({
                ...commonConfig,
                apiKey,
                modelName,
            });
        case "anthropic":
            return new ChatAnthropic({
                ...commonConfig,
                apiKey,
                modelName,
            });
        case "google":
            return new ChatGoogleGenerativeAI({
                ...commonConfig,
                apiKey,
                modelName,
            });
        case "groq":
            return new ChatGroq({
                ...commonConfig,
                apiKey,
                modelName,
            }).bind({
                response_format: { type: "json_object" },
            });
        case "openrouter":
            return new ChatOpenAI({
                ...commonConfig,
                apiKey,
                modelName,
                configuration: {
                    baseURL: "https://openrouter.ai/api/v1"
                }
            });
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

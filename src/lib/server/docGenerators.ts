import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getLLM } from "@/lib/utils/llmProvider";
import {
    systemMessage,
    projectBriefPrompt,
    productContextPrompt,
    activeContextPrompt,
    systemPatternsPrompt,
    techContextPrompt
} from "@/lib/utils/prompts";
import { ProjectBrief, ProductContext, ActiveContext, SystemPatterns, TechContext } from "@/types/docs-agent.dto";
import { DocsAgentStateType } from "./docsAgent";

export async function generateProjectBrief(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            new SystemMessage(systemMessage),
            new HumanMessage(projectBriefPrompt(state)),
        ]);
        const parser = new JsonOutputParser<ProjectBrief>();
        const chain = prompt.pipe(getLLM(state.provider, state.apiKey)).pipe(parser);
        const response = await chain.invoke({
            idea: state.idea,
        });
        return {
            projectbrief: response.projectbrief,
            summary: state.summary + "\n" + "Project Brief: " + response.summary,
        };
    } catch (error) {
        console.error("Error generating project brief:", error);
        return {
            projectbrief: "",
            summary: state.summary + "\n" + "Project Brief: Error generating project brief",
        };
    }
}

export async function generateProductContext(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            new SystemMessage(systemMessage),
            new HumanMessage(productContextPrompt(state)),
        ]);
        const parser = new JsonOutputParser<ProductContext>();
        const chain = prompt.pipe(getLLM(state.provider, state.apiKey)).pipe(parser);
        const response = await chain.invoke({
            idea: state.idea,
            techStack: state.techStack,
            features: state.features,
            overview: state.summary,
        });
        return {
            productContext: response.productcontext,
            summary: state.summary + "\n" + "Product Context: " + response.summary,
        };
    } catch (error) {
        console.error("Error generating product context:", error);
        return {
            productContext: "",
            summary: state.summary + "\n" + "Product Context: Error generating product context",
        };
    }
}

export async function generateActiveContext(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            new SystemMessage(systemMessage),
            new HumanMessage(activeContextPrompt(state)),
        ]);
        const parser = new JsonOutputParser<ActiveContext>();
        const chain = prompt.pipe(getLLM(state.provider, state.apiKey)).pipe(parser);
        const response = await chain.invoke({
            idea: state.idea,
            techStack: state.techStack,
            features: state.features,
            overview: state.summary,
        });
        return {
            activeContext: response.activecontext,
            summary: state.summary + "\n" + "Active Context: " + response.summary,
        };
    } catch (error) {
        console.error("Error generating active context:", error);
        return {
            activeContext: "",
            summary: state.summary + "\n" + "Active Context: Error generating active context",
        };
    }
}

export async function generateSystemPatterns(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            new SystemMessage(systemMessage),
            new HumanMessage(systemPatternsPrompt(state)),
        ]);
        const parser = new JsonOutputParser<SystemPatterns>();
        const chain = prompt.pipe(getLLM(state.provider, state.apiKey)).pipe(parser);
        const response = await chain.invoke({
            idea: state.idea,
            techStack: state.techStack,
            features: state.features,
            overview: state.summary,
        });
        return {
            systemPatterns: response.systempatterns,
            summary: state.summary + "\n" + "System Patterns: " + response.summary,
        };
    } catch (error) {
        console.error("Error generating system patterns:", error);
        return {
            systemPatterns: "",
            summary: state.summary + "\n" + "System Patterns: Error generating system patterns",
        };
    }
}

export async function generateTechContext(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            new SystemMessage(systemMessage),
            new HumanMessage(techContextPrompt(state)),
        ]);
        const parser = new JsonOutputParser<TechContext>();
        const chain = prompt.pipe(getLLM(state.provider, state.apiKey)).pipe(parser);
        const response = await chain.invoke({
            idea: state.idea,
            techStack: state.techStack,
            features: state.features,
            overview: state.summary,
        });
        return {
            techContext: response.techcontext,
            summary: state.summary + "\n" + "Tech Context: " + response.summary,
        };
    } catch (error) {
        console.error("Error generating tech context:", error);
        return {
            techContext: "",
            summary: state.summary + "\n" + "Tech Context: Error generating tech context",
        };
    }
}

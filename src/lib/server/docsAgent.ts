'use server';
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { writeFile } from "fs/promises";
import { ChatOpenAI } from "@langchain/openai";
import JSZip from "jszip";
import path from "path";
import { env } from "@/env";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { AgentState, ProjectBrief, ProductContext, ActiveContext, SystemPatterns, TechContext } from "@/types/docs-agent.dto";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

function getLLM(provider: string, apiKey: string) {
  const commonConfig = {
    temperature: 0.5,
    maxRetries: 2,
  };

  switch (provider) {
    case "openai":
      return new ChatOpenAI({
        ...commonConfig,
        apiKey,
        modelName: "gpt-4-turbo-preview",
      });
    case "anthropic":
      return new ChatAnthropic({
        ...commonConfig,
        apiKey,
        modelName: "claude-3-opus-20240229",
      });
    case "google":
      return new ChatGoogleGenerativeAI({
        ...commonConfig,
        apiKey,
        modelName: "gemini-pro",
      });
    case "groq":
      return new ChatGroq({
        ...commonConfig,
        apiKey,
        modelName: "llama3-70b-8192",
      }).bind({
        response_format: { type: "json_object" },
      });
    case "openrouter":
      return new ChatOpenAI({
        ...commonConfig,
        apiKey,
        modelName: "deepseek/deepseek-chat:free",
        configuration: {
          baseURL: "https://openrouter.ai/api/v1"
        }
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}


const DocsAgentState = Annotation.Root({
  idea: Annotation<string>,
  techStack: Annotation<string>,
  features: Annotation<string>,
  projectbrief: Annotation<string>,
  productContext: Annotation<string>,
  activeContext: Annotation<string>,
  systemPatterns: Annotation<string>,
  techContext: Annotation<string>,
  summary: Annotation<string>,
  provider: Annotation<string>,
  apiKey: Annotation<string>,
});

type DocsAgentStateType = typeof DocsAgentState.State;



const systemMessage = "You are an expert project/product manager. You are tasked with generating documentation for a project. Each document should be in markdown format. The documents should be well-organized, concise, and easy to understand.";

// Define the prompts for generating each part of the documentation
const projectBriefPrompt = (params: DocsAgentStateType) => `
  Given the following idea, tech stack, and features, generate a project brief that defines the core requirements and goals for the project.

  Idea: ${params.idea}
  Tech Stack: ${params.techStack}
  Features: ${params.features}
  overview: ${params.summary}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {{
      "summary": "A concise 1-2 sentence summary of the project brief",
      "projectbrief": "The full project brief content in markdown format"
    }}
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `;

const productContextPrompt = (params: DocsAgentStateType) => `
  Given the following project brief, idea, tech stack, and features, generate a product context that describes why this project exists, what problems it solves, how it should work, and what the user experience goals are.

  Idea: ${params.idea}
  Tech Stack: ${params.techStack}
  Features: ${params.features}
  overview: ${params.summary}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {{
      "summary": "A concise 1-2 sentence summary of the product context", 
      "productcontext": "The full product context content in markdown format"
    }}
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `;

const activeContextPrompt = (params: DocsAgentStateType) => `
  Given the following project brief, product context, idea, tech stack, and features, generate an active context that describes the current work focus, recent changes, next steps, and active decisions and considerations.

  Idea: ${params.idea}
  Tech Stack: ${params.techStack}
  Features: ${params.features}
  overview: ${params.summary}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {{
      "summary": "A concise 1-2 sentence summary of the active context",
      "activecontext": "The full active context content in markdown format including initial steps"
    }}
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `;

const systemPatternsPrompt = (params: DocsAgentStateType) => `
  Given the following project brief, product context, active context, idea, tech stack, and features, generate a system patterns document that describes the system architecture, key technical decisions, design patterns in use, and component relationships.

Idea: ${params.idea}
Tech Stack: ${params.techStack}
Features: ${params.features}
overview: ${params.summary}

Must follow these instructions EXACTLY:
1. Your response MUST be a valid JSON object
2. The JSON object MUST follow this exact structure:
{{
  "summary": "A concise 1-2 sentence summary of the system patterns",
  "systempatterns": "The full system patterns content in markdown format"
}}
3. Do NOT include any text outside the JSON object
4. Do NOT include any comments or explanations
5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
6. After new lines put a space. For eg- "\n+-------" will be writtten as "\n +-------"
`;

const techContextPrompt = (params: DocsAgentStateType) => `
  Given the following project brief, product context, active context, system patterns, idea, tech stack, and features, generate a tech context document that lists the technologies used, development setup, technical constraints, and dependencies.

  Idea: ${params.idea}
  Tech Stack: ${params.techStack}
  Features: ${params.features}
  overview: ${params.summary}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {{
      "summary": "A concise 1-2 sentence summary of the tech context",
      "techcontext": "The full tech context content in markdown format"
    }}
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `;

const graph = new StateGraph(DocsAgentState);

// Define nodes for the graph
async function generateProjectBrief(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
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

async function generateProductContext(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
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

async function generateActiveContext(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
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

async function generateSystemPatterns(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
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

async function generateTechContext(state: DocsAgentStateType): Promise<Partial<DocsAgentStateType>> {
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

// After all the node definitions, add back the graph workflow
graph.addNode("generateProjectBrief", generateProjectBrief)
  .addNode("generateProductContext", generateProductContext)
  .addNode("generateActiveContext", generateActiveContext)
  .addNode("generateSystemPatterns", generateSystemPatterns)
  .addNode("generateTechContext", generateTechContext)
  .addEdge(START, "generateProjectBrief")
  .addEdge("generateProjectBrief", "generateProductContext")
  .addEdge("generateProductContext", "generateActiveContext")
  .addEdge("generateActiveContext", "generateSystemPatterns")
  .addEdge("generateSystemPatterns", "generateTechContext")
  .addEdge("generateTechContext", END);

const app = graph.compile();

// Main function to run the graph
export async function generateAndDownloadDocs(idea: string, techStack: string, features: string, provider: string, apiKey: string) {
  const docs = await generateDocs(idea, techStack, features, provider, apiKey);

  // Create zip file
  const zip = new JSZip();
  zip.file("projectbrief.md", docs.projectbrief);
  zip.file("productContext.md", docs.productContext);
  zip.file("activeContext.md", docs.activeContext);
  zip.file("systemPatterns.md", docs.systemPatterns);
  zip.file("techContext.md", docs.techContext);
  zip.file("progress.md", "Starting to work on the project...");

  const zipContent = await zip.generateAsync({ type: "base64" });

  return {
    zipContent,
    fileName: "memory-bank.zip"
  };
}

export async function generateDocs(idea: string, techStack: string, features: string, provider: string, apiKey: string) {
  const initialState: DocsAgentStateType = {
    idea,
    techStack,
    features,
    projectbrief: "",
    productContext: "",
    activeContext: "",
    systemPatterns: "",
    techContext: "",
    summary: "",
    provider,
    apiKey
  };

  const result = await app.invoke(initialState);

  return {
    projectbrief: result.projectbrief,
    productContext: result.productContext,
    activeContext: result.activeContext,
    systemPatterns: result.systemPatterns,
    techContext: result.techContext,
    summary: result.summary
  };
}

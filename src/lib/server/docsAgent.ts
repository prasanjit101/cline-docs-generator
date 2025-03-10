'use server';
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { writeFile } from "fs/promises";
import { ChatOpenAI } from "@langchain/openai";
import path from "path";
import { env } from "@/env";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { AgentState, ProjectBrief, ProductContext, ActiveContext, SystemPatterns, TechContext } from "@/types/docs-agent.dto";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";


const groqModelJSON = new ChatGroq({
  modelName: "llama3-70b-8192",
  apiKey: env.GROQ_API_KEY,
  temperature: 0.5,
  maxRetries: 2,
}).bind({
  response_format: { type: "json_object" },
});

const systemMessage = new SystemMessage("You are an expert project/product manager. You are tasked with generating documentation for a project. Each document should be in markdown format. The documents should be well-organized, concise, and easy to understand.");

// Define the prompts for generating each part of the documentation
const projectBriefPrompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  new HumanMessage(`
  Given the following idea, tech stack, and features, generate a project brief that defines the core requirements and goals for the project.

  Idea: {idea}
  Tech Stack: {techStack}
  Features: {features}
  overview: {overview}
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {
      "summary": "A concise 1-2 sentence summary of the project brief",
      "projectbrief": "The full project brief content in markdown format"
    }
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `),
]);

const productContextPrompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  new HumanMessage(`
  Given the following project brief, idea, tech stack, and features, generate a product context that describes why this project exists, what problems it solves, how it should work, and what the user experience goals are.

  Idea: {idea}
  Tech Stack: {techStack}
  Features: {features}
  overview: {overview}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {
      "summary": "A concise 1-2 sentence summary of the product context", 
      "productcontext": "The full product context content in markdown format"
    }
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `),
]);

const activeContextPrompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  new HumanMessage(`
  Given the following project brief, product context, idea, tech stack, and features, generate an active context that describes the current work focus, recent changes, next steps, and active decisions and considerations.

  Idea: {idea}
  Tech Stack: {techStack}
  Features: {features}
  overview: {overview}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {
      "summary": "A concise 1-2 sentence summary of the active context",
      "activecontext": "The full active context content in markdown format including initial steps"
    }
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `),
]);

const systemPatternsPrompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  new HumanMessage(`
  Given the following project brief, product context, active context, idea, tech stack, and features, generate a system patterns document that describes the system architecture, key technical decisions, design patterns in use, and component relationships.

  Idea: {idea}
  Tech Stack: {techStack}
  Features: {features}
  overview: {overview}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {
      "summary": "A concise 1-2 sentence summary of the system patterns",
      "systempatterns": "The full system patterns content in markdown format"
    }
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `),
]);

const techContextPrompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  new HumanMessage(`
  Given the following project brief, product context, active context, system patterns, idea, tech stack, and features, generate a tech context document that lists the technologies used, development setup, technical constraints, and dependencies.

  Idea: {idea}
  Tech Stack: {techStack}
  Features: {features}
  overview: {overview}
  
  Must follow these instructions EXACTLY:
  1. Your response MUST be a valid JSON object
  2. The JSON object MUST follow this exact structure:
    {
      "summary": "A concise 1-2 sentence summary of the tech context",
      "techcontext": "The full tech context content in markdown format"
    }
  3. Do NOT include any text outside the JSON object
  4. Do NOT include any comments or explanations
  5. Ensure all JSON syntax is correct including proper quotes, commas, and brackets
  `),
]);


const graphState = Annotation.Root({
  idea: Annotation<string>,
  techStack: Annotation<string>,
  features: Annotation<string>,
  projectbrief: Annotation<string>,
  productContext: Annotation<string>,
  activeContext: Annotation<string>,
  systemPatterns: Annotation<string>,
  techContext: Annotation<string>,
  summary: Annotation<string>,
})

// Define nodes for the graph
async function generateProjectBrief(state: typeof graphState.State) {
  try {
    const parser = new JsonOutputParser<ProjectBrief>();
    const chain = projectBriefPrompt.pipe(groqModelJSON).pipe(parser);
    const response = await chain.invoke({
      idea: state.idea,
      techStack: state.techStack,
      features: state.features,
      overview: state.summary ?? "",
    });
    return {
      ...state,
      projectbrief: response.projectbrief,
      summary: state.summary + "\n" + "Project Brief: " + response.summary,
    };
  } catch (error) {
    console.error("Error generating project brief:", error);
    return {
      ...state,
      projectbrief: "",
      summary: state.summary + "\n" + "Project Brief: Error generating project brief",
    };
  }
}

async function generateProductContext(state: typeof graphState.State) {
  try {
    const parser = new JsonOutputParser<ProductContext>();
    const chain = productContextPrompt.pipe(groqModelJSON).pipe(parser);
    const response = await chain.invoke({
      idea: state.idea,
      techStack: state.techStack,
      features: state.features,
      overview: state.summary,
    });
    return {
      ...state,
      productContext: response.productcontext,
      summary: state.summary + "\n" + "Product Context: " + response.summary,
    };
  } catch (error) {
    console.error("Error generating product context:", error);
    return {
      ...state,
      productContext: "",
      summary: state.summary + "\n" + "Product Context: Error generating product context",
    };
  }
}

async function generateActiveContext(state: typeof graphState.State) {
  try {
    const parser = new JsonOutputParser<ActiveContext>();
    const chain = activeContextPrompt.pipe(groqModelJSON).pipe(parser);
    const response = await chain.invoke({
      idea: state.idea,
      techStack: state.techStack,
      features: state.features,
      overview: state.summary,
    });
    return {
      ...state,
      activeContext: response.activecontext,
      summary: state.summary + "\n" + "Active Context: " + response.summary,
    };
  } catch (error) {
    console.error("Error generating active context:", error);
    return {
      ...state,
      activeContext: "",
      summary: state.summary + "\n" + "Active Context: Error generating active context",
    };
  }
}

async function generateSystemPatterns(state: typeof graphState.State) {
  try {
    const parser = new JsonOutputParser<SystemPatterns>();
    const chain = systemPatternsPrompt.pipe(groqModelJSON).pipe(parser);
    const response = await chain.invoke({
      idea: state.idea,
      techStack: state.techStack,
      features: state.features,
      overview: state.summary,
    });
    return {
      ...state,
      systemPatterns: response.systempatterns,
      summary: state.summary + "\n" + "System Patterns: " + response.summary,
    };
  } catch (error) {
    console.error("Error generating system patterns:", error);
    return {
      ...state,
      systemPatterns: "",
      summary: state.summary + "\n" + "System Patterns: Error generating system patterns",
    };
  }
}

async function generateTechContext(state: typeof graphState.State) {
  try {
    const parser = new JsonOutputParser<TechContext>();
    const chain = techContextPrompt.pipe(groqModelJSON).pipe(parser);
    const response = await chain.invoke({
      idea: state.idea,
      techStack: state.techStack,
      features: state.features,
      overview: state.summary,
    });
    return {
      ...state,
      techContext: response.techcontext,
      summary: state.summary + "\n" + "Tech Context: " + response.summary,
    };
  } catch (error) {
    console.error("Error generating tech context:", error);
    return {
      ...state,
      techContext: "",
      summary: state.summary + "\n" + "Tech Context: Error generating tech context",
    };
  }
}

// Define the graph workflow
const graph = new StateGraph(graphState);

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
export async function generateDocs(idea: string, techStack: string, features: string) {
  const initialState: typeof graphState.State = {
    idea,
    techStack,
    features,
    projectbrief: "",
    productContext: "",
    activeContext: "",
    systemPatterns: "",
    techContext: "",
    summary: "",
  };

  const result = await app.invoke(initialState);
  return {
    projectbrief: result.projectbrief,
    productContext: result.productContext,
    activeContext: result.activeContext,
    systemPatterns: result.systemPatterns,
    techContext: result.techContext,
    summary: result.summary,
  };
}
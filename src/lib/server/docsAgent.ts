import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { writeFile } from "fs/promises";
import path from "path";
import { env } from "@/env";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { AgentState, ProjectBrief, ProductContext, ActiveContext, SystemPatterns, TechContext } from "@/types/docs-agent.dto";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";


const groqModel = new ChatGroq({
  modelName: "llama3-8b-8192",
  apiKey: env.GROQ_API_KEY,
  temperature: 0.5,
  maxRetries: 2,
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
  Must follow Notes:
  1. Also generate a summary of the project brief in JSON format.
  2. The output should be a valid JSON object in the following format:
    {
      "summary": "short description of the project brief",
      "projectbrief": "project brief"
    }
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
  
  Must follow Notes:
  1. Also generate a summary of the product context in JSON format.
  2. The output should be a valid JSON object in the following format:
    {
      "summary": "short description of the product context",
      "productcontext": "product context"
    }
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
  
  Must follow Notes:
  1. Also generate a summary of the active context in JSON format.
  2. For the active context, generate the initial steps of the project.
  2. The output should be a valid JSON object in the following format:
    {
      "summary": "short description of the active context",
      "activecontext": "active context"
    }
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
  
  Must follow Notes:
  1. Also generate a summary of the system patterns in JSON format.
  2. The output should be a valid JSON object in the following format:
    {
      "summary": "short description of the system patterns",
      "systempatterns": "system patterns"
    }
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
  
  Must follow Notes:
  1. Also generate a summary of the tech context in JSON format.
  2. The output should be a valid JSON object in the following format:
    {
      "summary": "short description of the tech context",
      "techcontext": "tech context"
    }
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
    const chain = projectBriefPrompt.pipe(groqModel).pipe(parser);
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
    const chain = productContextPrompt.pipe(groqModel).pipe(parser);
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
    const chain = activeContextPrompt.pipe(groqModel).pipe(parser);
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
    const chain = systemPatternsPrompt.pipe(groqModel).pipe(parser);
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
    const chain = techContextPrompt.pipe(groqModel).pipe(parser);
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

// Function to write generated docs to files
export async function writeDocsToFiles(docs: any, basePath: string = "docs") {
  await writeFile(path.join(basePath, "projectbrief.md"), docs.projectbrief);
  await writeFile(path.join(basePath, "productContext.md"), docs.productContext);
  await writeFile(path.join(basePath, "activeContext.md"), docs.activeContext);
  await writeFile(path.join(basePath, "systemPatterns.md"), docs.systemPatterns);
  await writeFile(path.join(basePath, "techContext.md"), docs.techContext);
  await writeFile(path.join(basePath, "progress.md"), docs.progress);
}

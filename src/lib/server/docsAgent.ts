'use server';
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import JSZip from "jszip";


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

export type DocsAgentStateType = typeof DocsAgentState.State;

import { generateActiveContext, generateTechContext, generateProductContext, generateProjectBrief, generateSystemPatterns } from "./docGenerators";

const graph = new StateGraph(DocsAgentState);



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

import { DocsAgentStateType } from "../server/docsAgent";

export const systemMessage = "You are an expert project/product manager. You are tasked with generating documentation for a project. Each document should be in markdown format. The documents should be well-organized, concise, and easy to understand.";

export const projectBriefPrompt = (params: DocsAgentStateType) => `
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

export const productContextPrompt = (params: DocsAgentStateType) => `
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

export const activeContextPrompt = (params: DocsAgentStateType) => `
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

export const systemPatternsPrompt = (params: DocsAgentStateType) => `
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

export const techContextPrompt = (params: DocsAgentStateType) => `
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

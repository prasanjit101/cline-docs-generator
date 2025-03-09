
// Define a state object to keep track of the various parts of the documentation
export interface AgentState {
    idea: string;
    techStack: string;
    features: string;
    projectbrief: string;
    productContext: string;
    activeContext: string;
    systemPatterns: string;
    techContext: string;
    progress: string;
    summary: string;
}

export interface ProjectBrief {
    summary: string;
    projectbrief: string;
}

export interface ProductContext {
    summary: string;
    productcontext: string;
}

export interface ActiveContext {
    summary: string;
    activecontext: string;
}

export interface SystemPatterns {
    summary: string;
    systempatterns: string;
}

export interface TechContext {
    summary: string;
    techcontext: string;
}


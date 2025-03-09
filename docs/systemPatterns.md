### System Architecture
- Frontend: Next.js
- AI Processing: LangGraph.js

### Key Technical Decisions
- Use of AI for structured document generation.
- The docs are streamed to the frontend as they are generated.

### Design Patterns in Use
- Event-driven architecture for documentation updates.
- Modular and extensible agent design using LangGraph.js - https://langchain-ai.github.io/langgraphjs/

### Component Relationships
- Input: Idea, Tech Stack, Features -> AI Agents → Document Generators → Streamed to the frontend as they are generated.
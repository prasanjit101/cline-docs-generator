# Project Structure

-   `.clinerules`: Project-specific rules and patterns for Cline.
-   `.env.example`: Example environment variables.
-   `.eslintrc.cjs`: ESLint configuration for code linting.
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `components.json`: Configuration for UI components.
-   `next.config.js`: Next.js configuration file.
-   `package-lock.json`: Records the exact versions of dependencies used in the project.
-   `package.json`: Contains metadata about the project, including dependencies and scripts.
-   `postcss.config.js`: Configuration for PostCSS, a CSS processing tool.
-   `prettier.config.js`: Configuration for Prettier, a code formatter.
-   `README.md`: Provides an overview of the project.
-   `tailwind.config.ts`: Configuration for Tailwind CSS.
-   `tsconfig.json`: Configuration for TypeScript.
-   `docs/`: Directory containing project documentation.
    -   `activeContext.md`: Current work focus, recent changes, and next steps.
    -   `productContext.md`: Why this project exists, problems it solves, and user experience goals.
    -   `progress.md`: What works, what's left to build, and current status.
    -   `projectbrief.md`: Core requirements and goals of the project.
    -   `systemPatterns.md`: System architecture, key technical decisions, and design patterns.
    -   `techContext.md`: Technologies used, development setup, and technical constraints.
-   `public/`: Directory for static assets.
    -   `favicon.ico`: Favicon for the website.
-   `src/`: Source code directory.
    -   `env.js`: Environment variable validation.
    -   `app/`: Next.js app directory.
        -   `layout.tsx`: Layout component for the app.
        -   `page.tsx`: Main page component.
    -   `components/`: Reusable UI components.
        -   `ui/`: Primitive UI components.
            -   `button.tsx`: Button component.
    -   `lib/`: Utility functions.
        -   `utils.ts`: Utility functions.
    -   `styles/`: CSS styles.
        -   `globals.css`: Global styles.

### Key Technical Decisions
- Use of AI for structured document generation.
- The docs are streamed to the frontend as they are generated.

### Design Patterns in Use
- Event-driven architecture for documentation updates.
- Modular and extensible agent design using LangGraph.js - https://langchain-ai.github.io/langgraphjs/

### Component Relationships
- Input: Idea, Tech Stack, Features -> AI Agents → Document Generators → Streamed to the frontend as they are generated.

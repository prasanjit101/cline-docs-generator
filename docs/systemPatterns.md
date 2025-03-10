# System Architecture Patterns

## Documentation Generation Flow

1. **User Input**: FormComponent collects documentation requirements
2. **Processing**: AI SDK and LangGraph process the input
3. **Output Generation**: Documentation files are generated
4. **Download**: Docs are downloaded as a zip file 'docs.zip' as soon as docs are generated

## Component Relationships

```mermaid
flowchart TD
    Form[FormComponent] -->|User Input| AI[AI SDK]
    AI -->|Processed Data| Lang[LangGraph]
    Lang -->|Generated Docs| List[DocsList]
```

## UI Patterns

* **Radix UI Integration**: Used for accessible dialog and form components
* **Component Hierarchy**:
  - FormComponent handles input collection
  - DocsList manages documentation display
  - Radix Dialog provides modal interactions

## Data Flow

1. users enter their own ai key and choose the ai model they want to use
2. User input collected via FormComponent
3. Data processed through AI SDK and LangGraph
4. Docs are downloaded as a zip file 'docs.zip' as soon as docs are generated

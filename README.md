# llm-mcp-rag-zero-framework

[x](https://www.anthropic.com/engineering/building-effective-agents)

- Goal: 
    - Augmented LLM (Chat + MCP + RAG)  
    - No dependency on frameworks (e.g., LangChain, CrewAI, AutoGen, etc.)

- MCP::
    - Support multiple MCP servers..
    - https://github.com/modelcontextprotocol/typescript-sdk

- RAG:
    - Retrieve relevant knowledge, insert it into the context, and pass it to the LLM. 

- Workflow:
    - Read website -> Organize -> Summarize -> Store.tore.
    - Read PDF -> Organize -> Summarize -> Store.    


```# Install dependencies
npm install dotenv openai 
npm install @modelcontextprotocol/sdk
```

## LLM:

- https://ai.google.dev/gemini-api/docs/text-generation

## MCP:

- https://github.com/modelcontextprotocol/typescript-sdk
- https://modelcontextprotocol.io/docs/concepts/architecture
- https://modelcontextprotocol.io/quickstart/client
- https://github.com/modelcontextprotocol/servers/tree/main/src/fetch
- https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem

## RAG:
- [How do domain-specific chatbots work? An overview of retrieval augmented generation (RAG)](https://www.youtube.com/watch?v=1ifymr7SiH8)
- Loaders:
    - [langchain](https://python.langchain.com/docs/integrations/document_loaders/)
- JSONPlaceholder:
    - [jsonplaceholder](https://jsonplaceholder.typicode.com/)
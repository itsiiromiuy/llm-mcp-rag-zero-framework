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

- MCP:


```# Install dependencies
npm install dotenv openai npm install @modelcontextprotocol/sdk
```

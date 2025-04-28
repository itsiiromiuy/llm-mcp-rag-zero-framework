import GeminiChatClient from "./GeminiChatClient";
import MCPClient from "./MCPClient";

// const geminiChatClient = new GeminiChatClient("gemini-chat-client");

// const prompt = "What is the capital of the moon?";
// const result = await geminiChatClient.chat(prompt);
// console.log(result);

async function main() {
  const fetchMCP = new MCPClient("mcp-server-fetch", "uvx", [
    "mcp-server-fetch"
  ]);
  await fetchMCP.init();
  const tools = fetchMCP.getTools();
  console.log(tools);
  await fetchMCP.close();
}

main();

//npx @modelcontextprotocol/inspector uvx mcp-server-fetch

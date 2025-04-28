import MCPClient from "./MCPClient";
import { logTitle } from "./utils";

logTitle("STARTING MCP CLIENT");

const mcpClient = new MCPClient("mcp-client", "node", ["build/index.js"]);
await mcpClient.init();

const tools = mcpClient.getTools();

const prompt = "What is the capital of the moon?";
const result = await mcpClient.callTool("capital", {
  country: "moon"
});

console.log(result);
await mcpClient.close();

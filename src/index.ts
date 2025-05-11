import GeminiChatClient from "./GeminiChatClient";
import MCPClient from "./MCPClient";
import { logError, logTitle } from "./utils";

/**
 * Set up MCP client example
 */
async function setupMCPExample(): Promise<void> {
  let mcpClient: MCPClient | null = null;

  try {
    // Create MCP client
    mcpClient = new MCPClient("mcp-server-fetch", "uvx", ["mcp-server-fetch"]);

    // Initialize MCP client
    await mcpClient.init();

    // Get available tools list
    const tools = mcpClient.getTools();
    console.log("Available tools:", tools);
  } catch (error) {
    logError("MCP client example failed", error);
  } finally {
    // Close MCP client connection
    if (mcpClient) {
      await mcpClient.close();
    }
  }
}

/**
 * Set up Gemini chat client example
 */
async function setupGeminiExample(): Promise<void> {
  try {
    // Create Gemini chat client
    const geminiChatClient = new GeminiChatClient("gemini-chat-client");

    // Send chat message
    const prompt = "What is the capital of the moon?";
    const result = await geminiChatClient.chat(prompt);

    console.log("Gemini chat result:", result);
  } catch (error) {
    logError("Gemini chat example failed", error);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  logTitle("Starting Application");

  try {
    // Run MCP client example
    await setupMCPExample();

    // Run Gemini chat client example (commented out, can be enabled when needed)
    // await setupGeminiExample();

    logTitle("Application Completed");
  } catch (error) {
    logError("Application failed", error);
    process.exit(1);
  }
}

// Start application
main().catch((error) => {
  logError("Uncaught error", error);
  process.exit(1);
});

// Command line tool hint:
// npx @modelcontextprotocol/inspector uvx mcp-server-fetch

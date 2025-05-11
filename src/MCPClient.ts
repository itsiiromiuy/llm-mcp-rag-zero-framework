import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { API_CONSTANTS, ERROR_MESSAGES } from "./constants";
import { AppError, ErrorType, Tool } from "./types";
import { logError } from "./utils";

/**
 * MCP client class for communicating with MCP servers
 */
export default class MCPClient {
  private readonly mcp: Client;
  private readonly command: string;
  private readonly args: string[];
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];

  /**
   * Create an MCP client instance
   * @param name Client name
   * @param command Command
   * @param args Command arguments
   * @param version Version number (optional)
   */
  constructor(
    name: string,
    command: string,
    args: string[],
    version: string = API_CONSTANTS.DEFAULT_VERSION
  ) {
    this.mcp = new Client({ name, version });
    this.command = command;
    this.args = args;
  }

  /**
   * Initialize and connect to the MCP server
   */
  public async init(): Promise<void> {
    await this.connectToServer();
  }

  /**
   * Get the list of available tools
   * @returns List of tools
   */
  public getTools(): Tool[] {
    return this.tools;
  }

  /**
   * Call a specific tool
   * @param name Tool name
   * @param params Call parameters
   * @returns Tool call result
   */
  public callTool(name: string, params: Record<string, any>): Promise<any> {
    return this.mcp.callTool({
      name,
      arguments: params
    });
  }

  /**
   * Connect to the MCP server and get available tools
   * @private
   */
  private async connectToServer(): Promise<void> {
    try {
      this.transport = new StdioClientTransport({
        command: this.command,
        args: this.args
      });
      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();
      this.tools = toolsResult.tools.map((tool) => ({
        name: tool.name,
        description: tool.description || "No description available",
        inputSchema: tool.inputSchema
      }));

      console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name)
      );
    } catch (error) {
      logError(ERROR_MESSAGES.FAILED_TO_CONNECT, error);
      throw new AppError(
        ErrorType.CONNECTION_FAILED,
        `${ERROR_MESSAGES.FAILED_TO_CONNECT}${error}`
      );
    }
  }
}

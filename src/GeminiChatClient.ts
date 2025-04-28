import { Content, GoogleGenAI, Part } from "@google/genai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";
import { logTitle } from "./utils";

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export default class GeminiChatClient {
  private llm: GoogleGenAI;
  private model: string;
  private messages: Content[] = [];
  private tools: Tool[];
  private apiKey: string = process.env.GOOGLE_API_KEY || "";

  constructor(
    model: string,
    systemPrompt: string = "",
    tools: Tool[] = [],
    context: string = ""
  ) {
    if (!this.apiKey) {
      throw new Error("Google API key is not set in environment variables");
    }
    this.llm = new GoogleGenAI({
      apiKey: this.apiKey
    });
    this.model = model;
    this.tools = tools;

    // Handle system prompt and context
    let systemContent = "";
    if (systemPrompt) {
      systemContent = systemPrompt;
    }
    if (context) {
      // Add context as a separate user message
      this.messages.push({
        role: "user",
        parts: [{ text: context }]
      });
    }

    if (systemContent) {
      // We add system prompt as a system message (in Gemini form)
      this.messages.push({
        role: "user",
        parts: [{ text: `[System Instruction] ${systemContent}` }]
      });
    }
  }

  async chat(
    prompt?: string
  ): Promise<{ content: string; toolCalls: ToolCall[] }> {
    logTitle("CHAT");

    if (prompt) {
      // Add user message to history
      this.messages.push({
        role: "user",
        parts: [{ text: prompt }]
      });
    }

    const requestParams: any = {
      model: this.model,
      contents: this.messages
    };

    // Configure tools if available
    if (this.tools && this.tools.length > 0) {
      requestParams.tools = {
        functionDeclarations: this.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema || {}
        }))
      };
    }

    let content = "";
    let toolCalls: ToolCall[] = [];

    logTitle("RESPONSE");
    try {
      const response = await this.llm.models.generateContentStream(
        requestParams
      );

      for await (const chunk of response) {
        // Process text content
        if (chunk.text) {
          content += chunk.text;
          process.stdout.write(chunk.text);
        }

        // Process function calls
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const functionCall of chunk.functionCalls) {
            toolCalls.push({
              id: `call_${Date.now()}_${toolCalls.length}`,
              function: {
                name: functionCall.name || "",
                arguments: JSON.stringify(functionCall.args || {})
              }
            });
          }
        }
      }

      // Add assistant response to conversation history
      const parts: Part[] = [{ text: content }];

      this.messages.push({
        role: "model",
        parts: parts
      });

      return {
        content,
        toolCalls
      };
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  public appendToolResult(toolCallId: string, toolOutput: string) {
    // Add tool result to conversation history
    this.messages.push({
      role: "function",
      parts: [
        {
          text: toolOutput,
          functionResponse: {
            name: toolCallId.split("_")[0],
            response: { content: toolOutput }
          }
        }
      ]
    });
  }

  private getToolsDefinition() {
    return this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema || {}
    }));
  }
}

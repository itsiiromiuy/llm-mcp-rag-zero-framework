import { Content, GoogleGenAI, Part } from "@google/genai";
import "dotenv/config";
import { API_CONSTANTS, ERROR_MESSAGES } from "./constants";
import { AppError, ChatResponse, ErrorType, Tool, ToolCall } from "./types";
import { getCurrentTimestamp, logError, logTitle } from "./utils";

/**
 * Gemini chat client class for communicating with Google Gemini API
 */
export default class GeminiChatClient {
  private readonly llm: GoogleGenAI;
  private readonly model: string;
  private readonly messages: Content[] = [];
  private readonly tools: Tool[];
  private readonly apiKey: string = process.env.GOOGLE_API_KEY || "";

  /**
   * Create a Gemini chat client instance
   * @param model Model name
   * @param systemPrompt System prompt (optional)
   * @param tools List of available tools (optional)
   * @param context Initial context (optional)
   */
  constructor(
    model: string,
    systemPrompt: string = "",
    tools: Tool[] = [],
    context: string = ""
  ) {
    if (!this.apiKey) {
      throw new AppError(
        ErrorType.API_KEY_MISSING,
        ERROR_MESSAGES.GOOGLE_API_KEY_MISSING
      );
    }

    this.llm = new GoogleGenAI({
      apiKey: this.apiKey
    });
    this.model = model;
    this.tools = tools;

    this.initializeChat(context, systemPrompt);
  }

  /**
   * Send chat message and get response
   * @param prompt User prompt (optional)
   * @returns Chat response
   */
  public async chat(prompt?: string): Promise<ChatResponse> {
    logTitle("CHAT");

    if (prompt) {
      this.messages.push({
        role: "user",
        parts: [{ text: prompt }]
      });
    }

    const requestParams = this.buildRequestParams();
    return await this.generateResponse(requestParams);
  }

  /**
   * Add tool call result to message history
   * @param toolCallId Tool call ID
   * @param toolOutput Tool output
   */
  public appendToolResult(toolCallId: string, toolOutput: string): void {
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

  /**
   * Initialize chat context and system prompt
   * @param context Initial context
   * @param systemPrompt System prompt
   * @private
   */
  private initializeChat(context: string, systemPrompt: string): void {
    if (context) {
      this.messages.push({
        role: "user",
        parts: [{ text: context }]
      });
    }

    if (systemPrompt) {
      this.messages.push({
        role: "user",
        parts: [{ text: `[System Instruction] ${systemPrompt}` }]
      });
    }
  }

  /**
   * Build API request parameters
   * @returns API request parameters
   * @private
   */
  private buildRequestParams(): any {
    return {
      model: this.model,
      contents: this.messages,
      ...(this.tools.length > 0 && {
        tools: {
          functionDeclarations: this.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema || {}
          }))
        }
      })
    };
  }

  /**
   * Generate chat response
   * @param requestParams API request parameters
   * @returns Chat response
   * @private
   */
  private async generateResponse(requestParams: any): Promise<ChatResponse> {
    let content = "";
    let toolCalls: ToolCall[] = [];

    logTitle("RESPONSE");
    try {
      const response = await this.llm.models.generateContentStream(
        requestParams
      );

      for await (const chunk of response) {
        if (chunk.text) {
          content += chunk.text;
          process.stdout.write(chunk.text);
        }

        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          this.handleFunctionCalls(chunk.functionCalls, toolCalls);
        }
      }

      this.messages.push({
        role: "model",
        parts: [{ text: content }]
      });

      return { content, toolCalls };
    } catch (error) {
      logError(ERROR_MESSAGES.FAILED_TO_GENERATE_RESPONSE, error);
      throw new AppError(
        ErrorType.RESPONSE_GENERATION_FAILED,
        `${ERROR_MESSAGES.FAILED_TO_GENERATE_RESPONSE}${error}`
      );
    }
  }

  /**
   * Handle function calls
   * @param functionCalls Function call list
   * @param toolCalls Tool call list (passed by reference)
   * @private
   */
  private handleFunctionCalls(
    functionCalls: any[],
    toolCalls: ToolCall[]
  ): void {
    for (const functionCall of functionCalls) {
      toolCalls.push({
        id: `${API_CONSTANTS.TOOL_CALL_ID_PREFIX}_${getCurrentTimestamp()}_${
          toolCalls.length
        }`,
        function: {
          name: functionCall.name || "",
          arguments: JSON.stringify(functionCall.args || {})
        }
      });
    }
  }
}

import OpenAI from "openai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";
import { logTitle } from "./utils";

export interface toolCalls {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export default class ChatOpenAI {
  private llm: OpenAI;
  private model: string;
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  private tools: Tool[];

  constructor(
    model: string,
    systemPrompt: string = "",
    context: string = "",
    tools: Tool[] = []
  ) {
    this.llm = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL
    });
    this.model = model;
    this.tools = tools;
    // Add system prompt if provided
    if (systemPrompt) {
      this.messages.push({
        role: "system",
        content: systemPrompt
      });
    }
    // Add initial context as user message if provided
    if (context) {
      this.messages.push({
        role: "user",
        content: context
      });
    }
  }

  async chat(prompt?: string) {
    logTitle("CHAT");
    if (prompt) this.messages.push({ role: "user", content: prompt });

    let content = "";
    let toolCalls: any[] = [];

    logTitle("RESPONSE");
    try {
      const stream = await this.llm.chat.completions.create({
        model: this.model,
        messages: this.messages,
        stream: true,
        tools: this.getToolsDefinition()
      });

      for await (const chunk of stream) {
        // Handle text content
        const textContent = chunk.choices[0]?.delta?.content;
        if (textContent) {
          content += textContent;
          process.stdout.write(textContent);
        }

        // Handle tool calls (function calls)
        const toolCall = chunk.choices[0]?.delta?.tool_calls?.[0];
        if (toolCall) {
          this.handleToolCall(toolCall, toolCalls);
        }
      }

      // Add assistant message to history
      this.messages.push({
        role: "assistant",
        content: content || null,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
      });

      return { content, toolCalls };
    } catch (error) {
      console.error("Failed to generate response:", error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  private getToolsDefinition() {
    return this.tools.map((tool) => ({
      type: "function" as const,
      function: tool
    }));
  }

  // Handle incremental tool call chunks
  private handleToolCall(toolCallChunk: any, toolCalls: any[]) {
    if (toolCallChunk.index === undefined) return;
    const index = toolCallChunk.index;
    if (!toolCalls[index]) {
      toolCalls[index] = {
        id: toolCallChunk.id || `call_${Date.now()}_${index}`,
        type: "function",
        function: {
          name: "",
          arguments: ""
        }
      };
    }
    if (toolCallChunk.id) {
      toolCalls[index].id = toolCallChunk.id;
    }
    if (toolCallChunk.function) {
      if (toolCallChunk.function.name) {
        toolCalls[index].function.name = toolCallChunk.function.name;
      }
      if (toolCallChunk.function.arguments) {
        toolCalls[index].function.arguments += toolCallChunk.function.arguments;
      }
    }
  }

  // Add tool call result to conversation history
  public appendToolResult(toolCallId: string, toolOutput: string): void {
    this.messages.push({
      role: "tool",
      tool_call_id: toolCallId,
      content: toolOutput
    });
  }
}

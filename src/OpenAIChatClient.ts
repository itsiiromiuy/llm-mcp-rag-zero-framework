import { Content, GoogleGenAI } from "@google/genai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config.js";
import { logTitle } from "./util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export default class GeminiChatClient {
  private llm: GoogleGenAI;
  private model: string;
  private initialMessages: Content[] = [];
  private tools: Tool[];
  private apiKey: string = process.env.GOOGLE_API_KEY || "";

  constructor(
    model: string,
    systemPrompt: string = "",
    tools: Tool[],
    client: Client,
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
    this.llm.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: "Explain how AI works"
    });

    let systemContent = "";
    if (systemPrompt) {
      systemContent = systemPrompt;
    }
    if (context) {
      systemContent += systemContent ? `\n\n${context}` : context;
    }

    if (systemContent) {
      this.initialMessages.push({
        role: "user",
        parts: [{ text: systemContent }]
      });
    }
  }

  async chat(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    logTitle("GeminiChatClient");

    const contents: Content[] = [
      ...this.initialMessages,
      { role: "user", parts: [{ text: prompt }] }
    ];

    const requestParams: { config?: any } = {};
    if (this.tools && this.tools.length > 0) {
      requestParams.config = {
        tools: [
          {
            functionDeclarations: this.tools.map((tool) => ({
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters || {}
            }))
          }
        ]
      };
    }

    const response = await this.llm.models.generateContentStream({
      contents,
      model: this.model
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  }
}

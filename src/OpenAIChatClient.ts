import { GoogleGenAI } from "@google/genai";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config.js";
import { logTitle } from "./util";

export default class GeminiChatClient {
  private llm: GoogleGenAI;
  private model: string;
  private messages: { role: string; content: string }[] = [];
  private tools: Tool[];
  private apiKey: string = process.env.GOOGLE_API_KEY || "";

  constructor(
    model: string,
    systemPrompt: string = "",
    tools: Tool[],
    context: string = ""
  ) {
    this.llm = new GoogleGenAI({
      apiKey: this.apiKey
    });
    this.model = model;
    this.tools = tools;
    this.llm.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: "Explain how AI works"
    });
    if (systemPrompt) {
      this.messages.push({ role: "system", content: systemPrompt });
    }
    if (context) {
      this.messages.push({ role: "user", content: context });
    }
  }
}

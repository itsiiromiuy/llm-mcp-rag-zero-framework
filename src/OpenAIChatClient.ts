import { Tool } from "@modelcontextprotocol/sdk/types.js"
import OpenAI from "openai"

export default class OpenAIChatClient{
    private llm: OpenAI 
    private model: string 
    private messages: OpenAI.Chat.ChatCompletionAssistantMessageParam[] =[]
    private tools: Tool[]
 



    constructor(model: string, systemPrompt: string ='', tool: Tool[] = [], context: string=''){
        this.llm = new OpenAI({
            apiKey : process.env.OPEN_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL
        });
        this.model=model
        this.messages.push({
            role: 'system',
            content: systemPrompt
        })
       

    }
}
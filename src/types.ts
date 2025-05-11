/**
 * Common tool call interface
 */
export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * MCP tool interface
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema?: Record<string, any>;
}

/**
 * Chat response result interface
 */
export interface ChatResponse {
  content: string;
  toolCalls: ToolCall[];
}

/**
 * Error type enumeration
 */
export enum ErrorType {
  API_KEY_MISSING = "API_KEY_MISSING",
  CONNECTION_FAILED = "CONNECTION_FAILED",
  RESPONSE_GENERATION_FAILED = "RESPONSE_GENERATION_FAILED"
}

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(public readonly type: ErrorType, message: string) {
    super(message);
    this.name = "AppError";
  }
}

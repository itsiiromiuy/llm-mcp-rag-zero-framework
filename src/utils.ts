import chalk from "chalk";
import { LOG_CONSTANTS } from "./constants";

/**
 * Print a formatted title, centered with equal signs padding
 * @param message The message to display
 */
export function logTitle(message: string): void {
  const totalWidth = LOG_CONSTANTS.TITLE_WIDTH;
  const paddingChar = LOG_CONSTANTS.PADDING_CHAR;
  const messageLength = message.trim().length;

  const totalPadding = Math.max(0, totalWidth - messageLength - 2);

  const leftPaddingCount = Math.floor(totalPadding / 2);
  const rightPaddingCount = Math.ceil(totalPadding / 2);

  const leftPadding = paddingChar.repeat(leftPaddingCount);
  const rightPadding = paddingChar.repeat(rightPaddingCount);

  const formattedMessage = `${leftPadding} ${message.trim()} ${rightPadding}`;

  console.log(chalk.bold.cyanBright(formattedMessage));
}

/**
 * Format error message and output to console
 * @param message Error message
 * @param error Error object (optional)
 */
export function logError(message: string, error?: unknown): void {
  console.error(chalk.bold.red(message), error);
}

/**
 * Get current timestamp
 * @returns Current timestamp (milliseconds)
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

// logTitle("System Ready");
// logTitle("Short");
// logTitle("   Message with Spaces   ");
// logTitle("This is a very long message to see how it handles overflow based on the calculation");

import chalk from "chalk";

/**
 * @param message  
 */
export function logTitle(message: string): void {
    const totalWidth = 80;         
    const paddingChar = '=';       
    const messageLength = message.trim().length;  

    const totalPadding = Math.max(0, totalWidth - messageLength - 2);  
 
    const leftPaddingCount = Math.floor(totalPadding / 2);
    const rightPaddingCount = Math.ceil(totalPadding / 2);  
    
    const leftPadding = paddingChar.repeat(leftPaddingCount);
    const rightPadding = paddingChar.repeat(rightPaddingCount);

    const formattedMessage = `${leftPadding} ${message.trim()} ${rightPadding}`;
 
    console.log(chalk.bold.cyanBright(formattedMessage));
}

 
// logTitle("System Ready");
// logTitle("Short");
// logTitle("   Message with Spaces   ");
// logTitle("This is a very long message to see how it handles overflow based on the calculation");
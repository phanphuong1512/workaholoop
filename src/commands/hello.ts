import { Command } from "commander";
import pc from "picocolors";

export const helloCommand = new Command("hello")
  .description("Outputs Hello, Agentic World!")
  .action(() => {
    console.log(pc.green("Hello, Agentic World!"));
  });

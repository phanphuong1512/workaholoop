export interface HarnessAdapter {
  id: string;
  name: string;
  generateCommands(cwd: string, commands: Record<string, string>): void;
}

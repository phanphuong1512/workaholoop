import { Command } from "commander";
import { select } from "@inquirer/prompts";
import pc from "picocolors";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { constitutionTemplate } from "../templates/constitution.js";
import { configTemplate } from "../templates/config.js";
import { slashCommands } from "../templates/slash-commands.js";
import * as skills from "../templates/skills.js";
import { worktreeSkillMd } from "../templates/worktree-skill.js";
import { ALL_ADAPTERS } from "../adapters/index.js";

export const initCommand = new Command("init")
  .description("Scaffolds wlp/ directory and generates agent skills")
  .option(
    "-h, --harness <name>",
    "Which AI agent harness to configure for (claude, agents)"
  )
  .action(async (options) => {
    let selectedHarness = options.harness;

    if (!selectedHarness) {
      try {
        selectedHarness = await select({
          message: 'Which AI Agent Harness do you want to configure?',
          choices: [
            { 
              name: 'Claude Code', 
              value: 'claude',
              description: 'Generates custom skills in .claude/skills/'
            },
            { 
              name: 'GitHub Copilot & Google Antigravity', 
              value: 'agents',
              description: 'Configures custom skills in .agents/skills/'
            },
          ],
        });
      } catch (err: any) {
        if (err.name === 'ExitPromptError') {
          console.log(pc.yellow('\n! Initialization canceled.'));
          process.exit(0);
        } else {
          throw err;
        }
      }
    }

    initWorkspace(selectedHarness);
  });

function initWorkspace(harness: string) {
  console.log(pc.blue("\nInitializing WLP..."));
  console.log(pc.dim(`Target harness: ${harness}`));

  const cwd = process.cwd();

  // 0. Detect and initialize git if missing
  if (!fs.existsSync(path.join(cwd, '.git'))) {
    console.log(pc.yellow('! Git repository not detected. Initializing git...'));
    try {
      execSync('git init', { stdio: 'inherit' });
      console.log(pc.green('+ Initialized empty Git repository.'));
    } catch (e: any) {
      console.log(pc.red(`! Failed to initialize Git repository: ${e.message}`));
    }
  }

    // 1. Detect project name
    let projectName = path.basename(cwd);
    try {
      if (fs.existsSync(path.join(cwd, "package.json"))) {
        const pkg = JSON.parse(
          fs.readFileSync(path.join(cwd, "package.json"), "utf-8"),
        );
        if (pkg.name) projectName = pkg.name;
      }
    } catch (e) {
      // Ignore
    }

    // 2. Create base directories
    const dirs = [
      "wlp/prds",
      "wlp/epics",
      "wlp/archived",
      "wlp/memory",
      "wlp/skills/core/references",
    ];

    for (const dir of dirs) {
      const fullPath = path.join(cwd, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(pc.green(`+ Created ${dir}/`));
      } else {
        console.log(pc.gray(`- ${dir}/ already exists`));
      }
    }

    // 3. Write constitution.md
    const constitutionPath = path.join(cwd, "wlp/constitution.md");
    if (!fs.existsSync(constitutionPath)) {
      fs.writeFileSync(constitutionPath, constitutionTemplate);
      console.log(pc.green("+ Created wlp/constitution.md"));
    }

    // 3.5 Write learned.md
    const learnedPath = path.join(cwd, "wlp/memory/learned.md");
    if (!fs.existsSync(learnedPath)) {
      fs.writeFileSync(learnedPath, "# Learned Memory\\n\\nThis file contains lessons learned from past task executions to prevent repeating mistakes.\\n");
      console.log(pc.green("+ Created wlp/memory/learned.md"));
    }

    // 4. Write config.json
    const configPath = path.join(cwd, "wlp/config.json");
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, configTemplate(projectName));
      console.log(pc.green("+ Created wlp/config.json"));
    }

    // 5. Write slash commands via Adapters
    const adaptersToRun = ALL_ADAPTERS.filter((a) => a.id === harness);

    if (adaptersToRun.length === 0) {
      console.log(
        pc.yellow(
          `! Unknown harness '${harness}'. Skipping slash commands.`,
        ),
      );
    } else {
      for (const adapter of adaptersToRun) {
        adapter.generateCommands(cwd, slashCommands);
      }
    }

    // 6. Write Skill files
    const coreSkillPath = path.join(cwd, "wlp/skills/core");
    if (!fs.existsSync(path.join(coreSkillPath, "SKILL.md"))) {
      fs.writeFileSync(path.join(coreSkillPath, "SKILL.md"), skills.topLevelSkillMd);
    }

    const refs = {
      "propose.md": skills.proposeMd,
      "spec.md": skills.specMd,
      "execute.md": skills.executeMd,
      "verify.md": skills.verifyMd,
      "auto.md": skills.autoMd,
      "converge.md": skills.convergeMd,
      "conventions.md": skills.conventionsMd,
    };

    const refsPath = path.join(coreSkillPath, "references");
    for (const [filename, content] of Object.entries(refs)) {
      if (!fs.existsSync(path.join(refsPath, filename))) {
        fs.writeFileSync(path.join(refsPath, filename), content);
      }
    }
    console.log(
      pc.green("+ Created Agent Skill definitions in wlp/skills/core/"),
    );

    // 7. Write Worktree Skill
    const worktreeSkillPath = path.join(cwd, "wlp/skills/worktree");
    if (!fs.existsSync(worktreeSkillPath)) {
      fs.mkdirSync(worktreeSkillPath, { recursive: true });
    }
    if (!fs.existsSync(path.join(worktreeSkillPath, "SKILL.md"))) {
      fs.writeFileSync(
        path.join(worktreeSkillPath, "SKILL.md"),
        worktreeSkillMd,
      );
    }
    console.log(pc.green("+ Created Worktree Skill in wlp/skills/worktree/"));

    console.log(pc.cyan("\nWLP initialized successfully."));
}

import { Command } from "commander";
import { select } from "@inquirer/prompts";
import pc from "picocolors";
import fs from "fs";
import path from "path";
import { constitutionTemplate } from "../templates/constitution.js";
import { configTemplate } from "../templates/config.js";
import { slashCommands } from "../templates/slash-commands.js";
import * as skills from "../templates/skills.js";
import { worktreeSkillMd } from "../templates/worktree-skill.js";
import { ALL_ADAPTERS } from "../adapters/index.js";

export const initCommand = new Command("init")
  .description("Scaffolds wlp/ directory and generates .claude/commands")
  .option(
    "-h, --harness <name>",
    "Which AI agent harness to configure for (claude, antigravity, opencode, all)"
  )
  .action(async (options) => {
    let selectedHarness = options.harness;

    if (!selectedHarness) {
      selectedHarness = await select({
        message: 'Which AI Agent Harness do you want to configure?',
        choices: [
          { name: '🤖 All (Installs configs for all supported agents)', value: 'all' },
          { name: '🔵 Claude Code (.claude/commands/)', value: 'claude' },
          { name: '🟢 Google Antigravity (Natural Language Intents)', value: 'antigravity' },
          { name: '🟠 OpenCode (.opencode/commands/)', value: 'opencode' },
        ],
      });
    }

    initWorkspace(selectedHarness);
  });

function initWorkspace(harness: string) {
  console.log(pc.blue("\nInitializing WLP..."));
  console.log(pc.dim(`Target harness: ${harness}`));

  const cwd = process.cwd();

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
      "wlp/changes/active",
      "wlp/changes/archive",
      "wlp/skills/core/references",
    ];

    for (const dir of dirs) {
      const fullPath = path.join(cwd, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(pc.green(`✓ Created ${dir}/`));
      } else {
        console.log(pc.gray(`- ${dir}/ already exists`));
      }
    }

    // 3. Write constitution.md
    const constitutionPath = path.join(cwd, "wlp/constitution.md");
    if (!fs.existsSync(constitutionPath)) {
      fs.writeFileSync(constitutionPath, constitutionTemplate);
      console.log(pc.green("✓ Created wlp/constitution.md"));
    }

    // 4. Write config.json
    const configPath = path.join(cwd, "wlp/config.json");
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, configTemplate(projectName));
      console.log(pc.green("✓ Created wlp/config.json"));
    }

    // 5. Write slash commands via Adapters
    const adaptersToRun =
      harness === "all"
        ? ALL_ADAPTERS
        : ALL_ADAPTERS.filter((a) => a.id === harness);

    if (adaptersToRun.length === 0) {
      console.log(
        pc.yellow(
          `⚠️ Unknown harness '${harness}'. Skipping slash commands.`,
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
      fs.writeFileSync(path.join(coreSkillPath, "SKILL.md"), skills.skillMd);
    }

    const refs = {
      "propose.md": skills.proposeMd,
      "spec.md": skills.specMd,
      "plan.md": skills.planMd,
      "execute.md": skills.executeMd,
      "verify.md": skills.verifyMd,
      "close.md": skills.closeMd,
      "auto.md": skills.autoMd,
      "conventions.md": skills.conventionsMd,
    };

    const refsPath = path.join(coreSkillPath, "references");
    for (const [filename, content] of Object.entries(refs)) {
      if (!fs.existsSync(path.join(refsPath, filename))) {
        fs.writeFileSync(path.join(refsPath, filename), content);
      }
    }
    console.log(
      pc.green("✓ Created Agent Skill definitions in wlp/skills/core/"),
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
    console.log(pc.green("✓ Created Worktree Skill in wlp/skills/worktree/"));

    console.log(pc.cyan("\n✨ WLP initialized successfully!"));
}

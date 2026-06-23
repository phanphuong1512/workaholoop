import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { confirm } from '@inquirer/prompts';

export const syncCommand = new Command('sync')
  .description('Bi-directional sync of active epics with GitHub Issues')
  .action(async () => {
    console.log(pc.blue(pc.bold('\nSyncing with GitHub Issues...\n')));
    const cwd = process.cwd();
    
    const configPath = path.join(cwd, 'wlp/config.json');
    if (!fs.existsSync(configPath)) {
      console.log(pc.red('! wlp/config.json not found.'));
      return;
    }
    
    let token = process.env.GITHUB_TOKEN;
    if (!token) {
      try {
        token = execSync('gh auth token', { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf-8' }).trim();
      } catch (e) {
        console.log(pc.red('! GITHUB_TOKEN not set and `gh auth token` failed.'));
        return;
      }
    }

    const epicsDir = path.join(cwd, 'wlp/epics');
    if (!fs.existsSync(epicsDir)) {
      console.log(pc.yellow('No active epics to sync.'));
      return;
    }

    // 0. Detect and initialize git if missing (with confirmation)
    if (!fs.existsSync(path.join(cwd, '.git'))) {
      const initGit = await confirm({
        message: 'Git repository not detected. Would you like to initialize git now?',
        default: true
      });
      if (initGit) {
        try {
          execSync('git init', { stdio: 'inherit' });
          console.log(pc.green('+ Initialized empty Git repository.'));
        } catch (e: any) {
          console.log(pc.red(`! Failed to initialize Git repository: ${e.message}`));
          return;
        }
      } else {
        console.log(pc.red('! Aborted: Git repository is required for syncing.'));
        return;
      }
    }

    // 0.5. Check and create initial commit if repository is empty
    let hasCommits = false;
    try {
      execSync('git rev-parse --verify HEAD', { stdio: 'ignore' });
      hasCommits = true;
    } catch (e) {
      hasCommits = false;
    }

    if (!hasCommits) {
      console.log(pc.yellow('No commits found in the local repository. Creating initial commit...'));
      try {
        execSync('git add .', { stdio: 'ignore' });
        execSync('git commit -m "Initial commit"', { stdio: 'ignore' });
        console.log(pc.green('+ Staged files and created initial commit.'));
      } catch (e) {
        try {
          execSync('git commit --allow-empty -m "Initial commit"', { stdio: 'ignore' });
          console.log(pc.green('+ Created empty initial commit.'));
        } catch (e2: any) {
          console.log(pc.red(`! Failed to create initial commit: ${e2.message}`));
        }
      }
    }

    let owner = '', repo = '';
    try {
      let remoteUrl = '';
      try {
        remoteUrl = execSync('git remote get-url origin', { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf-8' }).trim();
      } catch (e) {
        const gitConfigPath = path.join(cwd, '.git/config');
        if (fs.existsSync(gitConfigPath)) {
          const gitConfig = fs.readFileSync(gitConfigPath, 'utf-8');
          const lines = gitConfig.split('\n');
          for (const line of lines) {
            if (line.includes('url =')) {
              remoteUrl = line.split('url =')[1].trim();
              break;
            }
          }
        }
      }

      // If no remote URL found, ask to create GitHub repo automatically
      if (!remoteUrl) {
        const createRepo = await confirm({
          message: 'No remote origin found. Would you like to automatically create a private GitHub repository for this project?',
          default: true
        });
        if (createRepo) {
          try {
            const projectName = path.basename(cwd);
            console.log(pc.gray(`Creating private GitHub repository: ${projectName}...`));
            execSync(`gh repo create "${projectName}" --private --source=. --push`, { stdio: 'inherit' });
            remoteUrl = execSync('git remote get-url origin', { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf-8' }).trim();
            console.log(pc.green(`+ Created GitHub repository and pushed commits.`));
          } catch (err: any) {
            console.log(pc.red(`! Failed to automatically create GitHub repository: ${err.message}`));
            console.log(pc.yellow('Please make sure you are logged in via GitHub CLI (run: gh auth login)'));
            return;
          }
        } else {
          console.log(pc.red('! Aborted: GitHub remote repository is required to sync issues.'));
          return;
        }
      }

      if (remoteUrl) {
        const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+)/);
        if (match) {
          owner = match[1];
          repo = match[2];
          if (repo.endsWith('.git')) {
            repo = repo.slice(0, -4);
          }
        }
      }
    } catch (e) {}

    if (!owner || !repo) {
      console.log(pc.red('! Could not parse GitHub owner/repo.'));
      return;
    }

    const octokit = new Octokit({ auth: token });
    const epics = fs.readdirSync(epicsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'archived')
      .map(d => d.name);

    for (const slug of epics) {
      const epicPath = path.join(epicsDir, slug, 'epic.md');
      if (!fs.existsSync(epicPath)) continue;

      const fileContent = fs.readFileSync(epicPath, 'utf-8');
      const parsed = matter(fileContent);
      const title = `[Epic] ${parsed.data.name || slug}`;
      const body = parsed.content;

      if (!parsed.data.github) {
        try {
          console.log(pc.gray(`Creating issue for Epic ${slug}...`));
          const response = await octokit.issues.create({
            owner, repo, title, body, labels: ['epic', `epic:${slug}`]
          });
          parsed.data.github = `https://github.com/${owner}/${repo}/issues/${response.data.number}`;
          fs.writeFileSync(epicPath, matter.stringify(parsed.content, parsed.data));
          console.log(pc.green(`+ Created Issue #${response.data.number} for ${slug}`));
        } catch (e: any) {
          if (e.message.includes('Bad credentials')) {
             console.log(pc.red(`! Failed: Bad credentials. Your token is expired.`));
             console.log(pc.yellow(`Please run: gh auth login`));
             return; // Stop processing further
          }
          console.log(pc.red(`! Failed to create issue: ${e.message}`));
        }
      }
      
      // Sync tasks
      const tasks = fs.readdirSync(path.join(epicsDir, slug)).filter(f => /^\d+\.md$/.test(f) || f.startsWith('task-'));
      for (const taskFile of tasks) {
        const taskPath = path.join(epicsDir, slug, taskFile);
        const taskParsed = matter(fs.readFileSync(taskPath, 'utf-8'));
        if (!taskParsed.data.github) {
           try {
             const tResponse = await octokit.issues.create({
               owner, repo, title: `[Task] ${taskParsed.data.name || taskFile}`, body: taskParsed.content, labels: ['task', `epic:${slug}`]
             });
             taskParsed.data.github = `https://github.com/${owner}/${repo}/issues/${tResponse.data.number}`;
             fs.writeFileSync(taskPath, matter.stringify(taskParsed.content, taskParsed.data));
             
             // Rename file to issue number if it isn't already
             const newName = `${tResponse.data.number}.md`;
             if (taskFile !== newName) {
                fs.renameSync(taskPath, path.join(epicsDir, slug, newName));
             }
             console.log(pc.green(`+ Created Task Issue #${tResponse.data.number}`));
           } catch (e) {}
        }
      }
    }
    console.log(pc.cyan('\nGitHub Sync complete.'));
  });

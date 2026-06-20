import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

export const syncCommand = new Command('sync')
  .description('Bi-directional sync of active epics with GitHub Issues')
  .action(async () => {
    console.log(pc.blue(pc.bold('\n🔄 Syncing with GitHub Issues...\n')));
    const cwd = process.cwd();
    
    const configPath = path.join(cwd, 'wlp/config.json');
    if (!fs.existsSync(configPath)) {
      console.log(pc.red('✗ wlp/config.json not found.'));
      return;
    }
    
    let token = process.env.GITHUB_TOKEN;
    if (!token) {
      try {
        token = execSync('gh auth token', { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf-8' }).trim();
      } catch (e) {
        console.log(pc.red('✗ GITHUB_TOKEN not set and `gh auth token` failed.'));
        return;
      }
    }

    const epicsDir = path.join(cwd, 'wlp/epics');
    if (!fs.existsSync(epicsDir)) {
      console.log(pc.yellow('No active epics to sync.'));
      return;
    }

    let owner = '', repo = '';
    try {
      const gitConfig = fs.readFileSync(path.join(cwd, '.git/config'), 'utf-8');
      const match = gitConfig.match(new RegExp('github\\\\.com[:/]([^/]+)/([^.]+)\\\\.git'));
      if (match) { owner = match[1]; repo = match[2]; }
    } catch (e) {}

    if (!owner || !repo) {
      console.log(pc.red('✗ Could not parse GitHub owner/repo.'));
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
          console.log(pc.green(`✓ Created Issue #${response.data.number} for ${slug}`));
        } catch (e: any) {
          console.log(pc.red(`✗ Failed to create issue: ${e.message}`));
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
             console.log(pc.green(`✓ Created Task Issue #${tResponse.data.number}`));
           } catch (e) {}
        }
      }
    }
    console.log(pc.cyan('\n✨ GitHub Sync complete!'));
  });

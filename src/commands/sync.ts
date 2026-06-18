import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

export const syncCommand = new Command('sync')
  .description('Bi-directional sync of active changes with GitHub Issues')
  .action(async () => {
    console.log(pc.blue(pc.bold('\n🔄 Syncing with GitHub Issues...\n')));
    const cwd = process.cwd();
    
    // 1. Read config
    const configPath = path.join(cwd, 'wlp/config.json');
    if (!fs.existsSync(configPath)) {
      console.log(pc.red('✗ wlp/config.json not found.'));
      return;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    let token = process.env.GITHUB_TOKEN;
    if (!token) {
      try {
        token = execSync('gh auth token', { stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf-8' }).trim();
      } catch (e) {
        console.log(pc.red('✗ GITHUB_TOKEN not set and `gh auth token` failed.'));
        console.log(pc.yellow('Please either:'));
        console.log(pc.yellow('  1. Run `gh auth login` to authenticate via GitHub CLI'));
        console.log(pc.yellow('  2. Or export GITHUB_TOKEN="your_token"'));
        return;
      }
    }

    const activeDir = path.join(cwd, 'wlp/changes/active');
    if (!fs.existsSync(activeDir)) {
      console.log(pc.yellow('No active changes to sync.'));
      return;
    }

    // Try to parse owner/repo from remote origin
    let owner = '';
    let repo = '';
    try {
      const gitConfig = fs.readFileSync(path.join(cwd, '.git/config'), 'utf-8');
      const match = gitConfig.match(new RegExp('github\\\\.com[:/]([^/]+)/([^.]+)\\\\.git'));
      if (match) {
        owner = match[1];
        repo = match[2];
      }
    } catch (e) {
      console.log(pc.red('✗ Could not determine GitHub owner/repo from .git/config'));
      return;
    }

    if (!owner || !repo) {
      console.log(pc.red('✗ Could not parse GitHub owner/repo.'));
      return;
    }

    console.log(pc.dim(`Repository: ${owner}/${repo}`));
    const octokit = new Octokit({ auth: token });

    const changes = fs.readdirSync(activeDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const slug of changes) {
      const proposalPath = path.join(activeDir, slug, 'proposal.md');
      if (!fs.existsSync(proposalPath)) continue;

      const fileContent = fs.readFileSync(proposalPath, 'utf-8');
      const parsed = matter(fileContent);
      const title = `[${slug}] ${parsed.data.title || slug}`;
      
      let body = parsed.content;
      const tasksPath = path.join(activeDir, slug, 'tasks.md');
      if (fs.existsSync(tasksPath)) {
         body += '\n\n## Tasks\n' + matter(fs.readFileSync(tasksPath, 'utf-8')).content;
      }

      if (!parsed.data.github_issue) {
        // Create new issue
        try {
          console.log(pc.gray(`Creating issue for ${slug}...`));
          const response = await octokit.issues.create({
            owner,
            repo,
            title,
            body,
            labels: [`wlp:${parsed.data.status || 'proposed'}`]
          });
          
          parsed.data.github_issue = response.data.number;
          fs.writeFileSync(proposalPath, matter.stringify(parsed.content, parsed.data));
          console.log(pc.green(`✓ Created Issue #${response.data.number} for ${slug}`));
        } catch (e: any) {
          console.log(pc.red(`✗ Failed to create issue for ${slug}: ${e.message}`));
        }
      } else {
        // Update existing issue
        try {
          console.log(pc.gray(`Updating issue #${parsed.data.github_issue}...`));
          await octokit.issues.update({
            owner,
            repo,
            issue_number: parsed.data.github_issue,
            title,
            body,
            // Replace existing wlp: labels
          });
          console.log(pc.green(`✓ Updated Issue #${parsed.data.github_issue}`));
        } catch (e: any) {
          console.log(pc.red(`✗ Failed to update issue #${parsed.data.github_issue}: ${e.message}`));
        }
      }
    }

    console.log(pc.cyan('\n✨ GitHub Sync complete!'));
  });

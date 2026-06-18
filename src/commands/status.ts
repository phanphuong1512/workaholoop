import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const statusCommand = new Command('status')
  .description('Show active changes and their current phase')
  .action(() => {
    const activeDir = path.join(process.cwd(), 'wlp/changes/active');
    
    if (!fs.existsSync(activeDir)) {
      console.log(pc.yellow('No active changes found. (Directory wlp/changes/active does not exist)'));
      return;
    }

    const changes = fs.readdirSync(activeDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (changes.length === 0) {
      console.log(pc.green('No active changes. You are all caught up!'));
      return;
    }

    console.log(pc.blue(pc.bold('\nActive Changes:\n')));

    changes.forEach(slug => {
      const changeDir = path.join(activeDir, slug);
      const proposalPath = path.join(changeDir, 'proposal.md');
      const tasksPath = path.join(changeDir, 'tasks.md');

      let status = 'unknown';
      let title = slug;
      let tasksCompleted = 0;
      let totalTasks = 0;

      // Check tasks.md first as it's the most up-to-date state if it exists
      if (fs.existsSync(tasksPath)) {
        const fileContent = fs.readFileSync(tasksPath, 'utf-8');
        const parsed = matter(fileContent);
        if (parsed.data.status) status = parsed.data.status;
        if (parsed.data.completed !== undefined) tasksCompleted = parsed.data.completed;
        if (parsed.data.total_tasks !== undefined) totalTasks = parsed.data.total_tasks;
      } 
      // Fallback to proposal.md
      else if (fs.existsSync(proposalPath)) {
        const fileContent = fs.readFileSync(proposalPath, 'utf-8');
        const parsed = matter(fileContent);
        if (parsed.data.status) status = parsed.data.status;
        if (parsed.data.title) title = parsed.data.title;
      }

      // Format output
      let colorFn = pc.white;
      switch(status.toLowerCase()) {
        case 'proposed': colorFn = pc.gray; break;
        case 'specced': colorFn = pc.cyan; break;
        case 'planned': colorFn = pc.blue; break;
        case 'active': colorFn = pc.yellow; break;
        case 'verified': colorFn = pc.green; break;
      }

      const statusBadge = colorFn(`[${status.toUpperCase()}]`.padEnd(12));
      const progress = totalTasks > 0 ? pc.dim(` (${tasksCompleted}/${totalTasks} tasks)`) : '';
      
      console.log(`${statusBadge} ${pc.bold(title)}${progress}`);
    });
    console.log(''); // newline
  });

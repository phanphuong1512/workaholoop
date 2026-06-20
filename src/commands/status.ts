import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const statusCommand = new Command('status')
  .description('Show active epics and their progress')
  .action(() => {
    const epicsDir = path.join(process.cwd(), 'wlp/epics');
    
    if (!fs.existsSync(epicsDir)) {
      console.log(pc.yellow('No active epics found. (Directory wlp/epics does not exist)'));
      return;
    }

    const epics = fs.readdirSync(epicsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== 'archived')
      .map(dirent => dirent.name);

    if (epics.length === 0) {
      console.log(pc.green('No active epics. You are all caught up!'));
      return;
    }

    console.log(pc.blue(pc.bold('\nActive Epics:\n')));

    epics.forEach(slug => {
      const epicDir = path.join(epicsDir, slug);
      const epicPath = path.join(epicDir, 'epic.md');

      let status = 'unknown';
      let title = slug;
      let totalTasks = 0;
      let closedTasks = 0;

      if (fs.existsSync(epicPath)) {
        const fileContent = fs.readFileSync(epicPath, 'utf-8');
        const parsed = matter(fileContent);
        if (parsed.data.status) status = parsed.data.status;
        if (parsed.data.name) title = parsed.data.name;
      }

      // Count tasks inside epic directory matching <N>.md
      const taskFiles = fs.readdirSync(epicDir).filter(file => /^\d+\.md$/.test(file));
      totalTasks = taskFiles.length;

      taskFiles.forEach(file => {
        const taskPath = path.join(epicDir, file);
        const taskContent = fs.readFileSync(taskPath, 'utf-8');
        const parsedTask = matter(taskContent);
        if (parsedTask.data.status === 'closed') {
          closedTasks++;
        }
      });

      // Format output
      let colorFn = pc.white;
      switch(status.toLowerCase()) {
        case 'backlog': colorFn = pc.gray; break;
        case 'in-progress': colorFn = pc.yellow; break;
        case 'active': colorFn = pc.yellow; break;
        case 'completed': colorFn = pc.green; break;
      }

      const statusBadge = colorFn(`[${status.toUpperCase()}]`.padEnd(14));
      const progress = totalTasks > 0 ? pc.dim(` (${closedTasks}/${totalTasks} tasks closed, ${Math.round((closedTasks/totalTasks)*100)}%)`) : '';
      
      console.log(`${statusBadge} ${pc.bold(title)}${progress}`);
    });
    console.log(''); // newline
  });

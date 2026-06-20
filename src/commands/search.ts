import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';

export const searchCommand = new Command('search')
  .description('Full-text search across all epics and PRDs')
  .argument('<query>', 'Text to search for')
  .action((query) => {
    console.log(pc.blue(pc.bold(`\n[Search] "${query}"...\n`)));
    const cwd = process.cwd();
    const epicsDir = path.join(cwd, 'wlp/epics');
    const archiveDir = path.join(cwd, 'wlp/archived');
    const prdsDir = path.join(cwd, 'wlp/prds');

    let foundCount = 0;

    const searchInFile = (filePath: string, label: string, context: string) => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          console.log(pc.green(`+ Found in [${label}] ${context}/${path.basename(filePath)}`));
          foundCount++;
        }
      }
    };

    const searchInDir = (dir: string, label: string) => {
      if (!fs.existsSync(dir)) return;
      const changes = fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'archived')
        .map(d => d.name);

      for (const slug of changes) {
        const changeDir = path.join(dir, slug);
        searchInFile(path.join(changeDir, 'epic.md'), label, slug);
        
        // Search task files
        fs.readdirSync(changeDir).filter(f => /^\d+\.md$/.test(f)).forEach(file => {
          searchInFile(path.join(changeDir, file), label, slug);
        });
      }
    };

    searchInDir(epicsDir, 'ACTIVE EPIC');
    searchInDir(archiveDir, 'ARCHIVED EPIC');

    if (fs.existsSync(prdsDir)) {
      fs.readdirSync(prdsDir).filter(f => f.endsWith('.md')).forEach(file => {
         searchInFile(path.join(prdsDir, file), 'PRD', 'prds');
      });
    }

    if (foundCount === 0) {
      console.log(pc.yellow('No results found.'));
    } else {
      console.log(pc.cyan(`\nFound ${foundCount} matching files.`));
    }
  });

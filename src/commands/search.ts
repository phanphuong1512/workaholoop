import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';

export const searchCommand = new Command('search')
  .description('Full-text search across all change proposals and specs')
  .argument('<query>', 'Text to search for')
  .action((query) => {
    console.log(pc.blue(pc.bold(`\n🔍 Searching for "${query}"...\n`)));
    const cwd = process.cwd();
    const activeDir = path.join(cwd, 'wlp/changes/active');
    const archiveDir = path.join(cwd, 'wlp/changes/archive');

    let foundCount = 0;

    const searchInDir = (dir: string, label: string) => {
      if (!fs.existsSync(dir)) return;
      const changes = fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const slug of changes) {
        const changeDir = path.join(dir, slug);
        const searchInFile = (filePath: string) => {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.toLowerCase().includes(query.toLowerCase())) {
              console.log(pc.green(`✓ Found in [${label}] ${slug}/${path.basename(filePath)}`));
              foundCount++;
            }
          }
        };

        searchInFile(path.join(changeDir, 'proposal.md'));
        searchInFile(path.join(changeDir, 'tasks.md'));
        searchInFile(path.join(changeDir, 'design.md'));
        
        const specsDir = path.join(changeDir, 'specs');
        if (fs.existsSync(specsDir)) {
          fs.readdirSync(specsDir).forEach(file => {
             searchInFile(path.join(specsDir, file));
          });
        }
      }
    };

    searchInDir(activeDir, 'ACTIVE');
    searchInDir(archiveDir, 'ARCHIVE');

    if (foundCount === 0) {
      console.log(pc.yellow('No results found.'));
    } else {
      console.log(pc.cyan(`\n✨ Found ${foundCount} matching files.`));
    }
  });

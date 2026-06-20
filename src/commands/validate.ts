import { Command } from 'commander';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const validateCommand = new Command('validate')
  .description('Check file structure and frontmatter integrity')
  .action(() => {
    console.log(pc.blue(pc.bold('\n🔍 Validating WLP Workspace\n')));
    const cwd = process.cwd();
    let errors = 0;

    const checkFile = (filepath: string) => {
      if (!fs.existsSync(path.join(cwd, filepath))) {
        console.log(pc.red(`  ✗ Missing file: ${filepath}`));
        errors++;
      } else {
        console.log(pc.green(`  ✓ Found: ${filepath}`));
      }
    };

    console.log(pc.bold('Core Files:'));
    checkFile('wlp/config.json');
    checkFile('wlp/constitution.md');
    console.log('');

    const checkEpicFolder = (basePath: string) => {
      const dirPath = path.join(cwd, basePath);
      if (!fs.existsSync(dirPath)) return;
      
      const epics = fs.readdirSync(dirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'archived')
        .map(dirent => dirent.name);

      epics.forEach(slug => {
        const epicPath = path.join(basePath, slug, 'epic.md');
        if (!fs.existsSync(path.join(cwd, epicPath))) {
          console.log(pc.red(`  ✗ Missing epic.md in ${basePath}/${slug}`));
          errors++;
        } else {
          try {
            const parsed = matter(fs.readFileSync(path.join(cwd, epicPath), 'utf-8'));
            if (!parsed.data.status) {
              console.log(pc.red(`  ✗ Missing 'status' frontmatter in ${epicPath}`));
              errors++;
            } else {
              console.log(pc.green(`  ✓ Valid ${epicPath}`));
            }
          } catch (e) {
            console.log(pc.red(`  ✗ Malformed frontmatter in ${epicPath}`));
            errors++;
          }
        }
      });
    };

    console.log(pc.bold('Active Epics:'));
    checkEpicFolder('wlp/epics');
    console.log('');

    console.log(pc.bold('Archived Epics:'));
    checkEpicFolder('wlp/archived');
    console.log('');

    if (errors === 0) {
      console.log(pc.green(pc.bold('✨ Workspace is perfectly valid!\n')));
    } else {
      console.log(pc.red(pc.bold(`⚠️ Found ${errors} validation error(s).\n`)));
      process.exitCode = 1;
    }
  });

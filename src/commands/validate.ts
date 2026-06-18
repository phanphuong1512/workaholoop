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

    const checkChangeFolder = (basePath: string) => {
      const dirPath = path.join(cwd, basePath);
      if (!fs.existsSync(dirPath)) return;
      
      const changes = fs.readdirSync(dirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      changes.forEach(slug => {
        const proposalPath = path.join(basePath, slug, 'proposal.md');
        if (!fs.existsSync(path.join(cwd, proposalPath))) {
          console.log(pc.red(`  ✗ Missing proposal.md in ${basePath}/${slug}`));
          errors++;
        } else {
          try {
            const parsed = matter(fs.readFileSync(path.join(cwd, proposalPath), 'utf-8'));
            if (!parsed.data.status) {
              console.log(pc.red(`  ✗ Missing 'status' frontmatter in ${proposalPath}`));
              errors++;
            } else {
              console.log(pc.green(`  ✓ Valid ${proposalPath}`));
            }
          } catch (e) {
            console.log(pc.red(`  ✗ Malformed frontmatter in ${proposalPath}`));
            errors++;
          }
        }
      });
    };

    console.log(pc.bold('Active Changes:'));
    checkChangeFolder('wlp/changes/active');
    console.log('');

    console.log(pc.bold('Archived Changes:'));
    checkChangeFolder('wlp/changes/archive');
    console.log('');

    if (errors === 0) {
      console.log(pc.green(pc.bold('✨ Workspace is perfectly valid!\n')));
    } else {
      console.log(pc.red(pc.bold(`⚠️ Found ${errors} validation error(s).\n`)));
      process.exitCode = 1;
    }
  });

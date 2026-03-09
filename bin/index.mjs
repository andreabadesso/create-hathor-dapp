#!/usr/bin/env node

import { cpSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const templateDir = resolve(__dirname, '..', 'templates', 'default');

async function main() {
  console.log('\n  Create Hathor dApp\n');

  let projectName = process.argv[2];

  if (!projectName) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    projectName = await rl.question('  Project name: ');
    rl.close();
  }

  if (!projectName || projectName.trim() === '') {
    console.error('  Please provide a project name.');
    process.exit(1);
  }

  projectName = projectName.trim();
  const targetDir = resolve(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    console.error(`\n  Directory "${projectName}" already exists.\n`);
    process.exit(1);
  }

  console.log(`\n  Creating a new Hathor dApp in ${targetDir}...\n`);

  // Copy template
  cpSync(templateDir, targetDir, { recursive: true });

  // Rename gitignore -> .gitignore (npm strips .gitignore from published packages)
  const gitignorePath = join(targetDir, 'gitignore');
  if (existsSync(gitignorePath)) {
    renameSync(gitignorePath, join(targetDir, '.gitignore'));
  }

  // Update package.json with project name
  const pkgPath = join(targetDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.name = projectName;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // Copy .env.local.example to .env.local for immediate development
  const envExamplePath = join(targetDir, '.env.local.example');
  const envLocalPath = join(targetDir, '.env.local');
  if (existsSync(envExamplePath)) {
    cpSync(envExamplePath, envLocalPath);
  }

  // Install dependencies
  console.log('  Installing dependencies...\n');
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  } catch {
    console.error('\n  Failed to install dependencies. You can install them manually:\n');
    console.log(`    cd ${projectName}`);
    console.log('    npm install\n');
  }

  // Init git
  try {
    execSync('git init', { cwd: targetDir, stdio: 'ignore' });
    execSync('git add -A', { cwd: targetDir, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from create-hathor-dapp"', {
      cwd: targetDir,
      stdio: 'ignore',
    });
  } catch {
    // Git init is optional, don't fail if git isn't available
  }

  console.log(`\n  Success! Created ${projectName} at ${targetDir}\n`);
  console.log('  Inside that directory, you can run:\n');
  console.log('    npm run dev       Start the development server');
  console.log('    npm run build     Build for production');
  console.log('    npm run test      Run unit tests');
  console.log('    npm run lint      Run linter\n');
  console.log('  Get started:\n');
  console.log(`    cd ${projectName}`);
  console.log('    npm run dev\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

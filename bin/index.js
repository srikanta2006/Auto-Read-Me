#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import boxen from 'boxen';
import { exec } from 'child_process';
import Configstore from 'configstore';
import { getProjectContext, generateReadmeContent } from '../lib/analyzer.js';

// Initialize Configstore with the name from package.json
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const config = new Configstore(pkg.name);

const program = new Command();

const header = boxen(
  chalk.bold.hex('#00ffee')('📦 README GENESIS PRO v2.5') + '\n' +
  chalk.dim('Smart Context-Aware Documentation Engine'),
  { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'cyan', textAlign: 'center' }
);

/**
 * Handles API Key persistence and acquisition
 */
async function ensureApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

  let storedKey = config.get('apiKey');
  if (storedKey) return storedKey;

  console.log(chalk.yellow('ℹ No API Key found. Let\'s set it up!'));
  console.log(chalk.dim('Get one for free at: https://aistudio.google.com/app/apikey\n'));

  const { newKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'newKey',
      message: '🔑 Enter your Gemini API Key:',
      validate: (input) => input.length > 10 || 'Please enter a valid API key.'
    }
  ]);

  config.set('apiKey', newKey);
  console.log(chalk.green('✔ Key saved globally! You won\'t need to enter it again.\n'));
  return newKey;
}

program
  .name('gen-readme')
  .description('AI-powered README generator')
  .version(pkg.version);

program.action(async () => {
  console.log(header);

  const apiKey = await ensureApiKey();

  try {
    // --- 1. ANALYSIS PHASE ---
    const scanSpinner = ora('🔍 Analyzing project DNA...').start();
    const context = await getProjectContext();
    scanSpinner.succeed(chalk.green('Analysis Complete.'));

    console.log(chalk.cyan.dim(`   • Suggestion: '${context.suggestedType}' blueprint fits your stack.`));
    if (context.assets.primaryPath) console.log(chalk.cyan.dim(`   • Found asset: ${context.assets.primaryPath}`));
    console.log('');

    // --- 2. TEMPLATE SELECTION ---
    const { templateStyle } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateStyle',
        message: 'Select the documentation blueprint:',
        default: context.suggestedType,
        choices: [
          { name: `🌐 Full Comprehensive ${context.suggestedType === 'full' ? chalk.green('(Recommended)') : ''}`, value: 'full' },
          { name: `🏢 Enterprise ${context.suggestedType === 'enterprise' ? chalk.green('(Recommended)') : ''}`, value: 'enterprise' },
          { name: `⚡ Essential ${context.suggestedType === 'minimal' ? chalk.green('(Recommended)') : ''}`, value: 'minimal' },
          { name: `📦 Library/NPM ${context.suggestedType === 'library' ? chalk.green('(Recommended)') : ''}`, value: 'library' }
        ]
      }
    ]);

    // --- 3. GENERATION PHASE ---
    const genSpinner = ora(chalk.magenta('Synthesizing documentation...')).start();
    const markdown = await generateReadmeContent(apiKey, context, templateStyle);
    
    // --- 4. SAVE LOGIC ---
    const filePath = './README.md';
    const exists = fs.existsSync(filePath);
    fs.writeFileSync(filePath, markdown);
    genSpinner.stop();

    console.log(boxen(
      (exists ? chalk.yellow('🔄 README.md Updated!') : chalk.green('🚀 README.md Created!')),
      { padding: 1, borderStyle: 'round', borderColor: exists ? 'yellow' : 'green' }
    ));

    // --- 5. POST-GENERATION ACTIONS ---
    const { next } = await inquirer.prompt([
      {
        type: 'list',
        name: 'next',
        message: 'Final Action:',
        choices: [
          { name: '👁️  Preview (Open File)', value: 'open' },
          { name: '📦 Stage for Git', value: 'git' },
          { name: '👋 Exit', value: 'exit' }
        ]
      }
    ]);

    if (next === 'open') {
      const openCmd = process.platform === 'win32' ? 'start' : 'open';
      exec(`${openCmd} README.md`);
    } else if (next === 'git') {
      exec('git add README.md');
      console.log(chalk.green('✔ Staged to Git.'));
    }

  } catch (err) {
    console.error(chalk.red('\n✖ Failed:'), err.message);
  }
});

// Config Command for User Management
program
  .command('config')
  .description('Manage global configuration')
  .action(async () => {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      choices: ['Reset API Key', 'Show Config Path', 'Exit']
    }]);
    
    if (action === 'Reset API Key') {
      config.delete('apiKey');
      console.log(chalk.green('✔ API Key removed.'));
    } else if (action === 'Show Config Path') {
      console.log(chalk.cyan(`Config stored at: ${config.path}`));
    }
  });

program.parse(process.argv);
#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import boxen from 'boxen';
import dns from 'dns';
import { exec } from 'child_process';
import Configstore from 'configstore';
import { getProjectContext, generateReadmeContent } from '../lib/analyzer.js';
import { ProviderFactory } from '../lib/factory.js';

// Resolve package.json safely for global installation
const pkgPath = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(pkgPath));
const config = new Configstore(pkg.name);

const program = new Command();

const header = boxen(
  chalk.bold.hex('#00ffee')('📦 README GENESIS PRO v3.0') + '\n' +
  chalk.dim('Smart Context-Aware Documentation Engine'),
  { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'cyan', textAlign: 'center' }
);

/**
 * Resilience: Network Connectivity Check
 */
async function checkOnline() {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => resolve(err === null));
  });
}

/**
 * Handles Provider & API Key persistence
 */
async function ensureProviderConfig() {
  // Check environment variables first
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY };
  if (process.env.OPENAI_API_KEY) return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY };

  // Check stored config
  let storedConfig = config.get('providerConfig');
  if (storedConfig && storedConfig.apiKey) return storedConfig;

  console.log(chalk.yellow('\nℹ No API Key found. Let\'s set it up!'));
  console.log(chalk.dim('Supported: Gemini (Google), OpenAI (GPT), Anthropic (Claude)\n'));

  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: '🔑 Enter your API Key:',
      validate: (input) => input.length > 10 || 'Please enter a valid API key.'
    }
  ]);

  const spinner = ora('Verifying and detecting provider...').start();

  const provider = ProviderFactory.detectProvider(apiKey);
  const aiInstance = ProviderFactory.get(provider, apiKey);
  const isValid = await aiInstance.validate();

  if (!isValid) {
    spinner.fail(chalk.red(`Could not validate key for detected provider: ${chalk.bold(provider)}`));
    console.log(chalk.yellow("Tip: Check your key or try again."));
    process.exit(1);
  }

  spinner.succeed(chalk.green(`Verified! Detected Provider: ${chalk.bold(provider.toUpperCase())}`));

  const newConfig = { provider, apiKey };
  config.set('providerConfig', newConfig);

  return newConfig;
}

program
  .name('gen-readme')
  .description('AI-powered README generator (Multi-Provider)')
  .version(pkg.version);

program.action(async () => {
  console.log(header);

  // 0. Resilience Check
  if (!(await checkOnline())) {
    console.log(chalk.red.bold('\n✖ Error: No internet connection. AI generation requires a network.\n'));
    process.exit(1);
  }

  const { provider, apiKey, defaultModel } = await ensureProviderConfig();

  try {
    // --- 1. ANALYSIS PHASE ---
    const scanSpinner = ora('🔍 Analyzing project DNA...').start();
    const context = await getProjectContext();
    scanSpinner.succeed(chalk.green('Analysis Complete.'));

    console.log(chalk.cyan.dim(`   • Suggestion: '${context.suggestedType}' blueprint fits your stack.`));
    if (context.assets.primaryPath) console.log(chalk.cyan.dim(`   • Found asset: ${context.assets.primaryPath}`));
    console.log('');

    // --- 2. MODEL SELECTION ---
    let selectedModel = defaultModel;

    // Check if the default model is still valid for the current provider
    if (selectedModel) {
      console.log(chalk.dim(`⚡ Using default model: ${chalk.bold(selectedModel)}`));
    } else {
      const fetchSpinner = ora('Fetching available models...').start();
      try {
        const aiInstance = ProviderFactory.get(provider, apiKey);
        const models = await aiInstance.listModels();
        fetchSpinner.stop();

        const response = await inquirer.prompt([
          {
            type: 'list',
            name: 'model',
            message: `Select ${chalk.bold(provider)} Model:`,
            choices: models
          }
        ]);
        selectedModel = response.model;

        // Ask to save as default
        const { saveDefault } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'saveDefault',
            message: 'Save this as your default model?',
            default: false
          }
        ]);

        if (saveDefault) {
          const currentConfig = config.get('providerConfig') || {};
          config.set('providerConfig', { ...currentConfig, defaultModel: selectedModel });
          console.log(chalk.green('✔ Default model saved.'));
        }

      } catch (e) {
        fetchSpinner.fail('Failed to fetch models.');
        console.error(e);
        process.exit(1);
      }
    }

    // --- 3. TEMPLATE SELECTION ---
    const { templateStyle, authorPersona, projectHook } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateStyle',
        message: 'Select the documentation blueprint:',
        default: context.suggestedType,
        choices: [
          { name: `🌐 Full Comprehensive  ${context.suggestedType === 'full' ? chalk.bold.green('[Recommended]') : chalk.dim('(Web Apps & Large Projects)')}`, value: 'full' },
          { name: `🏢 Enterprise         ${context.suggestedType === 'enterprise' ? chalk.bold.green('[Recommended]') : chalk.dim('(Backends & Stacks)')}`, value: 'enterprise' },
          { name: `⚡ Essential          ${context.suggestedType === 'minimal' ? chalk.bold.green('[Recommended]') : chalk.dim('(Small Scripts & Utils)')}`, value: 'minimal' },
          { name: `📦 Library/NPM        ${context.suggestedType === 'library' ? chalk.bold.green('[Recommended]') : chalk.dim('(CLI Tools & Packages)')}`, value: 'library' }
        ]
      },
      {
        type: 'list',
        name: 'authorPersona',
        message: 'Who is the primary audience/author?',
        choices: [
          { name: '🎓 Student / Portfolio (Educational, enthusiastic)', value: 'student' },
          { name: '🧙‍♂️ Senior Engineer (Concise, architectural, robust)', value: 'senior' },
          { name: '🚀 Startup / Product (Value-focused, user-centric)', value: 'startup' },
          { name: '🤝 Open Source Maintainer (Community-focused, contribution-ready)', value: 'opensource' }
        ]
      },
      {
        type: 'input',
        name: 'projectHook',
        message: 'What is the core "Hook" or "Vision" of this project? (Optional, 1 sentence)',
        default: ""
      }
    ]);

    // --- 4. GENERATION PHASE ---
    const genSpinner = ora(chalk.magenta(`Synthesizing documentation with ${provider}...`)).start();
    const markdown = await generateReadmeContent(apiKey, context, templateStyle, provider, selectedModel, { authorPersona, projectHook });

    // --- 5. SAVE LOGIC ---
    const filePath = './README.md';
    const exists = fs.existsSync(filePath);
    fs.writeFileSync(filePath, markdown);
    genSpinner.stop();

    console.log(boxen(
      (exists ? chalk.yellow('🔄 README.md Updated!') : chalk.green('🚀 README.md Created!')),
      { padding: 1, borderStyle: 'round', borderColor: exists ? 'yellow' : 'green' }
    ));

    // --- 6. POST-GENERATION ACTIONS ---
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

// Config Management
program
  .command('config')
  .description('Manage global configuration')
  .action(async () => {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      choices: ['Reset API Key & Provider', 'Clear Default Model', 'Show Config', 'Exit']
    }]);

    if (action === 'Reset API Key & Provider') {
      config.delete('providerConfig');
      config.delete('apiKey'); // cleanup old legacy key
      console.log(chalk.green('✔ Configuration cleared.'));
    } else if (action === 'Clear Default Model') {
      const current = config.get('providerConfig');
      if (current) {
        delete current.defaultModel;
        config.set('providerConfig', current);
        console.log(chalk.green('✔ Default model cleared.'));
      }
    } else if (action === 'Show Config') {
      console.log(chalk.cyan(`Config stored at: ${config.path}`));
      console.log(config.get('providerConfig') || "No config set.");
    }
  });

program.parse(process.argv);
<div align="center">

# ✨ README Genesis Pro: AI-Powered CLI for Instant Project Documentation

### Transform your project's context into a professional `README.md` with intelligent automation.

[![Node.js version](https://img.shields.io/badge/node->=18-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange)](package.json)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture)

</div>

## 💡 The Value Proposition

*   **Problem**: Writing comprehensive, well-structured `README.md` files is time-consuming and often overlooked, leading to poor project discoverability and developer friction.
*   **Solution**: `gen-readme` leverages advanced AI to analyze your project's structure, dependencies, and code patterns, instantly generating a high-quality `README.md`.
*   **Benefit**: Save hours, ensure consistent documentation standards, and elevate your project's first impression with minimal effort.

## 🚀 Quick Start

```bash
npm install -g auto-readme-cli
gen-readme
```

## 📋 Features

*   **AI-Driven Content Generation**: Intelligently analyzes your project to draft comprehensive documentation.
*   **Context-Aware Analysis**: Scans file structure, `package.json`, and common code patterns to understand project scope.
*   **Interactive Setup**: Guides you through API key configuration and generation preferences.
*   **Resilience**: Includes network connectivity checks for reliable operation.
*   **Persistent Configuration**: Securely stores API keys for subsequent uses.

## ⚙️ Installation

### Global Installation

```bash
npm install -g auto-readme-cli
```

### Local Installation (for development/contributions)

```bash
git clone https://github.com/your-username/auto-readme-cli.git
cd auto-readme-cli
npm install
```

## ➡️ Usage

1.  Navigate to your project's root directory in the terminal.
2.  Run the command:

    ```bash
    gen-readme
    ```

3.  Follow the interactive prompts to configure your Gemini API Key (if not already set) and confirm README generation.

### Configuration

`gen-readme` primarily uses the Gemini API for its AI capabilities.

| Variable Name         | Type           | Description                                       | Persistence   |
| :-------------------- | :------------- | :------------------------------------------------ | :------------ |
| `GEMINI_API_KEY`      | Environment    | Your Google Gemini API key.                       | Session-based |
| `configstore:apiKey`  | Configuration  | Stores your Gemini API key for future use.        | Persistent    |

*   **Environment Variable**: Set `GEMINI_API_KEY` in your shell profile (e.g., `.bashrc`, `.zshrc`) or before running the command for a single session.
*   **Interactive Prompt**: If no key is found, `gen-readme` will prompt you to enter it, then store it securely using `configstore`.

## 🏗️ Architecture

### Logic Flow

```mermaid
graph TD
    A[Start: `gen-readme` CLI] --> B{Initialize CLI};
    B --> C{Display Header & Version};
    C --> D{Check Internet Connectivity?};
    D -- No --> E[Error: No Internet];
    D -- Yes --> F{API Key Present?};
    F -- ENV Var `GEMINI_API_KEY` --> G[Use ENV Key];
    F -- ConfigStore `apiKey` --> H[Use Stored Key];
    F -- Neither --> I[Prompt for Gemini API Key];
    I --> J[Store Key in ConfigStore];
    (G, H, J) --> K[Analyze Project Context];
    K -- `lib/analyzer.js:getProjectContext()` --> L[Generate README Content];
    L -- `lib/analyzer.js:generateReadmeContent()` --> M{Confirm Write/Overwrite `README.md`?};
    M -- Yes --> N[Write `README.md` to Project Root];
    M -- No --> O[Exit Without Writing];
    N --> P[Success Message];
    (E, O, P) --> Q[End];
```

### Key Architectural Patterns

| Pattern               | Description                                                               | Implementation                                              |
| :-------------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------- |
| **Command Line Interface (CLI)** | Provides a text-based interface for user interaction.                     | `commander` for command parsing, `bin/index.js` entry point. |
| **Interactive Prompting** | Engages users through questions and options in the terminal.              | `inquirer` for API key input and write confirmation.        |
| **Configuration Management** | Handles storing and retrieving user-specific settings securely.           | `dotenv` for environment variables, `configstore` for persistence. |
| **Contextual Analysis** | Inspects project files and structure to gather relevant data.             | `lib/analyzer.js` scans file system and `package.json`.   |
| **AI Content Generation** | Delegates content creation to an external intelligent model.              | Integrates with Google Gemini API.                          |
| **Network Resilience** | Ensures graceful handling of network unavailability.                      | `dns` lookup for connectivity checks.                       |

## 🌳 Project Structure

```
.
├── bin/
│   └── index.js       # CLI entry point, orchestrates commands, user interaction, and core logic calls.
├── lib/
│   ├── analyzer.js    # Core logic: Functions for project context analysis and AI content generation.
│   └── analyzer.test.js # Unit tests for the analyzer module, ensuring reliable context interpretation.
├── templates/
│   └── minimal.js     # Default or example README templates used as a base for AI generation.
├── package.json       # Project metadata, scripts, and managed dependencies.
├── README.md          # This documentation file.
└── temp_test/         # Temporary directory for development testing or intermediate build artifacts.
```

### Core Dependencies

| Tool            | Purpose                                            |
| :-------------- | :------------------------------------------------- |
| `commander`     | Robust CLI parsing and command definition.         |
| `inquirer`      | Interactive command-line prompts for user input.   |
| `chalk`         | Terminal string styling for enhanced readability.  |
| `ora`           | Elegant terminal spinners for loading states.      |
| `boxen`         | Draws boxes in the terminal for visual emphasis.   |
| `configstore`   | Persistently stores user-specific configurations.  |
| `dotenv`        | Loads environment variables from `.env` files.     |
| `fs`            | Node.js built-in for file system operations.       |
| `dns`           | Node.js built-in for network connectivity checks.  |
| `child_process` | Node.js built-in for executing shell commands.     |

## 🔮 Roadmap

*   **Custom Template Support**: Allow users to provide their own `README` templates.
*   **Framework-Specific Analysis**: Enhanced AI analysis to recognize and document specific frameworks (e.g., React, Vue, Angular, Node.js, Python/Django/Flask).
*   **Multi-Model Integration**: Support for additional AI models (e.g., OpenAI GPT-4, Llama 2).
*   **Interactive README Editor**: Post-generation, provide an in-CLI editor for fine-tuning.
*   **Version Control Integration**: Optional commits or pull requests for generated READMEs.
*   **GUI Version**: Develop a desktop application for users preferring a graphical interface.
<div align="center">

# README GENESIS: Documentation, Simplified.

Empower your projects with instant, intelligent READMEs that truly communicate.

[![Node.js Version](https://img.shields.io/badge/node->=18-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.0.0-orange)](package.json)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture)

</div>

## The Value Proposition

**To make README creation easy** is not just a goal, it's a strategic imperative for every project. Tedious documentation directly impacts adoption, developer onboarding, and project longevity. README Genesis addresses this head-on:

*   **Problem:** Manual README creation is time-consuming, inconsistent, and often deferred, leading to outdated or missing project documentation.
*   **Solution:** Automatically generate comprehensive, context-aware READMEs using advanced AI, ensuring every project is well-documented from day one.
*   **Impact:** Accelerate project launch, improve developer experience, and maintain robust documentation with minimal effort.

### Quick Start

Jumpstart your project documentation immediately.

```bash
npx readme-genesis@latest init
```

## Features

README Genesis is engineered for efficiency and adaptability.

*   **Context-Aware Analysis**: Intelligently scans your project directory to understand its structure and dependencies.
*   **Multi-Provider AI Integration**: Supports OpenAI, Google Gemini, and Anthropic for flexible AI model selection.
*   **Configurable Generation**: Tailor README content with specific author personas, project hooks, and template styles.
*   **API Key Management**: Securely manage API keys via environment variables or persistent local configuration.
*   **Resilient Operations**: Includes network connectivity checks and robust error handling.
*   **CLI-Driven**: A powerful command-line interface for rapid deployment and interactive setup.

## Installation

Install README Genesis globally for command-line access.

```bash
npm install -g readme-genesis
```

## Usage

Generate your project's README with a single command.

### Initialization

Use `init` to start the interactive generation process.

```bash
readme-genesis init
```

This command will guide you through API key configuration, AI model selection, and provide options for customizing your README.

### Configuration

Customize README Genesis behavior using environment variables or command-line flags.

| Variable Name           | Type     | Description                                               | Example Value                 |
| :---------------------- | :------- | :-------------------------------------------------------- | :---------------------------- |
| `OPENAI_API_KEY`        | `string` | Your API key for OpenAI services.                         | `sk-xxxxxxxxxxxxxxxxxxxxxxxx` |
| `GEMINI_API_KEY`        | `string` | Your API key for Google Gemini services.                  | `AIzaS_xxxxxxxxxxxxxxxxxxxx`  |
| `ANTHROPIC_API_KEY`     | `string` | Your API key for Anthropic services.                      | `sk-ant-api03-xxxxxxxxxxxxxx` |
| `--template-style`      | `string` | The desired style for the generated README.               | `minimal`, `detailed`         |
| `--author-persona`      | `string` | The persona for the README author (e.g., `expert`, `beginner`). | `Senior DevOps Engineer`      |
| `--project-hook`        | `string` | A specific core concept or hook for the project.          | `Microservice Orchestration`  |
| `--output-file <path>`  | `string` | Specify the output file path for the README.              | `./docs/README.md`            |

**Note:** Environment variables take precedence over stored configurations for API keys.

### Dependencies

Core external dependencies for `readme-genesis`.

| Tool        | Purpose                             | Version |
| :---------- | :---------------------------------- | :------ |
| `commander` | CLI command parsing and management  | `^11.1.0` |
| `inquirer`  | Interactive command-line prompts    | `^9.2.14` |
| `chalk`     | Terminal string styling             | `^5.3.0`  |
| `ora`       | Elegant terminal spinner           | `^8.0.1`  |
| `configstore`| Persist user configuration data     | `^6.0.0`  |
| `boxen`     | Create boxes in the terminal        | `^7.1.1`  |
| `dotenv`    | Load environment variables from `.env` | `^16.3.1` |

## Architecture

README Genesis is built on a modular, resilient architecture designed for extensibility and maintainability.

### Logic Flow

The system processes README generation through a clear, automated sequence.

```mermaid
graph TD
    A[Start: readme-genesis init] --> B{Check Network Connectivity?};
    B -- Yes --> C{API Provider Configured?};
    C -- No / Prompt --> D[Prompt for Provider & API Key];
    C -- Yes --> E[Detect & Verify Provider];
    D --> E;
    E -- Valid --> F[Scan Project DNA: getProjectContext];
    F --> G{Select AI Model (if multiple available)};
    G --> H[Synthesize Content: generateReadmeContent];
    H --> I[Write README.md to File System];
    I --> J[Open README in Editor];
    J --> K[End];
    E -- Invalid --> D;
```

### Detected Patterns

Our architecture leverages established design patterns to maintain robustness and adaptability.

| Pattern                  | Description                                                | Modules Involved                                   | Benefit                                      |
| :----------------------- | :--------------------------------------------------------- | :------------------------------------------------- | :------------------------------------------- |
| **Factory Method**       | Defines an interface for creating objects, but lets subclasses alter the type of objects that will be created. | `lib/factory.js`, `lib/providers/*`             | Decouples client code from concrete provider classes, enabling easy addition of new AI services. |
| **Strategy**             | Defines a family of algorithms, encapsulates each one, and makes them interchangeable. | `lib/providers/base.js` and concrete providers | Allows easy switching between different AI service implementations (OpenAI, Gemini, Anthropic) at runtime. |
| **Facade**               | Provides a simplified interface to a library, a framework, or any other complex set of classes. | `lib/analyzer.js` (orchestrates context gathering and content generation) | Simplifies interaction with the core logic, presenting a high-level API for README generation. |
| **Command**              | Encapsulates a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations. | `commander` (CLI commands)                      | Organizes CLI actions, making the command structure clear and extensible. |
| **Configuration Management** | Handles storing and retrieving application settings persistently. | `configstore`                                      | Manages API keys and provider preferences, ensuring a consistent user experience across sessions. |

## Project Structure

A clear project structure facilitates development and maintenance.

```
.
├── bin/
│   ├── index.js                  # CLI Entry Point: Main executable for readme-genesis.
├── lib/
│   ├── analyzer.js               # Core Logic: Analyzes project context and orchestrates content generation.
│   ├── analyzer.test.js          # Unit tests for the analyzer module.
│   ├── factory.js                # AI Provider Factory: Manages instantiation of AI service providers.
│   └── providers/
│       ├── anthropic.js          # Anthropic AI Provider integration.
│       ├── base.js               # Base class/interface for all AI providers.
│       ├── gemini.js             # Google Gemini AI Provider integration.
│       └── openai.js             # OpenAI AI Provider integration.
├── templates/
│   └── minimal.js                # Example template for README generation.
├── test/
│   └── manual_verify.js          # Scripts for manual verification during development.
├── package.json                  # Project metadata and dependencies.
├── README.md                     # This documentation file.
└── auto-readme-cli-1.0.0.tgz     # Packaged CLI artifact.
```

## Roadmap

Our vision for README Genesis is continuous evolution, driven by community needs and technological advancements.

### Future Enhancements

*   [ ] **Custom Template Support**: Allow users to define and integrate their own README markdown templates.
*   [ ] **Git Integration**: Automatically detect project information (author, license, contributors) from Git history.
*   [ ] **Framework-Specific Context**: Enhance analysis to detect and adapt READMEs for popular frameworks (e.g., React, Angular, Vue, Next.js, Django).
*   [ ] **Interactive Markdown Editor**: Provide an optional web-based or TUI interface for fine-tuning generated READMEs before saving.
*   [ ] **Multilingual READMEs**: Support generating documentation in multiple languages.
*   [ ] **CI/CD Integration**: Develop actions or plugins to automate README updates in CI/CD pipelines.
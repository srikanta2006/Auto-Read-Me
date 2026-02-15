<div align="center">

# 🚀 README GENESIS PRO

Intelligent Context-Aware README Generation for Technical Projects.

[![Node.js Version](https://img.shields.io/badge/node->=18-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.0.0-orange)](package.json)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture)

</div>

## ✨ The Value Proposition

Tired of manual, time-consuming README creation? **README GENESIS PRO** automates the process, delivering polished, context-aware documentation with minimal effort.

*   **⚡️ Instant Documentation**: Generate comprehensive `README.md` files in seconds, freeing up valuable development time.
*   **🧠 Context-Aware AI**: Leverages cutting-edge AI (Gemini, OpenAI, Anthropic) to analyze your project's DNA and craft relevant, high-quality content.
*   **⚙️ Seamless Integration**: A powerful CLI tool designed for developers, fitting perfectly into your existing workflow.

### Quick Start

```bash
npx readme-genesis
```

---

## 🏛️ Architecture

### Logic Flow

The **README GENESIS PRO** CLI orchestrates a sophisticated process, from user interaction to AI-driven content generation, ensuring a smooth and intelligent documentation workflow.

```mermaid
graph TD
    A[User Input] --> B(CLI Interface: `bin/index.js`)
    B --> C{Network Check: dns.lookup}
    B --> D[Configstore: API Key & Settings]
    D -- Persists --> B
    C -- Online? --> B

    subgraph Core Logic
        B --> E(Project Analyzer: `lib/analyzer.js`)
        E --> F[File System Scanner]
        E --> G[Context Extractor: Code & Structure]
        G -- Project Context --> H[Provider Factory: `lib/factory.js`]
    end

    subgraph AI Providers
        H --> I(OpenAI API: `lib/providers/openai.js`)
        H --> J(Gemini API: `lib/providers/gemini.js`)
        H --> K(Anthropic API: `lib/providers/anthropic.js`)
    end

    I,J,K -- AI-Generated Content --> L[Content Generator: `lib/analyzer.js`]
    L --> M[Template Formatter: `templates/*`]
    M -- Formatted README --> B
    B --> N[Output README.md]
    N --> O[User (New README!)]
```

### Design Patterns

| Pattern                  | Description                                                                 | Implementation                                                                     |
| :----------------------- | :-------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **Factory Method**       | Defines an interface for creating an object, but lets subclasses alter the type of objects that will be created. | `ProviderFactory` (`lib/factory.js`) abstracts AI provider instantiation.          |
| **Strategy**             | Defines a family of algorithms, encapsulates each one, and makes them interchangeable. | AI Provider modules (`lib/providers/*`) implement a common `BaseProvider` interface. |
| **Configuration Mgmt.**  | Handles external configuration settings to control application behavior.    | `Configstore` and `dotenv` for API keys and user preferences.                      |
| **CLI Interface**        | Provides an intuitive command-line experience for user interaction.         | `Commander.js`, `Inquirer.js`, `Chalk`, `Ora` for robust CLI.                      |

---

## 🌳 Project Structure

A high-fidelity overview of the project's directory and file organization.

```
.
├── bin/
│   └── index.js             # 🚀 CLI Entry Point & Orchestrator
├── lib/
│   ├── analyzer.js          # 🧠 Core Logic: Project context analysis & content generation
│   ├── analyzer.test.js     # Unit tests for the analyzer
│   ├── factory.js           # 🏭 AI Provider Factory
│   └── providers/           # AI API Integration Modules
│       ├── anthropic.js     # Anthropic (Claude) API client
│       ├── base.js          # Base class/interface for AI providers
│       ├── gemini.js        # Google Gemini API client
│       └── openai.js        # OpenAI (GPT) API client
├── templates/
│   └── minimal.js           # Default README template (output structure)
├── test/
│   └── manual_verify.js     # Manual verification scripts
├── temp_test/               # Temporary test files/workspace
├── auto-readme-cli-1.0.0.tgz# Packed CLI archive (distribution)
├── demo_terminal.html       # Web-based terminal demo (potential)
├── package.json             # Project metadata & dependencies
└── README.md                # This documentation
```

---

## 🛠️ Setup & Usage

### Installation

Install `readme-genesis` globally using npm for direct access from your terminal:

```bash
npm install -g readme-genesis
```

Alternatively, use `npx` for a one-time execution without global installation:

```bash
npx readme-genesis
```

### Configuration

**README GENESIS PRO** requires an API key from one of the supported AI providers. Keys can be set as environment variables or interactively configured upon first use.

| Environment Variable    | Purpose                                 | Precedence   |
| :---------------------- | :-------------------------------------- | :----------- |
| `GEMINI_API_KEY`        | API Key for Google Gemini.              | Highest      |
| `OPENAI_API_KEY`        | API Key for OpenAI (GPT models).        | Medium       |
| `ANTHROPIC_API_KEY`     | API Key for Anthropic (Claude models).  | Low          |
| `README_GENESIS_PROVIDER` | (Optional) Explicitly select AI provider (e.g., `openai`). | Overrides interactive prompt if set. |

**Example `.env` file:**
```ini
# At least one API key is required
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
# OPENAI_API_KEY=YOUR_OPENAI_API_KEY
# ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

### CLI Usage

Run `readme-genesis` in your project's root directory:

```bash
readme-genesis
```

Follow the interactive prompts to generate your README.

For help and available options:

```bash
readme-genesis --help
```

### Key Dependencies

| Tool         | Purpose                                     |
| :----------- | :------------------------------------------ |
| `commander`  | Robust command-line interface framework.    |
| `inquirer`   | Interactive command-line prompts.           |
| `chalk`      | Terminal string styling.                    |
| `ora`        | Elegant terminal spinner for loading states.|
| `boxen`      | Create boxes in the terminal.               |
| `configstore`| Persistent user configuration storage.      |
| `dotenv`     | Loads environment variables from a `.env` file.|

---

## 🎯 Roadmap

Our vision for **README GENESIS PRO** is continuous enhancement and expansion.

- [x] AI Provider Integration (Gemini, OpenAI, Anthropic)
- [x] Basic Project Context Analysis (File structure, `package.json`)
- [x] Interactive CLI for setup and generation
- [ ] **Enhanced Template Customization:** Allow users to define/select advanced output templates.
- [ ] **Multi-file/Directory README Generation:** Support for generating documentation across sub-projects.
- [ ] **Web UI for README Generation:** A user-friendly web interface for non-CLI users.
- [ ] **Git Integration:** Pre-commit hooks or automated generation on pushes.
- [ ] **Language Support:** Generate READMEs in multiple human languages.
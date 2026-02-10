<div align="center">

# 📦 README Genesis Pro

### Effortlessly generate professional, context-aware READMEs for your projects with AI.

<p align="center">
  <img alt="Node.js Version" src="https://img.shields.io/badge/node->=18-green">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-orange">
</p>

<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0iIzAwRkZFRSIgc3Ryb2tlLXdpZHRoPSI1Ii8+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjAiIGZpbGw9IiMwMEZGRUUiLz4KICA8cGF0aCBkPSJNNTAgMTAgTDU1IDIwIE01MCA5MCBMNTUgODAgTDEwIDUwIEwyMCA1NSBNOTAgNTAgTDgwIDU1IiBzdHJva2U9IiMwMEZGRUUiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHBhdGggZD0iTTI1IDI1IEwzNSAzMCBNNzUgMjUgTDY1IDMwIE0yNSA3NSBMMzUgNzAgTTc1IDc1TDY1IDcwIiBzdHJva2U9IiMwMEZGRUUiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==" alt="README Genesis Pro Logo" width="150"/>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation--setup">Installation</a> •
  <a href="#usage--cli-api">Usage</a> •
  <a href="#architectural-deep-dive">Architecture</a> •
  <a href="#tech-stack--integrations">Stack</a>
</p>

</div>

---

## The Value Proposition

**README Genesis Pro** is an AI-powered command-line interface (CLI) tool designed to revolutionize how developers document their technical projects. By intelligently analyzing your project's structure and codebase, it automatically generates comprehensive, professional, and context-aware `README.md` files.

**Problem Solved:** Tired of boilerplate READMEs, inconsistent documentation, or the time-consuming manual effort required to keep your project's front-page up-to-date? README Genesis Pro eliminates these bottlenecks, ensuring every project is presented clearly and professionally from the start.

**Target Audience:** Ideal for individual developers, open-source maintainers, and development teams seeking to streamline their documentation workflow, enhance project discoverability, and ensure high-quality project introductions without the manual overhead.

#### Quick Start:
```bash
# After installation, simply run in your project root:
gen-readme
```

---

## Architectural Deep-Dive

README Genesis Pro operates on a robust, modular architecture designed for efficiency, resilience, and intelligent context analysis.

### Core Flow & Design Patterns

The tool employs a **CLI-first pattern** with an embedded **AI integration layer** and a **configuration management system**.

1.  **Initialization & Resilience**: Upon execution, the CLI performs essential checks. It verifies network connectivity to ensure smooth API interactions and initiates a robust API key setup process.
2.  **Configuration Management**: Leverages `Configstore` for cross-platform, persistent storage of the user's Gemini API key, ensuring a seamless experience across sessions.
3.  **Project Context Analysis**: The heart of the system. The `lib/analyzer.js` module dynamically inspects the project's codebase, file structure, and dependencies (e.g., `package.json`). This deep analysis informs the AI about the project's purpose, technologies, and features.
4.  **AI Content Generation**: Utilizing the Google Gemini API, the `generateReadmeContent` function takes the analyzed project context and intelligently crafts a comprehensive `README.md`. This includes sections like features, installation, usage, and more, tailored to the specific project.
5.  **Output & User Feedback**: The generated content is presented to the user, typically saved as `README.md` in the project root, often with interactive prompts and styled terminal feedback (`chalk`, `ora`, `boxen`).

```mermaid
graph TD
    A[CLI Execution] --> B{Network Check & API Key Setup};
    B --> C[Retrieve/Store API Key (Configstore)];
    C --> D[Project Context Analysis];
    D -- (Project Structure, Dependencies, Code) --> E[AI Content Generation (Gemini API)];
    E -- (README Content) --> F[Output & Save README.md];
```

### Key Architectural Choices:
*   **Module-Based Design**: Separation of concerns into `bin` (CLI logic) and `lib` (core functionality like analysis and generation) promotes maintainability.
*   **Interactive User Experience**: `Inquirer.js` drives guided setup and user input, making the CLI intuitive.
*   **Resilience**: Built-in network check enhances reliability in varied environments.

---

## Installation & Setup

Get README Genesis Pro up and running in minutes.

### Prerequisites

*   **Node.js**: Version `18` or higher.
*   **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey). This key is essential for the AI generation capabilities.

### Installation

Install README Genesis Pro globally via npm or Yarn:

```bash
# Using npm
npm install -g gen-readme

# Using Yarn
yarn global add gen-readme
```

### API Key Configuration

When you run `gen-readme` for the first time, it will prompt you to enter your Google Gemini API Key. This key is securely stored locally using `Configstore` for future use.

Alternatively, you can provide your API key via an environment variable:

| Variable         | Required | Description                                                 | Default    |
| :--------------- | :------- | :---------------------------------------------------------- | :--------- |
| `GEMINI_API_KEY` | Yes      | Your Google Gemini AI Studio API key.                       | (Prompted) |

```bash
# Example: Set the environment variable before running
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
gen-readme
```

---

## Usage & CLI API

Generating a professional README is simple and intuitive.

### Basic Usage

Navigate to your project's root directory and simply run the `gen-readme` command:

```bash
gen-readme
```

The CLI will:
1.  Perform initial checks.
2.  Prompt you for your Gemini API key if not already configured.
3.  Analyze your project's context.
4.  Generate a draft `README.md` based on its analysis.
5.  Prompt for confirmation before saving or overwriting an existing `README.md`.

### Interactive Mode

`gen-readme` is designed to be interactive. It will guide you through the process, asking for input on various aspects of your project if clarification is needed, ensuring the generated README meets your specific requirements.

### Future Options (Placeholder)

While the current version focuses on intelligent, automated generation, future iterations may introduce flags for:
*   Specifying an output file path (`--output <path>`).
*   Forcing overwrite of existing `README.md` (`--force`).
*   Selecting different generation templates (`--template <name>`).

---

## Tech Stack & Integrations

README Genesis Pro is built on a modern Node.js ecosystem, leveraging powerful libraries for a robust and user-friendly experience.

| Component     | Tooling        | Purpose                                            |
| :------------ | :------------- | :------------------------------------------------- |
| **Runtime**   | Node.js (>=18) | Core JavaScript runtime environment.               |
| **CLI Framework** | Commander.js   | Robust and flexible CLI command parsing.           |
| **Interactivity** | Inquirer.js    | Interactive command-line prompts and questions.    |
| **UI Enhancements** | Chalk, Ora, Boxen | Stylish terminal output, spinners, and frames.   |
| **Configuration** | Configstore    | Cross-platform persistent configuration storage.   |
| **AI Engine** | Google Gemini  | Core AI model for intelligent content generation.  |
| **Environment** | Dotenv         | Loads environment variables from `.env` files.     |
| **File System** | Node `fs`      | Fundamental file system operations.                |
| **Network Utils** | Node `dns`     | Essential network connectivity checks.             |

---

## Roadmap & Contributing

### Roadmap

Our vision for README Genesis Pro is to continuously enhance its intelligence and utility. Future plans include:

*   **Expanded Contextual Analysis**: Support for more programming languages, frameworks, and project types (e.g., monorepos, microservices).
*   **Customizable Templates**: Allow users to define and select their own `README.md` templates for specific styles or content requirements.
*   **Version Control Integration**: Integrate with Git to automatically infer more project details and potentially suggest updates on code changes.
*   **CI/CD Pipeline Integration**: Enable seamless integration into automated build and deployment pipelines.

### Contributing

We welcome contributions! If you have suggestions, bug reports, or want to contribute code, please refer to our `CONTRIBUTING.md` (coming soon) for guidelines.

---
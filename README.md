<div align="center">
  <h1>auto-readme-cli ✨</h1>
  <p><i>The Smart Context-Aware Documentation Engine</i></p>

  [![GitHub Actions Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](https://github.com/your-org/auto-readme-cli/actions)
  [![npm version](https://img.shields.io/npm/v/auto-readme-cli.svg?style=flat-square)](https://www.npmjs.com/package/auto-readme-cli)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![CLI](https://img.shields.io/badge/Type-CLI-blue.svg?style=flat-square)](https://github.com/your-org/auto-readme-cli)
</div>

<div align="center">
  • [About](#-about-auto-readme-cli) •
  • [Features](#-key-features) •
  • [Installation](#-installation) •
  • [Usage](#-usage) •
  • [Configuration](#-configuration) •
  • [Project Structure](#-project-structure) •
  • [Contributing](#-contributing) •
  • [License](#-license) •
</div>

---
<div align="center">
  <h2>🚀 About auto-readme-cli</h2>
</div>

`auto-readme-cli` is a powerful command-line interface tool designed to effortlessly generate high-quality `README.md` files for your projects. Leveraging advanced project analysis and AI-driven content generation (powered by `README GENESIS PRO v2.5`), it intelligently scans your codebase, understands its context, and crafts a comprehensive, well-structured README tailored to your project's unique needs.

Forget manual documentation. Let `auto-readme-cli` become your smart documentation companion, ensuring your projects are always presented with clarity and professionalism. It offers various "blueprints" to match different project types, ensuring relevance and accuracy in its output.

---
<div align="center">
  <h2>🌟 Key Features</h2>
</div>

*   **Intelligent Project Analysis:** Scans your project's files, dependencies, and structure to infer its purpose and tech stack.
*   **AI-Powered Content Generation:** Utilizes a robust AI engine (requires `GEMINI_API_KEY`) to write descriptive and accurate documentation.
*   **Context-Aware Blueprints:** Suggests and applies the most suitable README blueprint (e.g., `library`, `application`, `monorepo`) based on its analysis.
*   **Interactive Prompts:** Guides you through the generation process with clear, user-friendly questions.
*   **Asset Detection:** Identifies project assets (e.g., logos, screenshots) for inclusion in the README.
*   **Test Suite Recognition:** Detects test frameworks and automatically includes relevant commands.
*   **Customizable Output:** Generate dynamic READMEs that reflect the latest state of your project.

---
<div align="center">
  <h2>🛠️ Installation</h2>
</div>

To use `auto-readme-cli`, ensure you have Node.js (v14+) installed. Then, install it globally using npm or yarn:

```bash
# Using npm
npm install -g auto-readme-cli

# Using yarn
yarn global add auto-readme-cli
```

---
<div align="center">
  <h2>💡 Usage</h2>
</div>

Navigate to the root directory of your project and simply run the `auto-readme` command:

```bash
auto-readme
```

The CLI will then guide you through a series of interactive prompts:

1.  **Project Analysis:** It will first analyze your project's "DNA."
    ```
    🔍 Analyzing project DNA...
    ```
2.  **Intelligence Insights:** It will provide insights based on its analysis, such as recommended blueprint types, detected assets, and test suites.
    ```
       • Recommendation: Based on tech stack, I suggest the 'library' blueprint.
       • Detected test suite (npm test)
    ```
3.  **Template Style Selection:** You'll be prompted to confirm or choose a different README template style.

Follow the on-screen instructions, and `auto-readme-cli` will generate a comprehensive `README.md` file for you!

---
<div align="center">
  <h2>⚙️ Configuration</h2>
</div>

`auto-readme-cli` requires an API key for its AI generation capabilities. This key should be provided as an environment variable.

### Environment Variables

| Variable          | Description                                                    | Required | Example             |
| :---------------- | :------------------------------------------------------------- | :------- | :------------------ |
| `GEMINI_API_KEY` | Your API key for the Gemini AI service. Used for content generation. | Yes      | `AIzaSyB...`        |

### `.env` File Setup

Create a `.env` file in the directory where you run `auto-readme` (or in your user's home directory for system-wide access) and add your `GEMINI_API_KEY`:

```plaintext
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
**Note:** Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key.

---
<div align="center">
  <h2>📁 Project Structure</h2>
</div>

The internal structure of `auto-readme-cli` typically looks like this:

```
.
├── bin/
│   └── index.js
├── lib/
│   ├── analyzer.js
│   └── generator.js
├── test/
│   └── analyzer.test.js
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```

*   `bin/index.js`: The main executable for the CLI.
*   `lib/analyzer.js`: Contains logic for scanning and understanding project contexts.
*   `lib/generator.js`: Handles the AI-powered content generation for READMEs.
*   `test/`: Directory for unit and integration tests.
*   `.env.example`: Template for environment variables.

---
<div align="center">
  <h2>🤝 Contributing</h2>
</div>

Contributions are welcome! If you have suggestions for new features, bug fixes, or improvements, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
<div align="center">
  <h2>📜 License</h2>
</div>

Distributed under the MIT License. See `LICENSE` for more information.

---
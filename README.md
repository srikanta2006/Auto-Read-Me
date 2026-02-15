<div align="center">

# 🚀 README Genesis
### Elite AI-Powered CLI for Industry-Standard Project Documentation

[![npm version](https://img.shields.io/npm/v/readme-genesis.svg)](https://www.npmjs.com/package/readme-genesis)
[![Node.js version](https://img.shields.io/badge/node->=18-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/readme-genesis.svg)](https://www.npmjs.com/package/readme-genesis)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

---

<a name="features"></a>
## 💡 Features & Value Proposition

| **The Problem** | **The Genesis Solution** | **The Result** |
| :--- | :--- | :--- |
| Writing documentation is 10% coding, 90% fluff. | We analyze project DNA to extract pure architectural value. | Professional READMEs in < 30 seconds. |
| READMEs often lack technical depth (diagrams/tables). | **Automated** Mermaid flowcharts, ASCII trees, and data tables. | Documentation that actually explains how it works. |
| Inconsistent standards across different project types. | Intelligence tailored to **React**, **Node**, **Python**, **Go**, and **Rust**. | High-conversion layout that looks senior-level. |

---

<a name="installation"></a>
## 📦 Installation

### Global Install (Recommended)
```bash
npm install -g readme-genesis
```

### Quick Run
```bash
npx readme-genesis
```

---

<a name="architecture"></a>
## 🏗️ Architecture

### Logic Flow

```mermaid
graph TD
    A[Start: gen-readme] --> B[Network & 2FA Integrity Check]
    B --> C[Project DNA Scanning]
    C --> D[Multi-Stack Recognition]
    D --> E[Blueprint Recommendation]
    E --> F[AI Synthesis: Vision Mode]
    F --> G[Visual Content Generation]
    G --> H[README.md Finalization]
    H --> I[Post-Gen Actions: Preview/Stage]
```

### High-Fidelity Structure
```text
.
├── bin/
│   └── index.js       # CLI Orchestrator: Handles UI, 2FA, and Flow.
├── lib/
│   ├── analyzer.js    # Intelligence Hub: Context scanning & AI Prompting.
│   └── analyzer.test.js # Logic Validation: Ensuring recommendation accuracy.
├── templates/
│   └── minimal.js     # Blueprint Core: Base structure for synthesis.
├── package.json       # Metadata & Engine Requirements.
└── README.md          # Visual-first documentation (this file).
```

---

<a name="usage"></a>
## 🛠️ API & Usage

### Commands
| Command | Action |
| :--- | :--- |
| `gen-readme` | Start the interactive documentation engine. |
| `gen-readme config` | Manage API keys and global settings. |

### Environment Variables
| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes | Powers the AI synthesis engine. |

---

<a name="contributing"></a>
## 🤝 Contributing

Highly encouraged! We love pull requests from everyone.

### 1. Setup & Cloning
```bash
git clone https://github.com/srikanta2006/Auto-Read-Me.git
cd Auto-Read-Me
npm install
```

### 2. Issues & Discussions
- **Report Bugs**: Use the [Issue Tracker](https://github.com/srikanta2006/Auto-Read-Me/issues) to report reproducible bugs.
- **Suggest Features**: Open an issue with the `enhancement` label.

### 3. Pull Request Process
1.  **Fork** the repo and create your branch from `main`.
2.  If you've added code that should be tested, **add tests**.
3.  Ensure the test suite passes (`npm test`).
4.  Issue that **Pull Request**!

---

## 🔮 Roadmap

- [ ] **Blueprint Overrides**: User-defined custom documentation styles.
- [ ] **Multi-Model Support**: Integration with GPT-4 and Claude.
- [ ] **CI/CD Integration**: Automatically update README on every push.
- [ ] **Deep Code Analysis**: Auto-generate Mermaid sequence diagrams from logic routes.

---

<div align="center">
Built with ❤️ by [Srikanta](https://github.com/srikanta2006)
</div>
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProviderFactory } from './factory.js';

/**
 * Finds the project root by looking for package.json upwards.
 * Falls back to current directory if not found.
 */
function findProjectRoot(startDir = process.cwd()) {
    let current = startDir;
    while (current !== path.parse(current).root) {
        if (fs.existsSync(path.join(current, 'package.json'))) {
            return current;
        }
        current = path.dirname(current);
    }
    return startDir;
}

/**
 * Smartly reads a file.
 * - Small files (< 5KB): Read fully.
 * - Large files: Read first 50 lines + lines matching structural patterns (classes, functions, exports).
 */
function smartRead(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size < 5000) {
            return fs.readFileSync(filePath, 'utf-8');
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const first50 = lines.slice(0, 50).join('\n');

        // Simple regex to catch definitions in JS/TS/Py/Go
        const structureRegex = /^(export|import|class|function|def|func|interface|type|const|let|var)\s+\w+/;

        const structure = lines.slice(50)
            .filter(line => structureRegex.test(line.trim()))
            .join('\n');

        return `${first50}\n\n... [Hidden Implementation Details] ...\n\n${structure}`;
    } catch (e) {
        return "";
    }
}

export async function getProjectContext() {
    const projectRoot = findProjectRoot();
    const pkgPath = path.join(projectRoot, 'package.json');

    let pkg = {};
    if (fs.existsSync(pkgPath)) {
        pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    }

    const allFiles = await glob('**/*', {
        cwd: projectRoot,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'package-lock.json', 'venv/**', '.venv/**'],
        nodir: false
    });

    // 1. Template Recommendation Logic
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    let suggestion = 'minimal';

    // Priority: Enterprise (Backend/Complexity)
    if (deps.express || deps.prisma || deps.mongodb || deps.docker || deps.kubernetes || deps.postgresql || deps.nest) {
        suggestion = 'enterprise';
    }
    // Priority: Full (Frontend/Frameworks)
    else if (deps.react || deps.next || deps.vue || deps.tailwind || deps.svelte || deps.vite || deps.webpack) {
        suggestion = 'full';
    }
    // Priority: Library (CLI/Utils)
    else if (pkg.bin || deps.commander || deps.yargs || deps.chalk || deps.inquirer) {
        suggestion = 'library';
    }

    // Cross-Language Detection
    if (suggestion === 'minimal' && allFiles.some(f => f.match(/requirements\.txt$|pyproject\.toml$|setup\.py$/i))) {
        suggestion = allFiles.some(f => f.match(/django|flask|fastapi/i)) ? 'enterprise' : 'minimal';
    }
    else if (suggestion === 'minimal' && allFiles.some(f => f.match(/go\.mod$/i))) {
        suggestion = 'enterprise';
    }
    else if (suggestion === 'minimal' && allFiles.some(f => f.match(/Cargo\.toml$/i))) {
        suggestion = 'library';
    }

    // 2. Dynamic Badge Generation
    const badges = {
        nodeVersion: `https://img.shields.io/badge/node->=${pkg.engines?.node || '18'}-green`,
        license: `https://img.shields.io/badge/license-${pkg.license || 'MIT'}-blue`,
        version: `https://img.shields.io/badge/version-${pkg.version || '1.0.0'}-orange`
    };

    // 3. Environment & Test Detection
    const envFile = allFiles.find(f => f.includes('.env.example') || f.includes('.env.sample'));
    const envContext = envFile ? fs.readFileSync(path.join(projectRoot, envFile), 'utf-8') : "None detected.";
    const hasTests = allFiles.some(f => f.includes('test') || f.includes('spec'));
    const testCommand = pkg.scripts?.test || "npm test";

    // 4. Asset & Documentation Validation
    const assetDirs = allFiles.filter(f => f.match(/(assets|docs|screenshots|images|public|img)$/i));
    const primaryAsset = allFiles.find(f => f.match(/(banner|hero|preview|logo|screenshot)\.(png|jpg|jpeg|svg|gif)/i)) || null;

    // Detect Existing Documentation
    const docFiles = allFiles.filter(f => f.match(/(CONTRIBUTING|CHANGELOG|CODE_OF_CONDUCT|docs\/.*\.md)/i)).slice(0, 5);
    const existingDocsSnippet = docFiles.length > 0
        ? `Existing Docs Found: ${docFiles.join(', ')} (Link to these in the README)`
        : "";

    // 5. Advanced Analysis: Database & Build Configs
    const dbFiles = allFiles.filter(f => f.match(/(schema\.prisma|models\/.*\.js|models\/.*\.ts|.*\.sql)/i)).slice(0, 3);
    const configFiles = allFiles.filter(f => f.match(/(vite\.config|next\.config|tsconfig\.json|Dockerfile|docker-compose)/i)).slice(0, 3);

    // 6. Deep Logic Extraction (Prioritized & Smart Truncated)
    // 5. Deep Logic Extraction (Prioritized & Smart Truncated)

    // Identify Entry Point
    let entryPoint = pkg.main || pkg.bin ? (typeof pkg.bin === 'string' ? pkg.bin : Object.values(pkg.bin)[0]) : null;
    if (!entryPoint) {
        entryPoint = allFiles.find(f => f.match(/^(src\/)?(index|main|app|server)\.(js|ts|py|go)$/i));
    }

    // Filter priority files (excluding entry point to avoid dupe)
    const priorityFiles = allFiles.filter(f =>
        f !== entryPoint &&
        f.match(/(index|app|server|config|firebase|prisma|tailwind|App|routes|Main|main|types|schema)\.(js|ts|jsx|tsx|py|cpp|go)$/i)
    ).slice(0, 10);

    let deepLogic = "";

    // Add Entry Point FIRST (High context weight)
    if (entryPoint) {
        try {
            const fullPath = path.join(projectRoot, entryPoint);
            deepLogic += `\n--- ENTRY POINT: ${entryPoint} ---\n${smartRead(fullPath)}\n`;
        } catch (e) { }
    }

    priorityFiles.forEach(file => {
        try {
            const fullPath = path.join(projectRoot, file);
            if (fs.lstatSync(fullPath).isFile()) {
                deepLogic += `\n--- SOURCE: ${file} ---\n${smartRead(fullPath)}\n`;
            }
        } catch (e) { }
    });

    if (existingDocsSnippet) {
        deepLogic += `\n--- DOCS CONTEXT ---\n${existingDocsSnippet}\n`;
    }

    // Append Database Context
    dbFiles.forEach(file => {
        try {
            deepLogic += `\n--- DATABASE SCHEMA: ${file} ---\n${smartRead(path.join(projectRoot, file))}\n`;
        } catch (e) { }
    });

    // Append Config Context
    configFiles.forEach(file => {
        try {
            deepLogic += `\n--- BUILD CONFIG: ${file} ---\n${smartRead(path.join(projectRoot, file))}\n`;
        } catch (e) { }
    });

    // Append API Routes (Lightweight Scan)
    const routeFiles = allFiles.filter(f => f.match(/(routes|controllers|api)\/.*\.(js|ts|py|go)/i)).slice(0, 5);
    if (routeFiles.length > 0) {
        deepLogic += `\n--- DETECTED API ROUTES ---\n`;
        routeFiles.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(projectRoot, file), 'utf-8');
                const routeLines = content.split('\n')
                    .filter(line => line.match(/(\.get|\.post|\.put|\.delete|\.patch|@Get|@Post|@Put|@Delete|route\()/i))
                    .slice(0, 10)
                    .map(line => line.trim());

                if (routeLines.length > 0) {
                    deepLogic += `File: ${file}\n${routeLines.join('\n')}\n`;
                }
            } catch (e) { }
        });
    }

    return {
        name: pkg.name,
        description: pkg.description || "A technical project analyzed by README Genesis Pro.",
        dependencies: {
            prod: Object.keys(pkg.dependencies || {}),
            dev: Object.keys(pkg.devDependencies || {})
        },
        envContext,
        hasTests,
        testCommand,
        structure: allFiles.slice(0, 100).join('\n'),
        deepLogic,
        suggestedType: suggestion,
        badgeLinks: badges,
        assets: {
            primaryPath: primaryAsset,
            directories: assetDirs.slice(0, 5)
        }
    };
}

export async function generateReadmeContent(apiKey, context, template, provider = 'gemini', modelName = 'gemini-1.5-flash', options = {}) {
    const aiProvider = ProviderFactory.get(provider, apiKey);
    const { authorPersona = 'senior', projectHook = '', authorConfig = {} } = options;

    // Persona Logic
    const personas = {
        student: {
            role: "Passionate CS Student & Open Learner",
            tone: "Enthusiastic, educational, and humble. Explain 'why' decisions were made. Use encouraging language.",
            focus: "Learning outcomes, setup simplicity, and personal growth."
        },
        senior: {
            role: "Senior Staff Engineer & Architect",
            tone: "Professional, concise, authoritative, and pragmatic. minimizing fluff.",
            focus: "Scalability, design patterns, robust error handling, and performance."
        },
        startup: {
            role: "Founding CTO & Product Visionary",
            tone: "Exciting, value-driven, and persuasive. Focus on the 'problem' and the 'solution'.",
            focus: "Business value, user experience, and rapid deployment."
        },
        opensource: {
            role: "Open Source Maintainer & Community Leader",
            tone: "Welcoming, structured, and collaborative. inclusive language.",
            focus: "Contribution guidelines, community standards, and ease of onboarding."
        }
    };

    // Handle Custom Persona (String input)
    let selectedPersona;
    if (personas[authorPersona]) {
        selectedPersona = personas[authorPersona];
    } else {
        selectedPersona = {
            role: "Custom User Persona",
            tone: authorPersona, // User's input defines the tone
            focus: "Authenticity to the user's described character."
        };
    }

    // Author Identity Context
    let authorContext = "";
    if (authorConfig && (authorConfig.name || authorConfig.github)) {
        authorContext = `
## 4. Author Identity (MANDATORY footer)
You MUST end the generated README with a "Connect with me" section using exactly these details:
- Name: ${authorConfig.name || "N/A"}
- GitHub: ${authorConfig.github ? `[${authorConfig.github}](https://github.com/${authorConfig.github})` : "N/A"}
- Twitter: ${authorConfig.twitter ? `[${authorConfig.twitter}](https://twitter.com/${authorConfig.twitter})` : ""}
- Website: ${authorConfig.website || ""}
`;
    }

    // Validate if necessary or assume caller validated. 
    // For specific model generation:

    const prompt = `
# Role: ${selectedPersona.role}
# Tone: ${selectedPersona.tone}
# Focus: ${selectedPersona.focus}

# Critical Instruction: USER-DEFINED VISION
The user has provided a specific "Hook" for this project. You MUST frame the entire README around this core concept:
"${projectHook || "A robust, scalable solution for modern developers."}"

# Task: Generate an Industry-Standard README.md for "${context.name}"

## 1. Project DNA Analysis
Project Description: ${context.description}
Suggested Blueprint: ${template.toUpperCase()}
Project Root Structure:
${context.structure}

Source Logic Snippets (Analyzed for Architecture):
${context.deepLogic}

Environment Context: ${context.envContext}
Badges: ${JSON.stringify(context.badgeLinks)}

## 2. Style Guidelines & Buzzword Ban (STRICT)
- **BANNED WORDS**: seamless, unleash, cutting-edge, state-of-the-art, breathtaking, stunning, game-changing, elevate, premiere, dynamic (unless technical).
- **PREFERRED WORDS**: robust, efficient, scalable, modular, low-latency, resilient, deterministic, automated.
- **Voice**: Speak directly to the developer. No marketing fluff. Use active voice.

## 3. Structural Requirements (PICTORIAL & SCHEMATIC)
${authorContext}

Your output must be a single, cohesive Markdown document. **MAXIMIZE VISUALS, MINIMIZE TEXT.**


## 2. Structural Requirements (PICTORIAL & SCHEMATIC)
Your output must be a single, cohesive Markdown document. **MAXIMIZE VISUALS, MINIMIZE TEXT.**

### 1️⃣ HEADER (VISUAL IMPACT)
- Enclose within a single <div align="center"> block.
- **Title**: High-impact H1.
- **Tagline**: Professional one-line tagline.
- **Badges**: Provided links.
- **Nav**: Clean [Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture).

---

### 2️⃣ THE VALUE (VISUAL)
- **Problem/Solution**: Keep it to 2-3 bullet points.
- **Quick-Start**: 1-step bash command.

---

### 3️⃣ ARCHITECTURE (FLOWCHART MANDATORY)
- **Logic Flow**: Use a **Mermaid.js** flowchart (\`graph TD\`) to visualize the project DNA/Flow.
- **Modules**: Use subgraphs to group related modules (e.g., CLI, Logic, Templates).
- Analyze the Code Snippets provided.
- **Patterns**: List detected patterns in a Markdown table.

---

### 4️⃣ STRUCTURE (FIDELITY TREE)
- Provide a high-fidelity **ASCII Directory Tree**.
- Annotate key files/folders for their purpose.

---

### 5️⃣ SETUP & USAGE (DATA-DRIVEN)
- Use **Code Blocks** for all commands.
- **Configuration**: Use a **Markdown Table** for every environment variable or flag.
- **Dependencies**: Group in a clean table | Tool | Purpose | Version |.

---

### 6️⃣ ROADMAP (SCHEMATIC)
- Use a **Checklist** or a **Gantt-style** table for the roadmap.

## 3. Writing Constraints (CRITICAL)
- **Visuals > Text**: If information can be a table, it MUST be a table.
- **Density**: Use bolding and concise bullets. Delete all introductory filler ("In this section...").
- **No Preamble**: Return raw Markdown only.
`;

    const markdown = await aiProvider.generate(modelName, prompt);

    if (!markdown.includes('<div align="center">')) {
        return `<div align="center">\n# 🚀 ${context.name}\n</div>\n\n---\n\n` + markdown;
    }

    return markdown.trim();
}
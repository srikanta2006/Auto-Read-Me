import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_MODEL_NAME } from './config.js';

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

    // 4. Asset & Media Validation
    const assetDirs = allFiles.filter(f => f.match(/(assets|docs|screenshots|images|public|img)$/i));
    const primaryAsset = allFiles.find(f => f.match(/(banner|hero|preview|logo|screenshot)\.(png|jpg|jpeg|svg|gif)/i)) || null;

    // 5. Deep Logic Extraction with Token Guard
    const priorityFiles = allFiles.filter(f =>
        f.match(/(index|app|server|config|firebase|prisma|tailwind|App|routes|Main|main)\.(js|ts|jsx|tsx|py|cpp)$/i)
    ).slice(0, 12);

    let deepLogic = "";
    const MAX_SNIPPET_LENGTH = 2000;

    priorityFiles.forEach(file => {
        try {
            const fullPath = path.join(projectRoot, file);
            if (fs.lstatSync(fullPath).isFile()) {
                let content = fs.readFileSync(fullPath, 'utf-8');
                if (content.length > MAX_SNIPPET_LENGTH) {
                    content = content.slice(0, MAX_SNIPPET_LENGTH) + "\n... [Content Truncated for AI Context] ...";
                }
                deepLogic += `\n--- SOURCE: ${file} ---\n${content}\n`;
            }
        } catch (e) { }
    });

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

export async function generateReadmeContent(apiKey, context, template) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODEL_NAME });

    const prompt = `
# Powered By: ${AI_MODEL_NAME}
# Role: Elite Technical Documentation Architect & Copywriter
# Task: Generate an Industry-Standard, High-Conversion README.md for "${context.name}"

## 1. Project DNA Analysis
Project Description: ${context.description}
Suggested Blueprint: ${template.toUpperCase()}
Project Root Structure:
${context.structure}

Source Logic Snippets (Analyzed for Architecture):
${context.deepLogic}

Environment Context: ${context.envContext}
Badges: ${JSON.stringify(context.badgeLinks)}

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

    const result = await model.generateContent(prompt);
    let markdown = result.response.text();

    if (!markdown.includes('<div align="center">')) {
        markdown = `<div align="center">\n# 🚀 ${context.name}\n</div>\n\n---\n\n` + markdown;
    }

    return markdown.trim();
}
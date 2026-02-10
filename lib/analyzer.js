import fs from 'fs';
import { glob } from 'glob';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Project Investigation Engine
 * Gathers deep context, assets, and scores project for auto-recommendation.
 */
export async function getProjectContext() {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    const allFiles = await glob('**/*', { 
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'package-lock.json'], 
        nodir: false 
    });

    // 1. Template Recommendation Logic
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    let suggestion = 'minimal';
    if (deps.react || deps.next || deps.vue || deps.tailwind) suggestion = 'full';
    else if (deps.express || deps.prisma || deps.mongodb || deps.docker) suggestion = 'enterprise';
    else if (pkg.bin || deps.commander || deps.yargs) suggestion = 'library';

    // 2. Dynamic Badge Generation
    const badges = {
        nodeVersion: `https://img.shields.io/badge/node->=${pkg.engines?.node || '18'}-green`,
        license: `https://img.shields.io/badge/license-${pkg.license || 'MIT'}-blue`,
        version: `https://img.shields.io/badge/version-${pkg.version || '1.0.0'}-orange`
    };

    // 3. Environment & Test Detection
    const envFile = allFiles.find(f => f.includes('.env.example') || f.includes('.env.sample'));
    const envContext = envFile ? fs.readFileSync(envFile, 'utf-8') : "None detected.";
    const hasTests = allFiles.some(f => f.includes('test') || f.includes('spec'));
    const testCommand = pkg.scripts?.test || "npm test";

    // 4. Asset & Media Validation
    const assetDirs = allFiles.filter(f => f.match(/(assets|docs|screenshots|images|public|img)$/i));
    const primaryAsset = allFiles.find(f => f.match(/(banner|hero|preview|logo|screenshot)\.(png|jpg|jpeg|svg|gif)/i)) || null;

    // 5. Deep Logic Extraction
    const priorityFiles = allFiles.filter(f => 
        f.match(/(index|app|server|config|firebase|prisma|tailwind|App|routes|Main)\.(js|ts|jsx|tsx|py)$/i)
    ).slice(0, 12);

    let deepLogic = "";
    priorityFiles.forEach(file => {
        try {
            if (fs.lstatSync(file).isFile()) {
                const content = fs.readFileSync(file, 'utf-8').slice(0, 1500);
                deepLogic += `\n--- SOURCE: ${file} ---\n${content}\n`;
            }
        } catch (e) {}
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const assetInstruction = context.assets.primaryPath 
        ? `I found a brand asset at "${context.assets.primaryPath}". Embed this as a hero image in the centered header.`
        : `No hero image found. Use a placeholder and mention the "${context.assets.directories[0] || './assets'}" folder.`;

   const prompt = `
Act as a Senior Technical Documentation Architect. 
Task: Produce a visually stunning, high-contrast README.md for "${context.name}".

--- 1. HEADER & NAVIGATION (CENTRALIZED) ---
- The entire Header must be inside a single <div align="center"> block.
- Structure: 
  - 🚀 H1 Title
  - ⚡ A professional one-line tagline.
  - 🛡️ Dynamic Badges (Use: ${JSON.stringify(context.badgeLinks)})
  - 🖼️ Hero Image (If exists: ${context.assets.primaryPath || 'Use placeholder'})
- NAVIGATION BAR: Create a single, clean line of links using exactly this format:
  <p align="center">
    <a href="#about">About</a> • 
    <a href="#features">Features</a> • 
    <a href="#setup">Setup</a> • 
    <a href="#structure">Structure</a> • 
    <a href="#stack">Stack</a>
  </p>

--- 2. SECTIONAL CARD DESIGN ---
- Every major H2 section MUST be wrapped by Horizontal Rules (---) to create a "Card" effect.
- Use the following pattern for EVERY section:
  ---
  <div align="center">## [Emoji] SECTION TITLE</div>
  [Section Content]
  ---

--- 3. DATA-DRIVEN CONTENT ---
- ANALYSIS: Based on Logic Snippets (${context.deepLogic}), explain the core architectural flow.
- CONFIG: If Env Vars (${context.envContext}) exist, create a clean Markdown table | Key | Purpose | Default |.
- TREE: Provide a high-fidelity ASCII folder tree from this structure: ${context.structure}.

--- 4. STYLING & CONSTRAINTS ---
- NO raw HTML source code displays; HTML must be used for layout only.
- NO conversational preamble or "Here is your README" text.
- Use thematic emojis consistently.
- Ensure the Table of Contents uses working anchor links.

BLUEPRINT: ${template.toUpperCase()}
Return ONLY the raw Markdown.
`;

    const result = await model.generateContent(prompt);
    let markdown = result.response.text();

    // Fail-safe for centering
    if (!markdown.includes('<div align="center">')) {
        markdown = `<div align="center">\n# 🚀 ${context.name}\n</div>\n\n---\n\n` + markdown;
    }
    
    return markdown;
}
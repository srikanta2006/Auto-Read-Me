import { getProjectContext, generateReadmeContent } from '../lib/analyzer.js';
import { ProviderFactory } from '../lib/factory.js';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import assert from 'assert';

// Configuration
const TEST_AI_LIVE = process.env.TEST_AI_LIVE === 'true';

// Mock Provider for AI Tests
class MockAIProvider {
    async generate(model, prompt) {
        return "# Mocked README Content\n\nThis is a mocked response for testing purposes.";
    }
    async validate() { return true; }
    async listModels() { return ['mock-model-v1']; }
}

async function runTests() {
    console.log(chalk.bold.cyan("\n🚀 Starting Auto-Read-Me Comprehensive Test Suite 🚀\n"));

    let passed = 0;
    let failed = 0;

    async function runTest(name, fn) {
        try {
            process.stdout.write(chalk.yellow(`⏳ Running: ${name}... `));
            await fn();
            console.log(chalk.green("✅ PASSED"));
            passed++;
        } catch (e) {
            console.log(chalk.red("❌ FAILED"));
            console.error(chalk.red(e.message));
            if (e.stack) console.error(chalk.dim(e.stack));
            failed++;
        }
    }

    // --- 1. PROJET CONTEXT TESTS ---

    await runTest("Context: Find Project Root", async () => {
        // We assume we are running this IN the project root
        // The analyzer uses process.cwd() by default if not argument provided, or we can check logic
        // But getProjectContext finds root internally.
        const context = await getProjectContext();
        assert.ok(context.name === 'readme-genesis', "Project name should be 'readme-genesis'");
        assert.ok(context.structure.includes('package.json'), "Structure should include package.json");
    });

    await runTest("Context: Git History Extraction", async () => {
        const context = await getProjectContext();

        // This relies on the current repo having git history.
        // If this runs in a fresh checkout without .git, it might warn, but we expect it to handle strictly.
        // For this test environment, we expect SOME history or a graceful "No git history" message.
        // We just ensure it doesn't crash and returns a string.
        assert.strictEqual(typeof context.gitHistory, 'string', "Git history should be a string");

        if (context.gitHistory.includes("No git history")) {
            console.log(chalk.yellow("   (Note: No git history detected, verifying backup message)"));
        } else {
            // If history exists, it should probably look like a log
            // Check for regex like hash
            // Basic heuristic check
            assert.ok(context.gitHistory.length > 0, "Git history should not be empty");
        }
    });

    await runTest("Context: Dependency Detection", async () => {
        const context = await getProjectContext();
        const allDeps = [...context.dependencies.prod, ...context.dependencies.dev];

        assert.ok(allDeps.includes('commander'), "Should detect 'commander' dependency");
        assert.ok(allDeps.includes('vitest'), "Should detect 'vitest' dev dependency");
    });

    await runTest("Context: Project Type Suggestion", async () => {
        const context = await getProjectContext();
        // For this own CLI project, it should suggest 'library' (due to bin/commander) 
        // OR 'minimal' if it misses some cues, but 'library' is expected based on library logic.
        assert.strictEqual(context.suggestedType, 'library', "Should suggest 'library' type for this CLI project");
    });

    // --- 2. ASSET & CONFIG TESTS ---

    await runTest("Assets: Readme Existence", async () => {
        // We know we have a README.md (or we should)
        const context = await getProjectContext();
        // The context.structure is a list of files strings
        // NOTE: structure is a joined string in the actual implementation return object: allFiles.slice(0, 100).join('\n')
        assert.ok(context.structure.includes('README.md'), "Structure should list README.md");
    });

    // --- 3. AI INTEGRATION TESTS (MOCKED) ---

    await runTest("AI: Generation Workflow (Mocked)", async () => {
        const context = await getProjectContext();
        const templateStyle = 'library';

        // Inject Mock Provider
        // Since Factory is a static class/object, we might need to interpret or intercept it.
        // However, `generateReadmeContent` takes a `provider` string name.
        // The implementation dynamically imports or uses the Factory.
        // To test strictly without changing source code, we might need to rely on the fact that we can't easily inject a class 
        // unless we modify the factory or register a mock.

        // ALTERNATIVE: We can check if `generateReadmeContent` constructs the prompt correctly.
        // But `generateReadmeContent` calls `ProviderFactory.get(provider, apiKey)`.

        // Let's monkey-patch ProviderFactory.get for this test process context
        const originalGet = ProviderFactory.get;
        ProviderFactory.get = (name, key) => new MockAIProvider();

        try {
            const content = await generateReadmeContent('dummy-key', context, templateStyle, 'mock', 'mock-model');
            assert.ok(content.includes("# Mocked README Content"), "Should return mocked content");
            assert.ok(content.includes('<div align="center">'), "Should include default header wrapper if missing");
        } finally {
            // Restore
            ProviderFactory.get = originalGet;
        }
    });

    // --- SUMMARY ---
    console.log(chalk.bold("\n---------------------------------------------------"));
    if (failed === 0) {
        console.log(chalk.green.bold(`🎉 ALL ${passed} TESTS PASSED!`));
        process.exit(0);
    } else {
        console.log(chalk.red.bold(`💥 ${failed} TESTS FAILED. (${passed} passed)`));
        process.exit(1);
    }
}

runTests();

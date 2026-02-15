import { ProviderFactory } from '../lib/factory.js';
import chalk from 'chalk';

async function testProvider(name, key) {
    console.log(chalk.blue(`\nTesting Provider: ${name}`));
    try {
        const provider = ProviderFactory.get(name, key);
        console.log(`- Instantiated: ✅`);

        console.log(`- Validate()...`);
        const isValid = await provider.validate();
        console.log(`- Valid: ${isValid ? '✅' : '❌'}`);

        if (isValid) {
            console.log(`- List Models()...`);
            const models = await provider.listModels();
            console.log(`- Models found: ${models.length}`);
            console.log(`  ${models.slice(0, 3).join(', ')}...`);
        }
    } catch (e) {
        console.log(chalk.red(`- Error: ${e.message}`));
    }
}

async function run() {
    console.log("=== Manual Provider Verification ===");

    // 1. Test Detection Logic
    console.log("\n1. Testing Detection Logic:");
    const cases = [
        { key: "sk-proj-12345", expected: "openai" },
        { key: "sk-ant-api03-...", expected: "anthropic" },
        { key: "AIzaSy...", expected: "gemini" }
    ];

    cases.forEach(({ key, expected }) => {
        const detected = ProviderFactory.detectProvider(key);
        const icon = detected === expected ? '✅' : '❌';
        console.log(`   Key starting with '${key.substring(0, 6)}...' -> Detected: ${detected} ${icon}`);
    });

    // 2. Mock Test (since we don't have real keys here, we expect validation failures or network errors, but correct instantiation)
    await testProvider('gemini', 'start_key');
    await testProvider('openai', 'sk-fake-key');
    await testProvider('anthropic', 'sk-ant-fake-key');
}

run();

import { getProjectContext } from '../lib/analyzer.js';

async function run() {
    console.log("Analyzing project context...");
    try {
        const context = await getProjectContext();
        console.log("Git History Extracted:");
        console.log("---------------------------------------------------");
        console.log(context.gitHistory);
        console.log("---------------------------------------------------");

        if (context.gitHistory && !context.gitHistory.startsWith("No git history")) {
            console.log("✅ Git integration successful!");
        } else {
            console.log("⚠️ Git history not found (expected if no git repo, but this is a repo).");
        }

    } catch (e) {
        console.error("❌ Error:", e);
    }
}

run();

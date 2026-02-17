import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STATE_FILE = '.readme-genesis.state.json';

/**
 * Calculates a deterministic hash of the project state.
 * @param {Object} context - The project context object from analyzer.js
 * @returns {string} SHA-256 hash
 */
export function calculateProjectHash(context) {
    const hash = crypto.createHash('sha256');

    // 1. Hash Dependencies (Sort keys for determinism)
    const prodDeps = (context.dependencies?.prod || []).sort();
    const devDeps = (context.dependencies?.dev || []).sort();
    hash.update(JSON.stringify({ prod: prodDeps, dev: devDeps }));

    // 2. Hash File Structure (Top 100 files, sorted)
    // context.structure is a string joined by \n, let's split and sort
    if (context.structure) {
        const structuralLines = context.structure.split('\n').sort();
        hash.update(JSON.stringify(structuralLines));
    }

    // 3. Hash Git History (Use the raw string, it changes on new commits)
    // We trim it to avoid whitespace issues
    if (context.gitHistory) {
        hash.update(context.gitHistory.trim());
    }

    return hash.digest('hex');
}

/**
 * Loads the saved state from disk.
 * @returns {Object|null} State object or null if not found
 */
export function loadState(projectRoot = process.cwd()) {
    try {
        const statePath = path.join(projectRoot, STATE_FILE);
        if (fs.existsSync(statePath)) {
            return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
        }
    } catch (e) {
        // Ignore read errors
    }
    return null;
}

/**
 * Saves the current state to disk.
 * @param {string} hash - The calculated project hash
 * @param {Object} context - (Optional) extra metadata to save
 */
export function saveState(hash, context = {}, projectRoot = process.cwd()) {
    try {
        const statePath = path.join(projectRoot, STATE_FILE);
        const state = {
            lastUpdated: new Date().toISOString(),
            contentHash: hash,
            projectVersion: context.version || '0.0.0' // Assuming we might want this later
        };
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        return true;
    } catch (e) {
        console.error("Failed to save state:", e.message);
        return false;
    }
}

/**
 * Checks if the project has changed since the last generation.
 * @param {Object} context - Current project context
 * @returns {boolean} True if changed (or no state), False if up-to-date
 */
export function checkState(context, projectRoot = process.cwd()) {
    const currentState = loadState(projectRoot);
    if (!currentState) {
        return true; // No state = Treat as changed (first run)
    }

    const currentHash = calculateProjectHash(context);
    return currentHash !== currentState.contentHash;
}

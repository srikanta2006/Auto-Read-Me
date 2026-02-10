import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { getProjectContext } from './analyzer.js';
import { glob } from 'glob';

vi.mock('fs');
vi.mock('glob');
vi.mock('@google/generative-ai');

describe('analyzer.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should recommend a library template for CLI projects', async () => {
        const mockPkg = JSON.stringify({
            name: 'test-lib',
            bin: { 'test': 'bin/test.js' },
            dependencies: { 'commander': '^1.0.0' }
        });

        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readFileSync').mockReturnValue(mockPkg);
        vi.mocked(glob).mockResolvedValue(['bin/test.js', 'package.json']);

        const context = await getProjectContext();
        expect(context.suggestedType).toBe('library');
    });

    it('should recommend a full template for React projects', async () => {
        const mockPkg = JSON.stringify({
            name: 'test-react',
            dependencies: { 'react': '^18.0.0' }
        });

        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readFileSync').mockReturnValue(mockPkg);
        vi.mocked(glob).mockResolvedValue(['src/App.js', 'package.json']);

        const context = await getProjectContext();
        expect(context.suggestedType).toBe('full');
    });

    it('should recommend enterprise for backend projects', async () => {
        const mockPkg = JSON.stringify({
            name: 'test-api',
            dependencies: { 'express': '^4.0.0' }
        });

        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readFileSync').mockReturnValue(mockPkg);
        vi.mocked(glob).mockResolvedValue(['server.js', 'package.json']);

        const context = await getProjectContext();
        expect(context.suggestedType).toBe('enterprise');
    });

    it('should detect Python projects and suggest appropriate type', async () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(false); // No package.json
        vi.mocked(glob).mockResolvedValue(['requirements.txt', 'main.py']);

        const context = await getProjectContext();
        expect(context.suggestedType).toBe('minimal');
    });

    it('should detect Python web projects and suggest enterprise', async () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(false); // No package.json
        vi.mocked(glob).mockResolvedValue(['requirements.txt', 'app.py', 'flask_app/']);

        // Simulating the logic where we check file content or names for django/flask
        // In the current implementation we check allFiles.some(f => f.match(/django|flask|fastapi/i))
        vi.mocked(glob).mockResolvedValue(['requirements.txt', 'flask_app.py']);

        const context = await getProjectContext();
        expect(context.suggestedType).toBe('enterprise');
    });
});

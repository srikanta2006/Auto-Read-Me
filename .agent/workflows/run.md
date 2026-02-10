---
description: How to run and test the Auto-Read-Me CLI
---

### 1. Prerequisite: API Key
You need a Gemini API Key. You can get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Run Locally
To run the CLI directly from the source code:
```bash
node bin/index.js
```

### 3. Install Globally
To use the `gen-readme` command anywhere on your system:
```bash
npm link
# Then you can simply run:
gen-readme
```

### 4. Run Tests
To verify the logic and run the unit test suite:
```bash
npm test
```

### 5. Config Management
To reset your API key or see where the config is stored:
```bash
node bin/index.js config
```

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Anchored to the project root, not process.cwd() - cwd drifts whenever a
// Bash tool call does `cd`, which previously caused stray prompt-logs.txt
// files to appear in whatever directory was last cd'd into.
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const logFile = path.join(projectDir, 'prompt-logs.txt');

let payload = '';
process.stdin.on('data', (chunk) => {
  payload += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(payload);
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] USER_MESSAGE\n${data.prompt}\n---\n`;
    fs.appendFileSync(logFile, entry);
  } catch (err) {
    // Silently fail; never block the prompt
  }
  process.exit(0);
});

process.on('error', () => {
  process.exit(0);
});

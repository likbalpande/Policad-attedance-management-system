#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), 'prompt-logs.txt');

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

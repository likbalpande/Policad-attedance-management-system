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

    let entry = `[${timestamp}] QUESTION\n`;

    // Try to parse tool_input (questions) and tool_response (answers)
    const toolInput = data.tool_input;
    const toolResponse = data.tool_response;

    if (toolInput && toolInput.questions && Array.isArray(toolInput.questions)) {
      // Parse structured question/answer pairs
      toolInput.questions.forEach((q) => {
        const questionText = q.question || '';
        entry += `Q: ${questionText}\n`;

        // Try to find the matching answer
        if (toolResponse && typeof toolResponse === 'object') {
          // toolResponse could be { answers: { "question text": "selected label" } }
          // or { <question-text>: <selected-option-label> }
          let selectedOption = toolResponse.answers?.[questionText] ||
                              toolResponse[questionText];
          if (selectedOption) {
            entry += `Selected: ${selectedOption}\n`;
          }
        }
      });
    }

    // If we couldn't parse structured format, dump raw response as fallback
    if (!entry.includes('Selected:')) {
      entry += `Response: ${JSON.stringify(toolResponse)}\n`;
    }

    entry += `---\n`;
    fs.appendFileSync(logFile, entry);
  } catch (err) {
    // Silently fail; never block tool execution
  }
  process.exit(0);
});

process.on('error', () => {
  process.exit(0);
});

Frontend_App (FT) - React + Vite + Typescript + Capacitor 
Primary_Backend (PB) - Express + Typescript + Drizzle + PostgreSQL (Supabase) (in future AWS RDS)
Live_Attendance_Gateway (LAG) - Express + Typescript
Live_Attendance_Lambda_Worker (LALW) - Express + Typescript locally, AWS Lambda in production
SQS is put in between LAG & LALW

This is a pnpm monorepo rooted at platform/ (apps/ + packages/).

# Architecture
Before implementing any code changes anywhere in platform/, load the
`/architecture` skill (.claude/skills/architecture/SKILL.md). It is the
canonical, up-to-date reference for monorepo tooling, shared packages, the
DB-access rule (only @platform/dal may query the DB), and per-app folder
structure. Keep it updated whenever an architecture decision changes.

# Analyze Before Coding
For every user query, suggestion, or implementation request: first analyze the
request and the current relevant code, then present the best possible
approach(es) with pros/cons. Ask clarifying questions if the requirement or
approach is not fully clear. Do not jump straight into coding — reach
alignment on the approach first, then implement.

# Concise Responses
Always answer/summarize in short, with key pointers only. Avoid verbose
explanations everywhere (chat replies, summaries, etc.).

# Prompt Logging
Every user message and every AskUserQuestion (question + selected option) is automatically
logged as a separate entry in prompt-logs.txt via .claude/settings.json hooks
(.claude/hooks/log-prompt.js, .claude/hooks/log-question.js). Do not remove these hooks
without removing this note.

Always discuss different approaches, tell pros and cons before implementing any code  / idea / feature.

At the end of every conversation / implementation, always update the discussion-summaries folder's #-<today's-date>.txt file for the discussion summary of that conversation.
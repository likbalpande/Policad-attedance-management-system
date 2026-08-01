Frontend_App (FT) - React + Vite + Typescript + Capacitor 
Primary_Backend (PB) - Express + Typescript + Prisma + PostgreSQL (Supabase) (in future AWS RDS)
Live_Attendance_Gateway (LAG) - Express + Typescript
Live_Attendance_Lambda_Worker (LALW) - Express + Typescript
SQS is put in between LAG & LALW

# Prompt Logging
Every user message and every AskUserQuestion (question + selected option) is automatically
logged as a separate entry in prompt-logs.txt via .claude/settings.json hooks
(.claude/hooks/log-prompt.js, .claude/hooks/log-question.js). Do not remove these hooks
without removing this note.
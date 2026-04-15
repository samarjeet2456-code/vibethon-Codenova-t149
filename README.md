Setup Instructions
Install prerequisites

Node.js 18+ (recommended latest LTS)
pnpm (npm i -g pnpm)
Install dependencies

In project root E:/vibethon-Codenova-t149 run:
pnpm install
Create environment file

File: .env.local in project root
Add at least:
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
Optional (for AI quiz generation):
GROQ_API_KEY=<your-groq-api-key>
Optional (only if you later use admin Supabase server actions):
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
Set up Supabase database

Open Supabase project → SQL Editor
Run full file: supabase/schema.sql
This creates tables (profiles, problems, modules, user_progress, etc.), RLS policies, signup trigger, and seed data.
Run app

pnpm dev
Open http://localhost:3000
If port conflict appears: taskkill /F /IM node.exe then run pnpm dev again.
How This Project Works (Simple Explanation)
Framework

Next.js App Router (app/), TypeScript, Tailwind UI.
Auth + session

Supabase auth is integrated in lib/supabase.ts (browser) and lib/supabase-server.ts (server).
middleware.ts protects routes:
Public: /login, /signup, /about
Other pages require logged-in user.
Main product flow

Dashboard at app/page.tsx loads profile, modules, problems, progress.
Users solve coding problems, take quizzes, gain XP, level up, and appear on leaderboard.
Backend APIs

app/api/* routes power features:
/api/profile, /api/problems, /api/modules, /api/progress
/api/submit for code submissions + XP updates
/api/quiz for quiz questions/results
/api/leaderboard for rankings and streak updates
AI quiz behavior

app/api/quiz/route.ts tries Groq first (GROQ_API_KEY).
If key missing/fails, it uses built-in static questions, so quiz still works.
First Run Checklist
.env.local exists and has correct key names
Supabase SQL schema executed successfully
pnpm install done
pnpm dev running with no duplicate Next server

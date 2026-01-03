# Kia VoiceAgent Admin UI

Admin UI for managing VoiceAgent configuration and tracking usage.

## Features (MVP)

- Create/edit **campaigns** (per number/campaign) with VoiceAgent **engine** selection (Primary/Secondary)
- Create/edit **call flows** (greeting + ordered steps)
- Manage **guardrails**
- Manage **voice profiles** (voice + accent notes/settings metadata)
- Capture **testing feedback**
- Track **calls and minutes** (usage events)

## Tech

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth (Google)

## Environment variables

Prisma loads env vars from `admin-ui/.env`. Next.js also supports `admin-ui/.env.local`.
Simplest: put everything in `admin-ui/.env` (copy from `admin-ui/env.example`).

```bash
DATABASE_URL="postgresql://voiceagent_admin:REPLACE_ME@127.0.0.1:5433/voiceagent_admin"
SHADOW_DATABASE_URL="postgresql://voiceagent_admin:REPLACE_ME@127.0.0.1:5433/voiceagent_shadow"
NEXTAUTH_URL="http://localhost:3100"
NEXTAUTH_SECRET="REPLACE_WITH_RANDOM"
GOOGLE_CLIENT_ID="REPLACE_ME"
GOOGLE_CLIENT_SECRET="REPLACE_ME"
```

## Run locally

```bash
cd admin-ui
npm install
npm run dev -- --port 3100
```

## Database

```bash
cd admin-ui
npx prisma generate
npx prisma migrate dev
```



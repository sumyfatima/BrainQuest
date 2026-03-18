# BrainQuest - AI-Powered Educational Quiz App

## Project Overview

**BrainQuest** is a complete educational quiz application for kids aged 7–13, featuring AI-generated questions, multiple topics, difficulty levels, and interactive gameplay. Built as a React Vite web app and Expo mobile app with a Node.js/Express backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Mobile**: Expo React Native
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Anthropic Claude (via Replit AI Integrations proxy)

## Project Structure

```text
workspace/
├── artifacts/                       # Deployable applications
│   ├── api-server/                 # Express API (port 8080)
│   ├── brainquest/                 # Web app - React Vite (port 20191)
│   ├── brainquest-mobile/          # Mobile app - Expo (port 20527)
│   └── mockup-sandbox/             # Component preview (port 8081)
├── lib/                            # Shared libraries
│   ├── api-spec/                   # OpenAPI spec + Orval codegen
│   ├── api-client-react/           # Generated React Query hooks
│   ├── api-zod/                    # Generated Zod schemas
│   ├── db/                         # Drizzle ORM + DB schema
│   └── integrations-anthropic-ai/  # Anthropic client wrapper
├── scripts/                        # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Applications

### BrainQuest Web App (`artifacts/brainquest`)

React Vite web application for desktop/tablet.

**Features:**
- Responsive dark theme UI
- 4-screen flow: Splash → Setup → Quiz → Results
- 8 topics with unique colors: Math, Science, Animals, Space, Geography, History, Technology, Sports
- 3 difficulty levels with time limits: Easy (25s), Medium (20s), Hard (15s)
- AI-generated questions (6 per quiz) via Claude Sonnet
- Real-time countdown timer with color-coded urgency
- Streak tracking (🔥 badge at 2+ streak)
- Score accumulation (10 pts base + difficulty bonus + streak bonus)
- Complete question review on results screen
- Confetti animation on correct answers

**API Integration:**
- `POST /api/quiz/generate` — fetch AI-generated questions
- Server-side API calls (secure, no key exposure)

### BrainQuest Mobile App (`artifacts/brainquest-mobile`)

Expo React Native mobile application.

**Features:**
- All web app features optimized for mobile
- Emoji avatars (🦊 🐼 🦄 🐸 🤖 🦋 🐧 🦖)
- Player name input
- Dark theme optimized for battery life
- Responsive layout for all screen sizes
- Smooth animations and transitions
- Complete game flow: Splash → Setup → Quiz → Results
- Statistics dashboard: Stars, Accuracy %, Best Streak, Correct/Total

**Colors & Theme:**
- Background: `#0d0d1a` (deep dark blue)
- Card: `#1a1a2e` (dark blue-gray)
- Text: `#ffffff` (white)
- Accent: `#4776e6` (vibrant blue)
- Success: `#38ef7d` (green)
- Error: `#FF6B6B` (red)
- Warning: `#f7971e` (orange)

**API Integration:**
- Fetches from `https://{REPLIT_DEV_DOMAIN}/api/quiz/generate`
- Fallback to offline questions if API unavailable

### API Server (`artifacts/api-server`)

Express 5 backend providing REST API.

**Routes:**
- `GET /health` — health check
- `POST /api/quiz/generate` — AI-powered quiz generation

**Request:**
```json
{
  "topic": "Math",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "...",
      "fun_fact": "..."
    }
  ],
  "source_summary": "Claude Sonnet + Web Search"
}
```

## AI Integration

**Anthropic Claude API via Replit AI Integrations:**
- No user API key required
- Automatic authentication through Replit proxy
- Environment variables:
  - `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Replit proxy URL
  - `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Auto-provided by Replit
- Model: `claude-sonnet-4-6`

**Question Generation Flow:**
1. Frontend sends topic + difficulty
2. Backend calls Claude API with structured prompt
3. Claude generates 6 educational questions with explanations
4. Response includes fun facts and source attribution

## Workflows & Commands

### Start Development

All services auto-start when you reload the preview:
- **API Server**: `pnpm --filter @workspace/api-server run dev` (port 8080)
- **Web App**: `pnpm --filter @workspace/brainquest run dev` (port 20191)
- **Mobile App**: `pnpm --filter @workspace/brainquest-mobile run dev` (port 20527)

### Build Commands

```bash
# Type-check entire workspace
pnpm run typecheck

# Build all packages
pnpm run build

# Codegen OpenAPI types
pnpm --filter @workspace/api-spec run codegen
```

### Running Individual Services

```bash
# Run API server
PORT=8080 pnpm --filter @workspace/api-server run dev

# Run web app
PORT=20191 pnpm --filter @workspace/brainquest run dev

# Run mobile app  
PORT=20527 pnpm --filter @workspace/brainquest-mobile run dev
```

## TypeScript Configuration

- **Root config**: `tsconfig.base.json` (all package references)
- **Composite mode**: All packages use `composite: true`
- **Declaration-only**: `emitDeclarationOnly` for faster builds
- **Project references**: Root `tsconfig.json` lists all workspace packages

Always run `pnpm run typecheck` from the root to check all packages.

## Database (PostgreSQL)

Currently unused for this phase but configured via Drizzle ORM.
- Schema defined in `lib/db/src/schema.ts`
- Migrations via Drizzle CLI
- Connection via `DATABASE_URL` environment variable

## Testing & Debugging

### Test Quiz API Locally

```bash
curl -X POST http://localhost:8080/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Math","difficulty":"medium"}'
```

### Mobile Preview

Open Expo Go on a device and scan the QR code, or use `expo-dev-client` for a custom development build.

### Web App Preview

Navigate to the web app artifact in the Replit preview pane (available in dropdown).

## Completed Features

✅ Web app fully built and tested
✅ Mobile app fully built (all screens, API integration)
✅ API backend with AI quiz generation
✅ Anthropic Claude integration via Replit proxy
✅ OpenAPI spec + Orval codegen
✅ TypeScript throughout
✅ Dark theme with consistent colors
✅ Responsive design (mobile/tablet/desktop)
✅ Streak system & score tracking
✅ Question review on results
✅ Fun facts in quiz explanations
✅ Emoji avatars & customization
✅ Countdown timer with urgency colors
✅ Fallback offline questions
✅ Loading states with animations

## Known Notes

- Mobile avatars use emoji (quick approach vs. vector icons)
- Offline fallback questions ensure playability even if API fails
- Free-tier Replit environment - AI rate-limited
- No database persistence yet (questions generated per-session)

## Ready to Ship

This project is production-ready for deployment. All core features are implemented, tested, and integrated.

# BrainQuest - Build Instructions for Future Use

## 🚀 Quick Start

Your complete BrainQuest project is saved in git. To rebuild the app binaries:

### Prerequisites
1. **Expo Account** (free at https://expo.dev)
2. **API Token** - Generate at https://expo.dev/accounts/[username]/settings/tokens
3. **Node.js 24+** and **pnpm**

### Building Android APK (.aab format)

```bash
# 1. Install dependencies
cd artifacts/brainquest-mobile
npm install

# 2. Set your Expo token
export EXPO_TOKEN=your_token_here

# 3. Build Android (production, ~15 minutes)
eas build --platform android --profile production

# 4. Download the .aab file from https://expo.dev
```

### Building with Direct APK Format

If you want direct .apk files instead of .aab:

1. Edit `artifacts/brainquest-mobile/eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

2. Rebuild:
```bash
eas build --platform android --profile production
```

### Building Web App

```bash
# 1. Build production bundle
cd artifacts/brainquest
BASE_PATH=/ PORT=20191 npm run build

# 2. Find compiled app in: artifacts/brainquest/dist/public/
# 3. Deploy to any static host (Vercel, Netlify, AWS S3, etc.)
```

### Building API Server

```bash
# 1. Build backend
cd artifacts/api-server
PORT=8080 npm run build

# 2. Run in production
NODE_ENV=production node dist/index.cjs

# 3. API runs on http://localhost:8080
```

## 📋 Project Structure

```
workspace/
├── artifacts/
│   ├── brainquest/              # React Vite web app
│   ├── brainquest-mobile/       # Expo React Native app
│   └── api-server/              # Express backend
├── lib/
│   ├── api-spec/                # OpenAPI spec
│   ├── api-client-react/        # Generated hooks
│   ├── api-zod/                 # Zod validation
│   ├── db/                       # Database layer
│   └── integrations-anthropic-ai/  # AI client
└── scripts/
```

## 🔐 Environment Variables

### Development
```bash
# Set these for local development:
export EXPO_TOKEN=your_token
export AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://...
export AI_INTEGRATIONS_ANTHROPIC_API_KEY=...
```

### Production (Deployed)
- Set via your hosting platform (Vercel, Heroku, etc.)

## 🏗️ Development Workflow

### Start dev servers locally:

```bash
# Terminal 1: API Server
cd artifacts/api-server
PORT=8080 npm run dev

# Terminal 2: Web app
cd artifacts/brainquest
BASE_PATH=/ PORT=20191 npm run dev

# Terminal 3: Mobile app
cd artifacts/brainquest-mobile
PORT=20527 npm run dev
```

Then open http://localhost:20191 in your browser.

### Type checking
```bash
# From root directory
pnpm run typecheck
```

## 📱 Android Build History

| Build | Date | Status | Download |
|-------|------|--------|----------|
| v2 (latest) | 3/18/2026 | ✅ Ready | View in Expo account |
| v1 | 3/18/2026 | ✅ Ready | View in Expo account |

All builds are stored in your Expo account at:
https://expo.dev/accounts/sumyfatima/projects/brainquest-mobile/builds

## 🎯 Common Tasks

### Update App Version
Edit `artifacts/brainquest-mobile/app.json`:
```json
{
  "expo": {
    "version": "1.0.0",  // Update this
    ...
  }
}
```

### Change Package Name
Edit `artifacts/brainquest-mobile/app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.brainquest"  // Change this
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.brainquest"  // And this
    }
  }
}
```

### Update AI Model
Edit `artifacts/api-server/src/routes/quiz/index.ts`:
```typescript
// Change the model name
const model = "claude-opus-4-1"; // Change from claude-sonnet-4-6
```

### Deploy to Production

**Web App:**
```bash
# Build and deploy to Vercel/Netlify
npm run build
# Follow platform-specific deployment steps
```

**Mobile App:**
```bash
# Upload .aab to Google Play Store
# (See: https://developer.android.com/distribute/console)
```

**API Server:**
```bash
# Deploy to Railway, Heroku, AWS, etc.
# (Ensure PORT and env vars are set)
```

## 🐛 Troubleshooting

### Build fails with "PORT not set"
→ Set `PORT` environment variable before running

### EAS says "non-interactive mode" error
→ Use `eas login` first, then set `EXPO_TOKEN`

### App crashes on startup
→ Check `replit.md` for environment variable setup
→ Verify API server is running
→ Check browser console for errors

### Mobile app won't connect to API
→ Ensure `EXPO_PUBLIC_DOMAIN` env var is set correctly
→ Check API server is accessible from device network

## 📚 Documentation Files

- **replit.md** - Project overview and architecture
- **ANDROID_BUILD_README.md** - Android build details
- **APK_VS_AAB.md** - Format explanation and conversion
- **BUILD_INSTRUCTIONS.md** - This file

## 🔗 Useful Links

- **Expo Docs**: https://docs.expo.dev
- **Expo Dashboard**: https://expo.dev
- **React Native Docs**: https://reactnative.dev
- **Vite Docs**: https://vitejs.dev
- **Express Docs**: https://expressjs.com

## ✅ Checklist for Future Rebuilds

- [ ] Update version in `app.json`
- [ ] Verify `EXPO_TOKEN` is set
- [ ] Run `npm install` to get latest deps
- [ ] Run type check: `pnpm run typecheck`
- [ ] Test locally before building
- [ ] Build APK/AAB via EAS
- [ ] Test on device before publishing
- [ ] Upload to Google Play Store or TestFlight

---

**Created**: March 18, 2026  
**Last Updated**: March 18, 2026  
**Status**: ✅ Production-ready

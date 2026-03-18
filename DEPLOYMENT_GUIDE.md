# BrainQuest Deployment Guide

## 🌍 Deployment Options

### 1. **Google Play Store** (Android)

Your .aab file is ready for the official Android app store.

**Steps:**
1. Go to https://play.google.com/console
2. Sign up as a developer ($25 one-time fee)
3. Create a new application
4. Upload your `brainquest-android.aab` file
5. Fill in app details and screenshots
6. Submit for review (usually 2-4 hours)
7. Once approved, it's live for all Android users

**Timeline**: 2-4 hours to approval, then instant availability

---

### 2. **Apple App Store** (iOS)

Requires building on macOS with Xcode.

**Steps:**
1. Have a Mac with Xcode
2. Enroll in Apple Developer Program ($99/year)
3. Generate certificates and provisioning profiles
4. Build: `eas build --platform ios --profile production`
5. Use TestFlight for beta testing
6. Submit to App Store Review
7. Apple reviews in ~24-48 hours

**Status**: Can be built on-demand

---

### 3. **Web App Deployment**

Deploy to any static hosting:

#### **Vercel** (Recommended for React apps)
```bash
npm install -g vercel
cd artifacts/brainquest
npm run build
vercel deploy --prod
```

#### **Netlify**
```bash
cd artifacts/brainquest
npm run build
# Deploy dist/public folder via Netlify UI
```

#### **AWS S3 + CloudFront**
```bash
cd artifacts/brainquest
npm run build
aws s3 sync dist/public/ s3://your-bucket-name/
```

#### **GitHub Pages**
```bash
# Update BASE_PATH in vite.config.ts to /brainquest-mobile/
cd artifacts/brainquest
npm run build
# Push dist/public to gh-pages branch
```

---

### 4. **API Server Deployment**

#### **Railway.app** (Easiest)
```bash
# 1. Sign up at railway.app
# 2. Connect your GitHub repo
# 3. Add environment variables:
#    - PORT=8080
#    - NODE_ENV=production
#    - AI_INTEGRATIONS_ANTHROPIC_API_KEY=...
# 4. Deploy!
```

#### **Heroku**
```bash
heroku create brainquest-api
heroku config:set NODE_ENV=production
git push heroku main
```

#### **AWS Lambda** (Serverless)
```bash
# Use serverless framework or AWS CDK
# Requires more configuration
```

#### **DigitalOcean App Platform**
1. Connect GitHub
2. Set PORT and env vars
3. Deploy from dashboard

#### **Self-hosted (VPS)**
```bash
# On your server:
npm install -g pm2
git clone your-repo
cd workspace/artifacts/api-server
npm install
npm run build
PORT=8080 pm2 start dist/index.cjs --name "brainquest-api"
```

---

## 📊 Deployment Checklist

### Before Any Deployment:

- [ ] Update version number in `app.json`
- [ ] Run `pnpm run typecheck` (no errors)
- [ ] Test locally in all three apps
- [ ] Verify API connectivity
- [ ] Update privacy policy URL (if needed)
- [ ] Ensure all env vars are set
- [ ] Test on device/simulator

### Android (Google Play Store)

- [ ] Build AAB via EAS
- [ ] Download and verify size
- [ ] Create Google Play account
- [ ] Set up billing information
- [ ] Create app listing
- [ ] Add app screenshots
- [ ] Write compelling description
- [ ] Upload privacy policy
- [ ] Upload terms of service
- [ ] Set content rating
- [ ] Upload AAB file
- [ ] Submit for review

### Web App Deployment

- [ ] Run `npm run build`
- [ ] Verify `dist/public/` contents
- [ ] Test in local: `npx http-server dist/public`
- [ ] Deploy to hosting
- [ ] Test on live domain
- [ ] Set up custom domain (if desired)
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Configure analytics

### API Server Deployment

- [ ] Run `npm run build`
- [ ] Test locally: `NODE_ENV=production node dist/index.cjs`
- [ ] Deploy to hosting platform
- [ ] Set all environment variables
- [ ] Test API endpoints from production domain
- [ ] Monitor logs for errors
- [ ] Set up auto-scaling (if needed)

---

## 🔐 Production Environment Variables

### Required for API Server:
```
NODE_ENV=production
PORT=8080
AI_INTEGRATIONS_ANTHROPIC_API_KEY=your_key_here
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
```

### Optional:
```
DATABASE_URL=postgresql://...  # For future database features
LOG_LEVEL=info
```

---

## 📈 Monitoring & Maintenance

### Set up monitoring:
- **Sentry** - Error tracking: https://sentry.io
- **Datadog** - Performance monitoring: https://www.datadoghq.com
- **Google Analytics** - User analytics (web app)
- **Firebase Analytics** - Mobile app analytics (Expo)

### Regular maintenance:
- Check for security updates: `npm audit`
- Update dependencies quarterly
- Monitor API error rates
- Track app crashes in Sentry
- Review user feedback

---

## 🚀 Rollout Strategy

### Phase 1: Soft Launch
- Deploy API server first
- Test thoroughly from production domain
- Deploy web app (https://yoursite.com)
- Test all flows end-to-end

### Phase 2: Beta Testing
- Share APK with trusted testers
- Use Expo's internal distribution
- Collect feedback

### Phase 3: Public Release
- Upload to Google Play Store
- Wait for approval (~4 hours)
- Release on app store
- Announce on social media

### Phase 4: Post-Launch
- Monitor crash rates
- Respond to reviews
- Publish updates as needed
- Plan next features

---

## 💰 Estimated Costs

| Service | Cost | Notes |
|---------|------|-------|
| Google Play Store | $25/month | One-time registration fee, then free |
| Apple Developer | $99/year | Required for iOS |
| Web hosting (Vercel) | Free | Free tier available |
| API hosting (Railway) | $5-50/month | Pay-as-you-go |
| Domain name | $12/year | Optional |
| SSL certificate | Free | Included with most hosts |
| **Total** | **~$150/year** | Minimal for a side project |

---

## 📞 Support

If you need help:
1. Check the **replit.md** file for architecture
2. Review **BUILD_INSTRUCTIONS.md** for build process
3. Check platform-specific docs (Play Store, Vercel, etc.)
4. Search for errors in official documentation

---

**Last Updated**: March 18, 2026  
**Status**: Ready for deployment

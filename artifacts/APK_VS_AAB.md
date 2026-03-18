# Android Build Files Explained

## 📱 What You Have

Your build is a **.aab file** (Android App Bundle) - the **modern, official format** Google requires for the Play Store.

## 🔄 AAB vs APK

| Format | Use Case | File Size | Installation |
|--------|----------|-----------|--------------|
| **.aab** (App Bundle) | Google Play Store (OFFICIAL) | 64 MB | Store handles optimization |
| **.apk** (Package) | Direct device sideload | Larger | Direct install via USB/ADB |

## ✅ What You Can Do Now

### Option 1: Google Play Store (Recommended)
Your .aab is **ready to upload to Google Play Store**:
1. Go to https://play.google.com/console
2. Create your app listing
3. Upload the .aab file
4. Google optimizes it for each device automatically
5. Publish to app store

### Option 2: Test on Device (Advanced)
If you want to test directly without Google Play:
1. Install Java/Android SDK on your computer
2. Download `bundletool` tool
3. Convert .aab → .apks → extract .apk
4. Use ADB to install: `adb install app.apk`

## 🔧 If You Really Need Direct .APK Files

To build direct .apk files instead of .aab:

Edit `eas.json`:
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

Then rebuild with:
```bash
eas build --platform android --profile production
```

This will generate direct .apk files (non-optimized, larger size).

## 📊 Build Details

- **File**: brainquest-android-v2.aab (64 MB)
- **Format**: Android App Bundle (optimized)
- **Version**: 1.0.0
- **Status**: ✅ Ready for distribution
- **Signing**: ✅ Auto-signed by Expo (production-ready)

---

**Recommended Next Step**: Upload to Google Play Store (it's the official, modern way)

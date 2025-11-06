# 📱 Mobile App Setup Guide

Your Restoration Nexus app is now configured for native mobile deployment!

## 🚀 Quick Start for Development

The app is currently set up with **hot-reload** pointing to your Lovable sandbox, so you can develop and test on actual devices while code updates instantly.

### Prerequisites

**For iOS:**
- Mac computer with Xcode installed
- iOS device or simulator

**For Android:**
- Android Studio installed
- Android device or emulator

### Installation Steps

1. **Export to GitHub**
   - Click "Export to GitHub" in Lovable
   - Clone your repository locally

2. **Install Dependencies**
   ```bash
   cd your-repo
   npm install
   ```

3. **Add Native Platforms**
   ```bash
   # For iOS
   npx cap add ios
   
   # For Android
   npx cap add android
   
   # Or both
   npx cap add ios && npx cap add android
   ```

4. **Build the Web App**
   ```bash
   npm run build
   ```

5. **Sync to Native Platforms**
   ```bash
   npx cap sync
   ```

6. **Run on Device/Emulator**
   ```bash
   # For iOS (requires Mac + Xcode)
   npx cap run ios
   
   # For Android
   npx cap run android
   ```

## 📸 Native Features Included

### ✅ Camera Integration
- Direct native camera access on mobile devices
- Instant photo capture and upload
- GPS location tagging
- Fallback to web camera on desktop

### ✅ Geolocation
- Automatic GPS coordinates capture
- Location-tagged photos
- Works on both iOS and Android

## 🔄 Development Workflow

### Hot Reload (Current Setup)
Your `capacitor.config.ts` is configured to load from your Lovable sandbox:
```typescript
server: {
  url: 'https://8da0ca9f-3f53-47ed-8e51-1b466a11a9e8.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

**This means:**
- Any changes in Lovable instantly appear on your device
- No need to rebuild after code changes
- Perfect for rapid development

### Production Build (When Ready)
When you're ready to deploy:

1. **Remove hot-reload config** from `capacitor.config.ts`:
   ```typescript
   // Remove the entire server section
   ```

2. **Build and sync**:
   ```bash
   npm run build
   npx cap sync
   ```

3. **Test production build**:
   ```bash
   npx cap run ios  # or android
   ```

## 📱 Key Mobile Features

### Photo Upload Workflow
1. Open any project on your phone
2. Navigate to Documents → Photos
3. Tap the floating camera button (bottom-right)
4. Take photo or choose from gallery
5. AI automatically analyzes and categorizes
6. Uploads directly to project

### Batch Upload
- Select multiple photos at once
- Add notes to all photos together
- Manual room tagging option
- Progress indicator for batch uploads

### Quick Camera Access
- Floating camera button on all project pages
- Instant access without navigation
- Optimized for field workers

## 🛠️ Configuration Files

### capacitor.config.ts
Main Capacitor configuration. Currently set for hot-reload development.

### android/
Android-specific files (created after `npx cap add android`)

### ios/
iOS-specific files (created after `npx cap add ios`)

## 🐛 Troubleshooting

### Camera not working
- Check device permissions in Settings
- Ensure Camera plugin is properly synced: `npx cap sync`

### Build errors on iOS
- Run `npx cap update ios` to update dependencies
- Open in Xcode and check signing certificates

### Build errors on Android
- Run `npx cap update android`
- Check Android SDK version in Android Studio

### Hot reload not working
- Verify the URL in `capacitor.config.ts` matches your Lovable preview
- Check that device is on the same network (for local testing)

## 📦 App Store Deployment

When ready to publish:

1. **iOS App Store:**
   - Open `ios/App/App.xcworkspace` in Xcode
   - Configure signing & capabilities
   - Archive and upload to App Store Connect

2. **Google Play Store:**
   - Open `android` folder in Android Studio
   - Generate signed APK/Bundle
   - Upload to Google Play Console

## 🔐 Permissions

The app requests these permissions:
- **Camera**: For taking job site photos
- **Photo Library**: For selecting existing photos
- **Location**: For GPS tagging photos

These are configured in:
- iOS: `Info.plist`
- Android: `AndroidManifest.xml`

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [Geolocation Plugin](https://capacitorjs.com/docs/apis/geolocation)

## 💡 Tips

- Always run `npx cap sync` after installing new packages
- Use `npx cap open ios/android` to open native IDEs
- Test on real devices for best results
- Keep hot-reload enabled during active development

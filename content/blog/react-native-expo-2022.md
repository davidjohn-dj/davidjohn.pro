---
title: "React Native in 2022: Expo Grew Up"
date: "2022-07-21"
category: "React Native"
excerpt: "EAS Build, dev clients, and config plugins removed the old reasons to eject. How I structure a production Expo app now."
---

For years the React Native advice was "start with Expo, eject when you get serious." Having shipped two production apps on it this year: that advice is dead. Expo's EAS tooling removed the ejection triggers one by one.

## What changed

The old dealbreaker was native modules: Expo Go only bundled its own SDK, so any custom native dependency meant ejecting. **Dev clients** fixed that — you build your *own* development app containing exactly your native modules:

```bash
npx expo install react-native-vision-camera
npx expo run:ios   # or: eas build --profile development
```

**Config plugins** handle the native configuration (Info.plist entries, Gradle tweaks) declaratively in `app.json`, so there's no iOS/Android project checked into git at all:

```json
{
  "plugins": [
    ["react-native-vision-camera", {
      "cameraPermissionText": "Scan documents with your camera"
    }]
  ]
}
```

`npx expo prebuild` regenerates the native projects from config on demand. Native folders become build artifacts, not source — which means React Native upgrades stop being surgery.

## EAS Build and Submit

Cloud builds for both platforms without a Mac in CI:

```bash
eas build --platform all --profile production
eas submit --platform ios
```

Signing credentials are managed for you (this alone is worth it — iOS certificates have consumed weeks of my life), and **EAS Update** ships OTA JavaScript updates for fixes that can't wait for review.

## The structure I use

Expo Router is still early, so: React Navigation for routing, TanStack Query for server state, Zustand for client state — the web stack's sensibilities translate directly. Shared TypeScript types between the app and a tRPC backend close the loop.

## Still-real limitations

Build minutes are a metered resource; brand-new native features occasionally lag a release behind bare RN; and if your app is 60% custom native code, Expo's value shrinks. But the default has flipped: you now need a reason *not* to use Expo.

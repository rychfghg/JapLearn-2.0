<div align="center">
  <img src="./assets/APPLOGO.png" alt="JapLearn logo" width="96" />

  # JapLearn Student App

  **Interactive Japanese learning through lessons, speaking practice, and games.**

  [![Android APK](https://img.shields.io/badge/Android%20APK-Available-3DDC84?logo=android&logoColor=white)](https://expo.dev/accounts/reybacolod/projects/japlearn/builds/1a3d3435-7a43-4340-8e21-997d69f5f0b6)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=111827)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

  Android APK · Desktop Web · Mobile Web
</div>

---

## Overview

JapLearn is a connected Japanese-learning platform for students and teachers. The current release is available as a standalone, installable **Android APK** and a responsive **web application**. The Android APK does not require Expo Go. iPhone and iPad users can use the web version in Safari or another modern browser; a native iOS application is not currently released.

The student experience includes:

- Guided Kana, vocabulary, and grammar lessons
- **Quack-a-Mole** for fast recognition practice
- **Quackman** for Japanese word challenges
- **QuackSlate** for solo sentence practice and teacher-code sessions
- **QuackSituate**, including Expression Match and politeness-focused situational practice
- **QuackResponse**, including Reply Coach, Response Rush, and Dialogue Relay
- **QuackTalk**, including Guided Phrase Practice and Talk with Sumi
- **QuackProgress** for scores, mastery, completion, focus areas, and communication feedback
- Per-account classroom enrollment and synchronized learning records across supported devices

This repository contains the **Expo/React Native student frontend**. Authentication, progress storage, classes, teacher synchronization, and email services are provided by the separate Spring Boot backend.

## Download JapLearn

### Android

Download the current standalone Android APK:

**[Download JapLearn for Android](https://expo.dev/accounts/reybacolod/projects/japlearn/builds/1a3d3435-7a43-4340-8e21-997d69f5f0b6)**

Open the download page on an Android device, download the `.apk`, and approve installation from the browser when Android requests permission. Expo Go is not required to install or run this release.

### Web

Use JapLearn in a browser at **[japlearn.com](https://japlearn.com)**. The web version supports desktop browsers, Android browsers, and Safari on iPhone and iPad.

## Tech Stack

| Area | Technology |
|---|---|
| App | React Native 0.76 + Expo SDK 52 |
| Language | TypeScript |
| Navigation | Expo Router |
| Local device state | AsyncStorage |
| Synced records | Spring Boot API + MongoDB |
| Audio | Expo AV + React Native Audio API |
| Icons | Expo Vector Icons |
| Web | React Native Web |
| Builds | EAS Build |

## Requirements

- Node.js 20 LTS or newer
- npm
- Git
- An Android device for testing the standalone APK
- Expo Go or an Android development build only when testing the project during local development
- A running JapLearn backend for server-connected features

## Setup

```bash
git clone <repository-url>
cd Japlearn-1
npm ci
```

Start the application:

```bash
npx expo start
```

For local development, scan the QR code with Expo Go on Android or press `w` to open the web version. Regular users should install the standalone APK from the download section above and do not need Expo Go. On iPhone or iPad, use the deployed web application in the browser for the currently supported experience.

If cached files cause unexpected behavior:

```bash
npx expo start -c
```

## Backend Configuration

Backend selection is managed in [`expoconfig.tsx`](./expoconfig.tsx).

| Environment | Backend |
|---|---|
| Local web | `http://localhost:8080` |
| Android emulator | `http://10.0.2.2:8080` |
| Expo Go on a physical device | Development computer's LAN address |
| Deployed web and APK builds | `https://japlearn2-0.onrender.com` |

For Expo Go testing, set `LAN_IP_URL` to the active IPv4 address of the computer running Spring Boot. The phone and computer must use the same network.

```ts
const LAN_IP_URL = 'http://192.168.x.x:8080';
```

Never store database passwords, SMTP credentials, JWT secrets, or private keys in this frontend.

## Common Commands

| Command | Purpose |
|---|---|
| `npx expo start` | Start the Expo development server |
| `npm run web` | Run the web app |
| `npx expo start -c` | Start Expo with a cleared cache |
| `npx expo export --platform android` | Verify the Android production bundle |
| `npx expo export --platform web` | Create the web production export |
| `npx expo-doctor` | Check Expo package compatibility |

## EAS Builds

Sign in before submitting a build:

```bash
npx eas-cli login
```

Create an installable Android APK:

```bash
npx eas-cli build -p android --profile apk
```

Create an Android App Bundle for Google Play:

```bash
npx eas-cli build -p android --profile production
```

The `apk` profile produces the standalone Android package used for direct installation and testing. The `production` profile produces an Android App Bundle intended for a future Google Play release.

The currently published APK is available from the [JapLearn Android build page](https://expo.dev/accounts/reybacolod/projects/japlearn/builds/1a3d3435-7a43-4340-8e21-997d69f5f0b6). EAS is the build service used to compile the APK; the resulting application runs independently and does not require Expo Go.

> Native iOS builds are not part of the current JapLearn release. Do not advertise App Store availability until an iOS build has been implemented, tested, and published.

## Web Build

```bash
npx expo export --platform web
```

The production student website is available at [japlearn.com](https://japlearn.com) and is generated in `dist/`. It supports desktop browsers, Android browsers, and iPhone/iPad browsers. The included `vercel.json` supports direct Expo Router links such as `/ResetPassword`.

The teacher and admin website is available separately at [portal.japlearn.com](https://portal.japlearn.com).

## Project Structure

```text
Japlearn-1/
├── app/            # Screens and Expo Router routes
├── assets/         # Fonts, images, sprites, audio, and game artwork
├── components/     # Reusable interface components
├── context/        # Authentication and shared application state
├── data/           # Local lesson and game content
├── patches/        # Native dependency compatibility fixes applied during installation
├── styles/         # Screen-specific styles
├── types/          # TypeScript definitions
├── utils/          # API, asset, and application utilities
├── app.json        # Expo application configuration
├── eas.json        # EAS build profiles
├── expoconfig.tsx  # Backend URL selection
└── package.json    # Dependencies and scripts
```

## Before Committing

1. Confirm the standalone Android APK installs and opens successfully; use Expo only for local development checks.
2. Test the changed screen on a narrow phone layout.
3. Verify audio, fonts, icons, and local images.
4. Confirm timers and audio stop when leaving game screens.
5. Run Android and web export checks. Also test the responsive web layout in Safari-compatible mobile dimensions.
6. Ensure credentials and generated builds are not staged.

## Troubleshooting

### Requests fail on a physical phone

- Confirm Spring Boot is running.
- Confirm `LAN_IP_URL` uses the computer's current IPv4 address.
- Keep the phone and computer on the same network.
- Allow backend port `8080` through the firewall.

### Deployed requests fail

- Confirm the Render backend is reachable.
- A sleeping free-tier service may need time to wake up.

### Accessing JapLearn on iPhone or iPad

- Open [japlearn.com](https://japlearn.com) in Safari or another modern browser.
- Allow microphone access when using supported speaking activities.
- There is currently no native iOS/App Store version.

### Fonts, icons, or images look stale

```bash
npx expo start -c
```

Reopen the app after the cache is cleared.

### A deployed web route returns 404

Confirm `vercel.json` is deployed from the project root and that Vercel uses `dist` as the output directory.

---

<div align="center">
  <strong>Learn Japanese. Practice naturally. Keep progressing.</strong>
  <br />
  <sub>JapLearn — Japanese made interactive.</sub>
</div>

<div align="center">
  <img src="./assets/APPLOGO.png" alt="JapLearn logo" width="96" />

  # JapLearn Student App

  **Interactive Japanese learning through lessons, speaking practice, and games.**

  [![Expo](https://img.shields.io/badge/Expo-SDK%2052-4630EB?logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=111827)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

  Android · iOS · Web
</div>

---

## Overview

JapLearn is a student-focused Japanese language application featuring:

- Guided Kana, vocabulary, and grammar lessons
- Quack-a-Mole, Quackman, QuackSlate, and QuackSituate activities
- QuackResponse communication exercises
- QuackTalk speaking practice with Sumi
- Student progress, scores, mastery, and achievements
- Teacher-class enrollment and synchronized learning records

This repository contains the **Expo/React Native student frontend**. Authentication, progress storage, classes, teacher synchronization, and email services are provided by the separate Spring Boot backend.

## Tech Stack

| Area | Technology |
|---|---|
| App | React Native 0.76 + Expo SDK 52 |
| Language | TypeScript |
| Navigation | Expo Router |
| Storage | AsyncStorage |
| Audio | Expo AV |
| Icons | Expo Vector Icons |
| Web | React Native Web |
| Builds | EAS Build |

## Requirements

- Node.js 20 LTS or newer
- npm
- Git
- Expo Go for development on a physical phone
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

Scan the QR code with Expo Go, or press `w` to open the web version.

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

The `apk` profile is for direct device testing. The `production` profile produces the store-ready Android build.

## Web Build

```bash
npx expo export --platform web
```

The production website is generated in `dist/`. The included `vercel.json` supports direct Expo Router links such as `/ResetPassword`.

## Project Structure

```text
Japlearn-1/
├── app/            # Screens and Expo Router routes
├── assets/         # Fonts, images, sprites, audio, and game artwork
├── components/     # Reusable interface components
├── context/        # Authentication and shared application state
├── data/           # Local lesson and game content
├── styles/         # Screen-specific styles
├── types/          # TypeScript definitions
├── utils/          # API, asset, and application utilities
├── app.json        # Expo application configuration
├── eas.json        # EAS build profiles
├── expoconfig.tsx  # Backend URL selection
└── package.json    # Dependencies and scripts
```

## Before Committing

1. Confirm the app opens through Expo.
2. Test the changed screen on a narrow phone layout.
3. Verify audio, fonts, icons, and local images.
4. Confirm timers and audio stop when leaving game screens.
5. Run Android and web export checks.
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

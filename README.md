<div align="center">
  <img src="./assets/APPLOGO.png" alt="JapLearn logo" width="96" />

  # JapLearn Student App

  **Interactive Japanese learning through lessons, speaking practice, and games.**

  [![Android APK v1.0.1](https://img.shields.io/badge/Android%20APK-v1.0.1%20pre--release-3DDC84?logo=android&logoColor=white)](https://github.com/rychfghg/JapLearn-2.0/releases/tag/v1.0.1)
  [![Expo SDK 52](https://img.shields.io/badge/Expo-SDK%2052-4630EB?logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=111827)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

  Android application · Web at [japlearn.com](https://japlearn.com) · Teacher dashboard
</div>

---

## Overview

JapLearn is a Japanese-learning application for students, paired with a **teacher dashboard and admin portal**. Students use the standalone **Android APK** or the **web version at [japlearn.com](https://japlearn.com)**; Expo Go is not required for either. A native iOS application is not part of this release, so iPhone and iPad users should use the web version.

The student experience includes:

- Guided Kana, vocabulary, and grammar lessons
- **Quack-a-Mole** for fast recognition practice
- **Quackman** for Japanese word challenges (words are managed in the admin portal)
- **QuackSlate** for solo sentence practice and teacher-code sessions
- **QuackSituate**: Ahiru Rescue, Expression Match, and Politeness
- **QuackResponse**: Reply Coach, Response Rush, and Dialogue Relay
- **QuackTalk**: Guided Phrase Practice and Talk with Sumi
- **QuackProgress** for scores, mastery, completion, focus areas, and communication feedback
- Badges, a daily goal, and a day streak on the home screen
- Email sign-up and **Sign in with Google**, with per-account classroom enrollment
- Students can edit their own first and last name in **Profile**
- Offline progress that syncs automatically when the connection returns
- In-app account deletion, as required by Google Play

This repository contains the **Expo/React Native student frontend**. Authentication, progress storage, classes, teacher synchronization, speech assessment, and email are provided by the separate Spring Boot backend.

### Related repositories

| Repository | Contents |
|---|---|
| [JapLearn-2.0](https://github.com/rychfghg/JapLearn-2.0) | This student application (Android and web) |
| [Japlearn-Website](https://github.com/rychfghg/Japlearn-Website) | Teacher dashboard and admin portal at [portal.japlearn.com](https://portal.japlearn.com) |
| [JapLearn2.0](https://github.com/rychfghg/JapLearn2.0) | Spring Boot backend API |

## Download JapLearn

**[Download JapLearn for Android (v1.0.1 pre-release)](https://github.com/rychfghg/JapLearn-2.0/releases/tag/v1.0.1)**

Open the release page on an Android device, download the `.apk` asset, and approve installation from the browser when Android requests permission.

> **Sign in with Google** needs an APK built after the Google Sign-In module was added. Older APKs keep working with email sign-in and simply hide the Google button; install the newest APK to get it.

## Learning Design (JapLearn 2.0)

JapLearn 2.0 keeps every game and refactors **how students prepare, progress, and learn from mistakes**, based on the MVP validation findings.

| Activity | What the student experiences |
|---|---|
| **Reply Coach** | Untimed and guided. Shows the setting, partner, and goal; plays the line; explains why a reply fits; then gives a new example of the same skill. Replay, Romaji, and meaning help are available, and help is recorded. Its readiness check unlocks Response Rush and Dialogue Relay. |
| **Response Rush** | Optional untimed practice, then a clearly labelled timed challenge. The timer starts only after the audio finishes and the choices are ready. Missed skills are revisited with new untimed questions. |
| **Dialogue Relay** | Connected conversations where each line, task, choice, and reply follow on from each other. The conversation so far stays visible and each line can be replayed. A wrong reply is explained and repaired before continuing. |
| **Talk with Sumi** | Opens without starting the mic; the student presses **Start**. Clear "Sumi speaking / your turn / listening" states, history, replay, and reconnect. Complexity adapts to demonstrated performance. |
| **Guided Phrase Practice** | A fixed sequence: Sumi models → student records → evaluation → short feedback → retry or continue. Response fit and sound accuracy are shown separately. |
| **Ahiru Rescue** | Each question shows where you are, who you are speaking to, and your goal. After a mistake, the mismatch is explained and the skill is practised in a new scene. |
| **Expression Match** | Situation captions for every picture, caption-only checks, and a Retry or fallback when a picture fails to load. |
| **Politeness** | The relationship (friend, teacher, unfamiliar adult, customer) is explicit, and feedback explains the answer for that setting. |

**How results are recorded**

- Only the **first independent attempt** counts toward accuracy. Corrected answers, repairs, and practice are saved separately.
- **Assisted answers** (hint, Romaji, or meaning shown) are recorded and are not treated as independent mastery.
- **Wrong answer, timeout, and technical interruption** are kept apart. Silence, a failed recording, or an app interruption leads to Retry and is never scored as wrong.
- **Context fit** is separate from **pronunciation and fluency**.
- QuackSituate saves **per-question answers**, so repeated mistakes can be analysed by skill, relationship, and setting.

## Tech Stack

| Area | Technology |
|---|---|
| App | React Native 0.76 + Expo SDK 52 |
| Language | TypeScript |
| Navigation | Expo Router |
| Web hosting | Vercel ([japlearn.com](https://japlearn.com)) |
| Sign-in | Email and password, Google Sign-In (native on Android, Google Identity Services on web) |
| Local device state | AsyncStorage |
| Synced records | Spring Boot API + MongoDB Atlas |
| Speech assessment | Microsoft Azure Speech (through the backend) |
| Live conversation and feedback | Google Gemini (through the backend) |
| Audio | Expo AV + React Native Audio API |
| Icons | Expo Vector Icons |
| Builds | EAS Build |
| Over-the-air updates | EAS Update (`expo-updates`) |

## Requirements

- Node.js 20 LTS or newer
- npm
- Git
- An Android device for testing the standalone APK
- Expo Go or an Android development build only for local development
- A running JapLearn backend for server-connected features

## Setup

```bash
git clone <repository-url>
cd Japlearn-1
npm ci
npx expo start
```

For local development, scan the QR code with Expo Go on an Android device, or press `w` for the browser. If cached files cause unexpected behavior, start with `npx expo start -c`.

## Backend Configuration

Backend selection is managed in [`expoconfig.tsx`](./expoconfig.tsx).

| Environment | Backend |
|---|---|
| Local development preview | `http://localhost:8080` |
| Android emulator | `http://10.0.2.2:8080` |
| Expo Go on a physical device | Development computer's LAN address |
| APK and web builds | `https://portal.japlearn.com` (relayed to the backend) |

For Expo Go testing, set `LAN_IP_URL` to the active IPv4 address of the computer running Spring Boot. The phone and computer must use the same network.

```ts
const LAN_IP_URL = 'http://192.168.x.x:8080';
```

The Google OAuth **client IDs** in the app are public identifiers and are safe to commit. Never store database passwords, SMTP credentials, API keys, client secrets, keystores, or private keys in this frontend.

## Common Commands

| Command | Purpose |
|---|---|
| `npx expo start` | Start the Expo development server |
| `npm run web` | Run the web version locally |
| `npx expo start -c` | Start Expo with a cleared cache |
| `npx tsc --noEmit -p .` | Type-check the project (takes a few minutes) |
| `npx expo export --platform android` | Verify the Android production bundle |
| `npx expo-doctor` | Check Expo package compatibility |

## EAS Builds

```bash
npx eas-cli login
npx eas-cli build -p android --profile apk          # installable APK
npx eas-cli build -p android --profile production   # Android App Bundle for Google Play
```

The `apk` profile produces the standalone package used for direct installation. The `production` profile produces an Android App Bundle for a future Google Play release. The published APK is attached to the [v1.0.1 pre-release](https://github.com/rychfghg/JapLearn-2.0/releases/tag/v1.0.1).

> Native iOS builds are not part of the current release. Do not advertise App Store availability until an iOS build has been implemented, tested, and published.

## Over-the-Air Updates

JavaScript and asset changes can reach installed apps without a new APK:

```bash
npx eas-cli@latest update --branch apk --message "Describe the change"
```

| Build profile | Channel / branch |
|---|---|
| `apk` | `apk` |
| `preview` | `preview` |
| `production` | `production` |

The app checks for updates when it launches, so users may need to **open the app twice**. `runtimeVersion` follows the app version (`1.0.1`); an update only reaches builds with the same version. Changes to native code, permissions, or plugins (for example, adding Google Sign-In) require a new build instead of an update.

**Release order:** when a change touches both the app and the backend, deploy the backend first, then publish the update, so new fields are not dropped.

## Privacy, Permissions, and Account Deletion

| Permission | Used for |
|---|---|
| Microphone (`RECORD_AUDIO`) | Speaking activities, only after the user allows it |
| Internet | Signing in, saving progress, loading lessons |
| Modify audio settings | Routing lesson and game audio |
| Vibration | Haptic feedback in some games |

Storage and overlay permissions are blocked in [`app.json`](./app.json). The app contains no advertising or analytics SDKs.

Speaking activities send recorded speech to the backend, which uses Microsoft Azure Speech for pronunciation scores and Google Gemini for conversation and feedback. The transcript, scores, and feedback are saved; the raw audio is not.

**Account deletion.** Users can delete their account in **Profile → Delete account** (help is offered first, then a confirmation checkbox and typing `DELETE`). The same deletion is available at [portal.japlearn.com/delete-account](https://portal.japlearn.com/delete-account). Both remove the account and every learning record.

The full policies are shown in the app and published at [portal.japlearn.com/privacy](https://portal.japlearn.com/privacy) and [portal.japlearn.com/terms](https://portal.japlearn.com/terms). Keep both versions identical when either changes.

## Offline Progress

Progress is saved on the device first and queued when the connection drops, then synced automatically when the app reconnects or returns to the foreground. Bundled content and media keep games playable offline. See [`services/offlineProgress.ts`](./services/offlineProgress.ts), [`services/offlineSync.ts`](./services/offlineSync.ts), and [`services/offlineContent.ts`](./services/offlineContent.ts).

## Project Structure

```text
Japlearn-1/
├── app/            # Screens and Expo Router routes
├── assets/         # Fonts, images, sprites, audio, and game artwork
├── components/     # Reusable interface components (Google button, game pop-ups, readiness, reviews)
├── config/         # Feature configuration, such as Sumi's voice profile
├── context/        # Authentication and shared application state
├── data/           # Bundled scenario content (Politeness scenarios and guidance, Expression Match media)
├── hooks/          # Shared React hooks
├── patches/        # Native dependency compatibility fixes applied during installation
├── services/       # Offline sync, Google sign-in, live conversation, and per-game helpers
├── styles/         # Screen-specific styles
├── types/          # Extra TypeScript declarations
├── utils/          # Input rules, asset preloading, audio, and platform utilities
├── app.json        # Expo configuration (name, icons, permissions, plugins, updates)
├── eas.json        # EAS build profiles (apk, preview, production)
├── expoconfig.tsx  # Backend URL selection
├── vercel.json     # Web hosting rewrites and security headers
└── package.json    # Dependencies and scripts
```

## Before Committing

1. Confirm the APK installs and opens, and the web version loads.
2. Test the changed screen on a narrow phone layout.
3. Verify audio, fonts, icons, and local images.
4. Confirm timers and audio stop when leaving game screens.
5. Run the type check and the Android export check.
6. If a change touches collected data or permissions, update the privacy policy in the app and in the teacher dashboard.
7. Ensure credentials and generated builds are not staged. The `dist/` and `dist-*/` folders are ignored.

## Troubleshooting

### Requests fail on a physical phone

- Confirm Spring Boot is running and `LAN_IP_URL` uses the computer's current IPv4 address.
- Keep the phone and computer on the same network, and allow port `8080` through the firewall.

### Deployed requests fail

- Confirm the Render backend is reachable. A sleeping free-tier service may need time to wake up.

### The Google button is missing

- On Android, the installed APK predates Google Sign-In. Install the newest APK.
- On web, confirm the site's address is listed as an authorized JavaScript origin for the web client ID.

### An update does not appear on a phone

- Confirm the update was published to the branch that matches the build's channel.
- Close the app fully and open it again, twice.
- Check that the build's app version matches the update's version.

### Fonts, icons, or images look stale

Run `npx expo start -c` and reopen the app.

---

<div align="center">
  <strong>Learn Japanese. Practice naturally. Keep progressing.</strong>
  <br />
  <sub>JapLearn — Japanese made interactive.</sub>
</div>

<div align="center">
  <img src="./assets/APPLOGO.png" alt="JapLearn logo" width="112" />

  # JapLearn Student App

  **Interactive Japanese learning through guided lessons, speaking practice, and gamified activities.**

  [![Expo](https://img.shields.io/badge/Expo-SDK%2056-4630EB?logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=111827)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Expo Router](https://img.shields.io/badge/Navigation-Expo%20Router-7C3AED)](https://docs.expo.dev/router/introduction/)

  Mobile · Android · iOS · Web
</div>

---

## About JapLearn

JapLearn is a Japanese-language learning application for students. It combines structured lessons with interactive activities, communication practice, progress tracking, and game-based learning.

### Main learning experiences

- **Learn** — Kana, vocabulary, and grammar learning paths
- **Quack-a-Mole** — Fast kana recognition practice
- **Quackman** — Japanese word-building challenges
- **QuackSlate** — Sentence-building practice and teacher-hosted sessions
- **QuackSituate** — Recognition, expression matching, and politeness scenarios
- **QuackResponse** — Guided, timed, and multi-step response missions
- **QuackTalk** — Japanese speaking practice with Sumi
- **QuackProgress** — Mastery, scores, progression, and learning analytics

> This repository contains the **React Native/Expo student frontend**. The Spring Boot backend must run separately for authentication, progress saving, teacher synchronization, and other server features.

---

## Technology

| Area | Technology |
|---|---|
| Application | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| Web support | React Native Web |
| Local storage | AsyncStorage |
| Audio | Expo AV |
| Icons | Expo Vector Icons |
| Animation | React Native Animated and Animatable |
| SVG support | React Native SVG + SVG Transformer |
| Cloud builds | EAS Build |
| Web deployment | Vercel-compatible static export |

---

## Prerequisites

Install these before setting up the project:

1. **Node.js 20 LTS or newer**  
   Download from [nodejs.org](https://nodejs.org/).

2. **npm**  
   npm is included with Node.js. Confirm both installations:

   ```bash
   node --version
   npm --version
   ```

3. **Git**  
   Download from [git-scm.com](https://git-scm.com/).

4. **A running JapLearn Spring Boot backend**  
   Local development expects the backend on port `8080`.

### Choose a device setup

- **Web:** A modern browser such as Chrome, Edge, Firefox, or Safari
- **Physical Android/iPhone:** Install **Expo Go** and connect the phone to the same Wi-Fi network as the development computer
- **Android emulator:** Install Android Studio and create an Android Virtual Device
- **iOS simulator:** Requires macOS and Xcode

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Japlearn-1
```

If this frontend is inside the complete JapLearn workspace, open this directory:

```text
JapLearn-FrontEnd_Final_Test/Japlearn-1
```

### 2. Install dependencies

For a clean and reproducible installation:

```bash
npm ci
```

If the lock file is intentionally being updated, use:

```bash
npm install
```

### 3. Configure the backend address

The API selection logic is located in [`expoconfig.tsx`](./expoconfig.tsx).

Current behavior:

| Runtime | Backend used |
|---|---|
| Local web browser | `http://localhost:8080` |
| Android emulator | `http://10.0.2.2:8080` |
| Physical device with Expo | Development computer's LAN address |
| Deployed web/native build | `https://japlearn2-0.onrender.com` |

For a physical phone, update `LAN_IP_URL` with the development computer's current IPv4 address:

```ts
const LAN_IP_URL = 'http://192.168.x.x:8080';
```

To find the address on Windows:

```powershell
ipconfig
```

Use the **IPv4 Address** of the active Wi-Fi adapter. The phone and computer must be connected to the same network.

> Do not place passwords, SMTP keys, database credentials, or private API secrets in this frontend. Browser and mobile bundles are visible to users. Store secrets only in the Spring Boot backend or deployment environment.

### 4. Start the Spring Boot backend

Start the backend before testing features that save or fetch data. Confirm it responds at:

```text
http://localhost:8080
```

For physical-device testing, the backend must accept connections through the computer's LAN address and the firewall must allow port `8080`.

### 5. Start JapLearn

```bash
npm start
```

The Expo terminal will show options for opening the application.

---

## Run Commands

| Command | Purpose |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run web` | Open the web version |
| `npm run android` | Open on an Android emulator/device |
| `npm run ios` | Open in the iOS simulator on macOS |
| `npx expo start -c` | Start Expo and clear the Metro cache |
| `npx expo export --platform web` | Create a production web export in `dist/` |

### Physical phone with Expo Go

1. Run `npm start`.
2. Open Expo Go on the phone.
3. Scan the QR code displayed by Expo.
4. Keep the phone and computer on the same Wi-Fi network.
5. Make sure `LAN_IP_URL` points to the computer running Spring Boot.

---

## Project Structure

```text
Japlearn-1/
├── app/                 # Expo Router screens and routes
├── assets/              # Images, sprites, audio, fonts, and game artwork
├── components/          # Shared interface components
├── context/             # Shared React state and application context
├── data/                # Local lesson and game content
├── styles/              # Screen-specific React Native styles
├── types/               # Shared TypeScript definitions
├── utils/               # API and application utilities
├── app.json             # Expo application configuration
├── eas.json             # EAS development, preview, and production profiles
├── expoconfig.tsx       # Backend URL selection
├── metro.config.js      # Metro and SVG transformer configuration
├── tsconfig.json        # TypeScript configuration
├── vercel.json          # Single-page application rewrites for Vercel
└── package.json         # Dependencies and npm scripts
```

### Routing

Files inside `app/` become application routes through Expo Router. The shared navigation configuration is in:

```text
app/_layout.tsx
```

When adding a screen, preserve existing route names and backend calls unless the corresponding navigation or API contract is intentionally being changed.

---

## Web Production Build

Create a production-ready static export:

```bash
npx expo export --platform web
```

The generated website is written to:

```text
dist/
```

Test the production export before deploying it:

```bash
npx serve dist
```

The included `vercel.json` redirects application routes to `index.html`, allowing direct links such as `/ResetPassword` to work with Expo Router.

### Suggested Vercel settings

| Setting | Value |
|---|---|
| Framework preset | Other |
| Install command | `npm ci` |
| Build command | `npx expo export --platform web` |
| Output directory | `dist` |

---

## Native Builds with EAS

Install and sign in to the EAS CLI:

```bash
npm install --global eas-cli
eas login
```

Available profiles from `eas.json`:

```bash
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android
```

For iOS, replace `android` with `ios`. Apple credentials and macOS/iOS requirements may apply.

---

## Troubleshooting

### The application opens but requests fail

- Confirm the Spring Boot backend is running.
- Confirm the configured API address is correct.
- On a physical phone, do not use `localhost`; use the computer's LAN IPv4 address.
- Confirm the firewall permits inbound access to port `8080`.
- For the deployed app, confirm the Render backend is awake and healthy.

### Expo or assets appear stale

Clear Metro's cache:

```bash
npx expo start -c
```

Then refresh or reopen the application.

### Dependency installation problems

Remove only generated dependencies and reinstall them:

```bash
npm ci
```

Avoid manually editing files inside `node_modules/` because they are regenerated during installation.

### Android emulator cannot reach the backend

The Android emulator uses:

```text
http://10.0.2.2:8080
```

This address maps to the development computer's localhost.

### A direct web route displays 404 after deployment

- Confirm `vercel.json` is included in the deployed project root.
- Confirm the Vercel output directory is `dist`.
- Redeploy after committing the rewrite configuration.

### Audio does not play automatically in a browser

Some browsers block audio until the user interacts with the page. Tap or click the game once, then retry the audio control.

---

## Development Guidelines

- Preserve backend endpoints, request bodies, and stored progress logic during design-only changes.
- Keep components and styles readable; do not compress entire files onto one line.
- Reuse existing JapLearn assets and palette before adding replacements.
- Test mobile layouts at narrow screen widths.
- Stop timers, audio, and animations when leaving a game screen.
- Never commit secrets, production credentials, `.env.local` files, or private keys.
- Run a web export before committing major changes:

  ```bash
  npx expo export --platform web
  ```

---

## Security Notes

This frontend should contain only public configuration such as a backend base URL. Sensitive values belong in protected backend environment variables.

Before pushing to GitHub, confirm that the following are not committed:

- Database connection strings
- SMTP passwords
- Brevo API or SMTP keys
- JWT secrets
- Admin credentials
- Private signing certificates
- Service-account files

---

## Related Services

- **Production student web app:** [japlearn20.vercel.app](https://japlearn20.vercel.app)
- **Production backend:** [japlearn2-0.onrender.com](https://japlearn2-0.onrender.com)

---

<div align="center">
  <strong>Learn Japanese. Practice naturally. Keep progressing.</strong>
  <br />
  <sub>JapLearn — Japanese made interactive.</sub>
</div>

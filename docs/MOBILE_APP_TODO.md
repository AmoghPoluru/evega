# Todo List iOS App — Roadmap

**Goal:** Ship a todo list app you can install on your iPhone (TestFlight or App Store).

**Recommended stack:** [Expo](https://expo.dev) (React Native) — you already use React/TypeScript in Evega; one codebase targets iOS (and Android later if you want).

**Repo layout (suggested):** Keep the mobile app separate from Evega web, e.g. `apps/todo-mobile/` or a new repo `evega-todo`. Avoid bolting a full native app into the Next.js tree.

---

## Before you start — decisions

| Question | Options | Recommendation to start |
|----------|---------|-------------------------|
| Data storage | Local only vs cloud sync | **Local only** (AsyncStorage) — ship faster |
| Account / login | None vs email vs Apple Sign In | **None** for v1 |
| Backend | None vs Evega API vs Firebase/Supabase | **None** for v1 |
| Distribution | Expo Go vs dev build vs TestFlight vs App Store | **Expo Go** while building → **TestFlight** when ready to “really” install |

**Apple requirements for App Store / TestFlight:**

- Mac with **Xcode** installed
- **Apple Developer Program** ($99/year) for TestFlight and App Store
- Without paid account: you can still run on simulator and use **Expo Go** on your phone (limited, not a standalone “your app” icon from the store)

---

## Phase 0 — Environment (Day 1)

- [ ] Install Node.js 20+ (match Evega if possible)
- [ ] Install Xcode from Mac App Store (for iOS simulator and builds)
- [ ] Open Xcode once → accept license → install iOS Simulator
- [ ] Install Expo CLI: `npm install -g eas-cli` (optional but needed for store builds)
- [ ] Create free [Expo](https://expo.dev) account
- [ ] Decide: new folder `apps/todo-mobile` in this repo **or** new Git repo

---

## Phase 1 — Scaffold the app (Day 1–2)

- [ ] Create app: `npx create-expo-app@latest todo-mobile --template tabs` (or `blank-typescript`)
- [ ] Run on simulator: `npx expo start` → press `i` for iOS simulator
- [ ] Run on physical iPhone: install **Expo Go** from App Store, scan QR from `expo start`
- [ ] Enable TypeScript strict mode in `tsconfig.json`
- [ ] Add folder structure:
  - `src/screens/` — Home (list), Add/Edit todo
  - `src/components/` — TodoRow, EmptyState
  - `src/hooks/` — `useTodos`
  - `src/types/` — `Todo` type
  - `src/storage/` — load/save todos

---

## Phase 2 — Core features (Week 1)

- [ ] **Todo model:** `id`, `title`, `completed`, `createdAt`, optional `dueDate`
- [ ] **List screen:** show all todos, sort incomplete first
- [ ] **Add todo:** text input + save
- [ ] **Toggle complete:** tap checkbox
- [ ] **Delete:** swipe or long-press → delete
- [ ] **Edit:** tap row → edit title (and due date if you add it)
- [ ] **Persist:** save to device with `@react-native-async-storage/async-storage` on every change
- [ ] **Load on launch:** read storage in `useEffect` / app init
- [ ] Empty state when no todos

**Acceptance:** Kill app, reopen — todos still there.

---

## Phase 3 — Polish (Week 2)

- [ ] Safe area / notch handling (`SafeAreaView` or `react-native-safe-area-context`)
- [ ] Light/dark mode (optional: `useColorScheme`)
- [ ] Haptic feedback on complete (optional: `expo-haptics`)
- [ ] Filter: All / Active / Completed
- [ ] Search todos (optional)
- [ ] Basic accessibility: labels on buttons, min tap target 44pt

---

## Phase 4 — Standalone iOS build (Week 2–3)

Expo Go is for development. For an app icon on your home screen **without** opening Expo Go:

- [ ] Install EAS: `npm install -g eas-cli` && `eas login`
- [ ] In project root: `eas build:configure`
- [ ] Add `app.json` / `app.config` — `name`, `slug`, `ios.bundleIdentifier` (e.g. `com.yourname.todolist`)
- [ ] Run cloud build: `eas build --platform ios --profile development` (dev client) or `preview` (internal install)
- [ ] Register device UDID for ad-hoc installs (EAS guides you)
- [ ] Install build on iPhone (link from Expo dashboard)

---

## Phase 5 — TestFlight (when you want “download like a real app”)

- [ ] Enroll in [Apple Developer Program](https://developer.apple.com/programs/)
- [ ] In Apple Developer: create App ID matching `bundleIdentifier`
- [ ] `eas build --platform ios --profile production`
- [ ] `eas submit --platform ios` (or upload IPA in App Store Connect)
- [ ] App Store Connect → create app → **TestFlight** → add yourself as internal tester
- [ ] Install **TestFlight** on iPhone → accept invite → install your app

---

## Phase 6 — App Store (optional, later)

- [ ] App icon 1024×1024, screenshots, privacy policy URL
- [ ] App Store Connect metadata (description, keywords, age rating)
- [ ] `eas submit` for review
- [ ] Respond to review feedback if rejected

---

## Phase 7 — Nice-to-haves (after v1 ships)

- [ ] Cloud sync (Supabase, Firebase, or Evega tRPC API)
- [ ] Push reminders (`expo-notifications`)
- [ ] Widgets (requires native module / Swift — harder in pure Expo)
- [ ] Apple Sign In + multi-device sync
- [ ] Android build: `eas build --platform android`

---

## If you want the todo app tied to Evega later

- [ ] New Payload collection `Todos` (user-scoped) or reuse `Users`
- [ ] tRPC router: `list`, `create`, `update`, `delete`
- [ ] Mobile app: `@trpc/client` + auth (NextAuth session or JWT)
- [ ] Not required for v1 — local-only app is valid product

---

## Quick reference commands

```bash
# New project (run outside evega root, or in apps/)
npx create-expo-app@latest todo-mobile --template blank-typescript
cd todo-mobile
npx expo start

# AsyncStorage
npx expo install @react-native-async-storage/async-storage

# Production iOS build (after eas.json exists)
eas build --platform ios --profile production
eas submit --platform ios
```

---

## Milestones checklist

| Milestone | You can… |
|-----------|----------|
| M1 | See app in iOS Simulator |
| M2 | Use app in Expo Go on your iPhone |
| M3 | Todos persist after restart |
| M4 | Install standalone build on device (EAS) |
| M5 | Install via TestFlight |
| M6 | Public App Store listing |

**Start here:** Complete Phase 0 + Phase 1, then Phase 2 until M3. That is a real todo app on your phone via Expo Go; Phases 4–5 are how you get a downloadable build outside Expo Go.

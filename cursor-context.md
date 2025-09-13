# CAT-able — Cursor Project Context (Frontend Only)

## 0) Purpose
We are building the **mobile app frontend** for CAT-able using **React Native + Expo (TypeScript)**. This file defines scope, features, architecture, conventions, and stubs so Cursor can generate code consistently. **Backend is out of scope**; we consume APIs via typed interfaces and mock services first.

---

## 1) MVP Goals (mobile-first)
- Daily habit loop for **logging cat health** quickly (fun, low friction).
- **Offline-first**: app works without network, syncs later.
- **Simple SUSI**: owner can login with username and email, or login with Facebook, Google or Apple as MVP. Similarly, the user can register with username, email plus the typical password and confirm password combo, while registering with the forementioned three 3rd party accounts are also available. There's a "continue as a guest" mode too, basically temporarily allow you to continue the userflow until you decide to SUSI.
- **Intuitive Tutorial**: 
- **Reminders**: local notifications to maintain streaks.

---

## 2) App Features (comprehensive list; FE-only)
**Accounts & Setup**
- Onboarding carousel + language select (en, zh, ja)
- Email sign-in screen (mock), basic profile (display name, region)
- Multi-pet support: add/edit/remove pet, avatar picker (local), breed text

**Home & Logging (core)**
- Home dashboard: today’s tasks (cards), streak counter, last log summary
- Log types: food, water, litter, weight, meds, mood, notes
- Quick-log UX: single tap presets + numeric input sheet
- Edit/delete log; view 7/30-day history and trends
- Offline create/update; pending badge until synced

**Gamification**
- Daily streaks (auto), XP/tokens on log complete
- Achievements list (e.g., “7-day streak”, “Perfect Week”)
- Lightweight community stub: “Share achievement” button (no network)

**Reports & Vet Sharing**
- Report screen: time range selector (7/30/90 days)
- Charts (weight), counts (litter), timelines (events)
- “Generate share link” (stub), “Copy link”, “Revoke” (local state only)

**Notifications**
- Reminders setup per log type (time-of-day pickers)
- Local push schedule (Expo Notifications)
- Handle missed reminder nudges

**Settings**
- Pet & Profile settings
- Units (kg, g; ml), 12/24h time
- Language switch (en, zh, ja)
- Data management: export CSV locally (stub), clear local cache

**Premium (UX only)**
- Paywall screen (copy/benefits/CTA)
- Feature gates: multi-caretaker toggle shows paywall

**Accessibility**
- Scalable text, VoiceOver labels, color-contrast-safe tokens

---

## 3) Tech Stack (FE)
- React Native + Expo (EAS), TypeScript
- Navigation: `@react-navigation/native` (stack + tabs)
- State: Zustand (UI) + React Query **or** Apollo (pick one later; default React Query with REST stubs)
- Forms: `react-hook-form` + Zod
- Offline DB: Expo SQLite (via `expo-sqlite` or `drizzle-orm/sqlite` later)
- Animations: `react-native-reanimated`
- Lists: `@shopify/flash-list`
- Charts: `react-native-svg` + a tiny wrapper
- Notifications: `expo-notifications`
- i18n: `react-i18next` + JSON resources
- Testing: Jest + React Testing Library; Detox later
- Styling: StyleSheet/Tailwind-RN (choose one; default StyleSheet + design tokens)

---

## 4) App Architecture & Folders

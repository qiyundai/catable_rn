# CAT-able — Cursor Project Context (Frontend Only)

## 0. Purpose
We are building the **mobile app frontend** for CAT-able using **React Native + Expo (TypeScript)**. This file defines scope, features, architecture, conventions, and stubs so Cursor can generate code consistently. **Backend is out of scope**; we consume APIs via typed interfaces and mock services first.

---

## 1. MVP Goals (mobile-first)
- Daily habit loop for **logging cat health** quickly (fun, low friction).
- **Offline-first**: app works without network, syncs later.

---

## 2. App Features (comprehensive list; FE-only)
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

## 3. Tech Stack (FE)
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

## 4. UI areas
The simple SUSI is going to be as typical as it can be, with input fields presented as a form at the center of the screen, and 3rd party account SUSI listed below a divider under the form, each with their corresponding platform icon, and last a continue as guest option at the bottom as a text-link. The top left corner has a back button to navigate out of SUSI flow layers if the user changes their mind about how to preceed.

The main UI has a header at the top left indicating the current location (Tasks, Profile, Community, etc.)

On the top right, there's always going to be the profile icon, through which the user can go to their own profile (profile of the cat owner)

on the bottom, we have a 3 button nav system. The one on the left says "Tasks", with an icon of 3 cards stack together, which takes the user to the tasks screen. The one on the right is pet profile. Nestled between the 2 buttons in the center as the inner upper corners of these 2 buttons curve into a rounded basin like a craddle is a circle shaped button with an icon that looks like a paper airplain. This button takes the user to the community screen.

In tasks screen, the main area in the center is going to be the task cards area. Find details in the user flow section below.

Different from the users profile, this profile screen is where all of their cat's profiles are rendered in single column cards, surfacing some basic info and a picture of the cat. the user can then click to view or edit the cats' profile in details in a modal. These 2 buttons toggle between inactive nad active states as you move from one screen to another.

In the conmmunity screen, it's basically a mini-game where you can see avatars of your cat(s) playing on a floating island. Towards the bottom, there's a set of left and right nav buttons, allowing you to navigate to your friend's islands and interact with their virtual cats. Below the nav buttons, is a text input expanded from the airplain icon community button, only now the airplain button posts whatever you write in the text input in a bubble on the top right corner of your floating island, visible to your visitors to your island.

---

## 5. Detailed User flow:
- **Simple SUSI**: owner can login with username and email, or login with Facebook, Google or Apple as MVP. Similarly, the user can register with username, email plus the typical password and confirm password combo, while registering with the forementioned three 3rd party accounts are also available. There's a "continue as a guest" mode too, basically temporarily allow you to continue the userflow until you decide to SUSI.
- **Intuitive Tutorial**: a deck of cards to walk through the initial setup while a progress bar on top of the cards keeps track of the overall tutorial pregression. 
    card 1: Let’s get started with setting up your cat’s profile!
    card 2: What's your cats name (with a picture upload space)?
    card 3: let's fill in some basic info for {cat-name}! (age, gender, breed and personality)
    card 4: add another cat? (if added, share the following logging goals by default)
    card 5: let's set a logging goal!
    card 6: Would you like to track the following daily tasks for your cat? (checklist: Water intake, feeding, Playtime activity, Poop consistency, Litter)
    card 7: Would you like to track the following recurring tasks for your cat? (checklist: grooming, tooth brushing, nail clipping, flea treatment, showering, internal deworming, vet check-up), and these options should come with custom recurring window configuration.
    card 8: When would you like to log everyday? The card present a 3 column dial allowing the user to choose the hour, minute (in 5 minute increments), and am/pm.
Each card comes with a skip button and a yes button. and after all is set,  the all set screen shows up with only the OK button.
- **Daily grind** based on your previous selection, the app will give you a deck of cards to go through each day. each card has
    a title as the question (i.e. How much water did {cat-name} drink today?)
    an illustration of what the question about (i.e. a glass of water cartoon style)
    responds space: depending on the question type, it could be a 3 column dials for water volumn formatted like 10 1/8 ML, or a slider with 5 snapping points to indicate the cat's poop consistency from hard & dry to Watery Diarrhea or playtime activeness from very lazy to super energetic, or simply a yes or no question for if the cat had their teeth brushed today.
    Once a while, based on the longer recurring tasks cycle, additional cards on top of daily grind cards might appear. These questions will likely ask about whether this longer recurring window activity has been done today or on a specific date recently in the past. An example for these cards can be "Has {cat-name} had their nails clipped this month?", etc.

All of these daily grind cards come with a skip button to skip and submit button to confirm you reporting. Once the daily cards have been cleared, the user is presented the Daily tasks completed screen, and a day streak is recorded.
- **Reminders**: local notifications to maintain streaks.
# Quickstart: Multilingual UI (i18n with Automatic Detection)

**Branch**: `004-i18n-multilanguage-support` | **Date**: 2026-06-11

## Setup

Same as feature 001 — see
[001 quickstart](../001-medical-appointments-calendar/quickstart.md) for install/run/test
commands.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validating the User Stories

### US1 — Automatic language detection on first visit

1. Clear `localStorage` for the site (or open a fresh private/incognito window).
2. In your browser settings, set the preferred language to Spanish, then load the app —
   verify all visible text (top bar, tabs, calendar, buttons) is in Spanish.
3. Repeat with the browser language set to Portuguese — verify all text is in Portuguese.
4. Repeat with the browser language set to a language other than English/Spanish/Portuguese
   (e.g. French) — verify all text is in English (default fallback).

### US2 — Manual language switching

1. With the app open, locate the language switcher in the top bar.
2. Select each of "English" / "Español" / "Português" in turn — verify all visible text
   updates immediately, with no page reload (URL/tab state unchanged).
3. Open the appointment form (click "Add" on any day) and type into a field, then switch
   the language — verify the field labels update but the entered value is preserved.
4. Reload the page — verify the app loads in the language you last selected, even though
   it may differ from the browser's language.

### US3 — Fully translated experience across all screens

1. Switch to Spanish. Visit: Calendar view, Day view (via the tabs), open the
   appointment form (Add), open an existing appointment's detail view, go to
   `/settings` and view the Appointment Type Manager and Schedule Configuration
   sections.
2. Confirm every label, button, heading, and helper text is in Spanish.
3. Trigger a validation error (e.g., submit the appointment form with required fields
   empty) — verify the error message is in Spanish.
4. Repeat steps 1-3 for Portuguese.

### US4 — Localized dates and times

1. Switch to Spanish — verify the Calendar header and weekday labels show Spanish month
   and day names (e.g., "junio", "lunes") with locale-appropriate formatting.
2. Switch to Portuguese — verify Portuguese month/day names (e.g., "junho", "segunda-feira").
3. Switch to English — verify English month/day names are unchanged from before this
   feature.

## Adding/Updating Translations

1. All translation keys live in `src/i18n/translations/{en,es,pt}.ts`.
2. `en.ts` is the source of truth — add new keys there first.
3. Add the same key path to `es.ts` and `pt.ts`. TypeScript will report a compile error
   (`error TS2741`/`TS2739`) if a key is missing in `es.ts`/`pt.ts`, since both are typed
   against the `Translations` shape derived from `en.ts`.
4. Run `npm run lint` and `npm test` to confirm type-checking and unit tests pass.

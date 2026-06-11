# UI Contracts: Multilingual UI (i18n with Automatic Detection)

**Branch**: `004-i18n-multilanguage-support` | **Date**: 2026-06-11

This document describes new modules/components introduced by this feature and how
existing components are extended. Contracts not mentioned here are unchanged.

---

## Module: `src/i18n/locale.ts` (NEW)

Shared types and constants.

```typescript
export type Locale = "en" | "es" | "pt";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "es", "pt"];
export const DEFAULT_LOCALE: Locale = "en";

/** Maps a BCP-47 tag (e.g. "es-AR", "pt-BR", "en-US", "fr") to a supported Locale,
 *  falling back to DEFAULT_LOCALE for unsupported base languages. */
export function resolveLocale(tag: string): Locale;

/** Reads navigator.languages / navigator.language and returns the first supported
 *  Locale, or DEFAULT_LOCALE if none match. Returns DEFAULT_LOCALE in non-browser
 *  environments (SSR). */
export function detectBrowserLocale(): Locale;
```

---

## Module: `src/i18n/translations/{en,es,pt}.ts` (NEW)

Each file exports a `default` object conforming to the `Translations` type (see
`data-model.md`). `en.ts` is the source of truth; `Translations` is derived from it
via `typeof`. `es.ts` and `pt.ts` are typed as `Translations`, so any missing/extra key
is a TypeScript compile error.

```typescript
// en.ts
const en = {
  common: { save: "Save", cancel: "Cancel", /* ... */ },
  nav: { settings: "Settings" },
  viewTabs: { calendar: "Calendar", day: "Day" },
  // ...calendar, dayView, appointmentForm, appointmentDetail,
  //    appointmentTypeManager, scheduleConfig, settings, validation,
  //    languageSwitcher
} as const;

export type Translations = typeof en;
export default en;
```

---

## Context/Hook: `LocaleContext` / `useLocale` / `useTranslation` (NEW)

**File**: `src/i18n/LocaleContext.tsx`

```typescript
interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function LocaleProvider({ children }: { children: React.ReactNode }): JSX.Element;

/** Returns the current locale and a setter that updates state and persists the
 *  choice to localStorage["medical-appointments.locale"]. */
export function useLocale(): LocaleContextValue;

/** Returns a `t` function bound to the current locale, with English fallback for
 *  missing keys (see data-model.md lookup contract). `key` is a dot-path into
 *  Translations, type-checked against the `en` shape. */
export function useTranslation(): { t: (key: TranslationKey) => string; locale: Locale };
```

**Constraints**:

- `LocaleProvider` wraps `AppointmentProvider` (or vice versa — order doesn't matter,
  the two contexts are independent) in `src/app/layout.tsx`.
- On mount, `LocaleProvider` resolves the initial locale per the `LanguagePreference`
  state-transition rules in `data-model.md` (localStorage → browser detection →
  `DEFAULT_LOCALE`).
- `setLocale` triggers a re-render of all consumers via context — no page reload, no
  route change (FR-006).
- `t()` never throws and never returns `undefined`/the raw key; on a missing
  translation it returns the `en` value (FR-009).

---

## Component: `LanguageSwitcher` (NEW)

**File**: `src/components/LanguageSwitcher/LanguageSwitcher.tsx`

```typescript
// No props — reads/writes locale via useLocale() directly.
export function LanguageSwitcher(): JSX.Element;
```

**Responsibilities**:

- Renders a control (e.g. a `<select>` or three buttons) offering "English" / "Español"
  / "Português", each labeled in its own language (so a user can find their language
  regardless of the current UI language).
- The currently active locale is visually indicated (`aria-current="true"` /
  `selected`).
- Selecting a different language calls `setLocale(newLocale)`.
- Reachable in 1 interaction from the main screen (`src/app/page.tsx` top bar) and from
  `src/app/settings/page.tsx`.

---

## Existing components: extended with `useTranslation()`

All components listed below replace hardcoded English strings with `t("namespace.key")`
calls via `useTranslation()`. Props/exports are otherwise unchanged unless noted.

- `src/app/page.tsx`, `src/app/settings/page.tsx` — page chrome, settings link.
- `src/components/ViewTabs/ViewTabs.tsx` — tab labels (`viewTabs.calendar`, `viewTabs.day`).
- `src/components/Calendar/Calendar.tsx`, `CalendarDay.tsx`, `CalendarHeader.tsx` —
  weekday headers, "Today" button, empty/unavailable states.
- `src/components/DayView/DayView.tsx` — day navigation, slot labels, empty-slot text.
- `src/components/AppointmentForm/AppointmentForm.tsx` — field labels, placeholders,
  buttons, validation messages (via `validation.*` namespace).
- `src/components/AppointmentDetail/AppointmentDetail.tsx` — detail labels, delete
  confirmation dialogs/buttons.
- `src/components/AppointmentTypeManager/AppointmentTypeManager.tsx` — list/management
  labels and actions.
- `src/components/ScheduleConfig/ScheduleConfig.tsx` — working days, hours, slot
  interval labels.

---

## Module: `src/utils/dateUtils.ts` (EXTENDED)

Existing exported functions gain a `locale: Locale` parameter (appended, after existing
params) used to build the BCP-47 tag passed to `Intl`/`toLocaleDateString`:

```typescript
// Before: formatMonthLabel(year: number, month: number): string
// After:
export function formatMonthLabel(year: number, month: number, locale: Locale): string;

// Same pattern applied to any other exported formatter that currently
// hardcodes "en-US".
```

Locale → BCP-47 tag mapping used internally: `en` → `"en-US"`, `es` → `"es-ES"`,
`pt` → `"pt-PT"` (per research.md §5 — single variant per language for v1).

**Constraints**: All call sites of these formatters (in `Calendar`, `CalendarDay`,
`CalendarHeader`, `DayView`) pass `locale` from `useLocale()`.

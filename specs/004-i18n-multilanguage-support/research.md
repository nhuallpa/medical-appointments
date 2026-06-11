# Phase 0 Research: Multilingual UI (i18n with Automatic Detection)

## 1. i18n approach: custom lightweight Context vs. library (next-intl / react-i18next)

**Decision**: Build a small custom i18n layer (`LocaleContext` + `useTranslation` hook +
plain TypeScript dictionaries), following the same Context/hook pattern already used by
`AppointmentContext` / `useAppointments`.

**Rationale**:

- The app is a single-route, fully client-rendered SPA (`"use client"` everywhere, no
  server components rely on locale). `next-intl`'s primary integration model for the App
  Router is locale-prefixed routing (`/en/...`, `/es/...`, `/pt/...`), which would
  restructure routing and conflict with FR-006/FR-011 (switch language in place, no
  reload, preserve current tab/date/dialog state).
- `react-i18next` + `i18next-browser-languagedetector` would satisfy the requirements but
  adds ~3 new dependencies for functionality (key lookup, browser detection, localStorage
  persistence, fallback) that is straightforward to implement directly in ~150 lines,
  consistent with the project's "no new persistence/runtime beyond what's needed" MVP
  philosophy (only `firebase`, `next`, `react`, `react-dom` are runtime deps today).
- A custom Context mirrors the existing `AppointmentProvider` pattern, is trivial to unit
  test with Vitest + React Testing Library (existing test setup), and gives full control
  over the exact fallback chain required by FR-003/FR-004/FR-009 (selected locale →
  English fallback for missing keys).

**Alternatives considered**:

- *next-intl*: Best-in-class for App Router with server components and SEO-friendly
  locale routing, but routing-based locale switching means a navigation/reload and URL
  restructuring not needed by this single-page app — rejected as over-engineered for
  this MVP.
- *react-i18next*: Mature, handles pluralization/interpolation/detection out of the box.
  Rejected for now to avoid new dependencies for behavior that's simple to implement
  directly; can be revisited if translation needs grow (e.g., pluralization rules across
  3 languages become complex).

## 2. Language detection

**Decision**: On first load (client-side, inside `LocaleProvider`), read
`navigator.languages` (falling back to `navigator.language`), take the first entry, and
map its base language (`split("-")[0]`) to `"es" | "en" | "pt"`. Anything else (e.g.
`fr`, `de`) → `"en"`.

**Rationale**: `navigator.languages`/`navigator.language` is the standard, dependency-free
way to read browser language preference (matches FR-001's "browser/OS settings" and the
Assumption that detection is not IP-based). Reading the ordered `navigator.languages`
list (when available) handles users whose top preference has no UI translation but whose
second preference does — though for v1 only the first entry's base language is used,
keeping the logic simple and predictable per FR-003/FR-004.

**Alternatives considered**: `Accept-Language` header via a server component / middleware
— rejected because it requires a server round-trip and doesn't fit a fully client-rendered
SPA where the initial HTML is locale-agnostic (`<html lang="en">` static shell).

## 3. Persistence of manual language choice

**Decision**: Store the manually selected locale in `localStorage` under a single key
(`"medical-appointments.locale"`). On mount, `LocaleProvider` checks this key first; if
present and valid, it wins over auto-detection (FR-007). If absent, auto-detection
(§2) runs.

**Rationale**: `localStorage` is the simplest per-browser persistence mechanism, requires
no new dependency, and is consistent with the constitution's "browser session only, no
backend" MVP storage principle (this is read on init, not part of `AppointmentContext`'s
in-memory reducer state).

**Alternatives considered**: Cookies (would only matter for SSR-rendered locale, not
needed here); storing in `AppointmentContext` reducer state (rejected — that state is
intentionally in-memory/non-persistent and reset on reload, which would break FR-007/SC-005).

## 4. Translation file structure & key naming

**Decision**: One TypeScript module per language under `src/i18n/translations/`
(`en.ts`, `es.ts`, `pt.ts`), each exporting a `Translations` object with the same nested
shape, namespaced by feature area: `common`, `nav`, `viewTabs`, `calendar`, `dayView`,
`appointmentForm`, `appointmentDetail`, `appointmentTypeManager`, `scheduleConfig`,
`settings`, `validation`. A shared `Translations` TypeScript type (derived from `en.ts`)
is used so `es.ts`/`pt.ts` are type-checked for missing/extra keys at compile time.

**Rationale**: TypeScript modules (vs. JSON) give compile-time guarantees that all three
languages implement the same key shape — directly supporting SC-003 ("no untranslated or
mixed-language text") and FR-009's fallback contract (a key always exists in `en`, so the
fallback is type-safe). Namespacing by feature area keeps each file's section aligned with
an existing component, making it easy for future features to extend their own namespace.

**Alternatives considered**: Flat key strings (e.g., `"calendar.header.today"`) with JSON
files — rejected; loses compile-time exhaustiveness checking and requires a runtime key
existence check for every lookup.

## 5. Locale-aware date/weekday/month formatting

**Decision**: Extend `src/utils/dateUtils.ts` formatting functions (`formatMonthLabel`,
day/weekday formatters) to accept a `locale` parameter (`"en" | "es" | "pt"`), mapped to
BCP-47 locale tags (`en-US`, `es-ES`, `pt-PT`) and passed to the existing
`Intl`/`toLocaleDateString` calls already in use. The active locale comes from
`useLocale()`.

**Rationale**: `Intl.DateTimeFormat`/`toLocaleDateString` already provide correct
month/weekday names and ordering for `es`/`pt`/`en` with zero additional dependencies —
this directly satisfies FR-010 and User Story 4 by changing only the locale tag passed
to APIs already in use.

**Alternatives considered**: A hand-written table of month/weekday names per language —
rejected as duplicate of what `Intl` already provides correctly.

## 6. Language switcher placement & UI

**Decision**: A new `LanguageSwitcher` component (3-option control: EN / ES / PT) is
placed in the existing top bar (`src/app/page.tsx`'s `.topBar`, alongside the Settings
link) and also added to the Settings page header, so it is reachable in ≤1 interaction
from both screens (satisfies FR-005's "≤2 interactions" with margin).

**Rationale**: The top bar is already a persistent, always-visible chrome element present
on the main screen; adding the switcher there requires no new layout regions. Adding it to
Settings as well covers the case where a user lands directly on `/settings`.

## 7. Handling longer translated strings (layout)

**Decision**: No structural redesign; review each translated screen in ES/PT during
implementation and adjust CSS (`white-space`, `min-width`, flex-wrap) only where a
specific label visibly overflows, rather than pre-emptively redesigning all components.

**Rationale**: Most existing labels/buttons in this app are short (1-3 words) and sit in
flexible (flexbox/grid) containers already; a blanket redesign is unnecessary
over-engineering. Spot-fixes during implementation/testing of User Story 3 are
sufficient and verifiable via the Playwright integration suite.

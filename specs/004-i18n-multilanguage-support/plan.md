# Implementation Plan: Multilingual UI (i18n with Automatic Detection)

**Branch**: `004-i18n-multilanguage-support` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-i18n-multilanguage-support/spec.md`

## Summary

Add a client-side internationalization layer supporting English, Spanish, and Portuguese.
On first load, the UI language is auto-detected from the browser (`navigator.languages`),
falling back to English for unsupported languages. A new `LanguageSwitcher` component lets
users override this at any time; the choice persists in `localStorage` and takes
precedence over auto-detection on future visits. All existing components are updated to
read text from per-locale translation dictionaries via a new `useTranslation()` hook
instead of hardcoded English strings, and date/weekday/month formatting in
`dateUtils.ts` becomes locale-aware via `Intl`. The implementation is a new lightweight
`LocaleContext` (mirroring the existing `AppointmentContext` pattern) — no new runtime
dependencies, no routing changes, no backend.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 16 (App Router), React 19 — no new runtime
dependencies (custom Context-based i18n, see [research.md](./research.md) §1)

**Storage**: `localStorage` for the persisted manual language choice
(`medical-appointments.locale`); translation dictionaries are static TypeScript modules
bundled with the app. No changes to `AppointmentContext`'s in-memory appointment data.

**Testing**: Vitest + React Testing Library (unit tests for `LocaleContext`,
`useTranslation`, `LanguageSwitcher`, `detectBrowserLocale`/`resolveLocale`, and
locale-aware `dateUtils`); existing Playwright integration suite extended with specs for
language detection and switching across key screens

**Target Platform**: Web browser (modern: Chrome, Firefox, Safari, Edge)

**Project Type**: Frontend web application (no backend) — same project as features 001/003

**Performance Goals**: Language switch reflected across the visible UI in under 1 second
(per SC-004) — trivially met since it's a synchronous context update + re-render with no
network/IO

**Constraints**: No new runtime dependencies; no URL/routing changes; no full page reload
on language switch; current app state (tab, date, open dialog, in-progress form input)
must survive a language switch (FR-011)

**Scale/Scope**: Translate all existing screens/components (12 `.tsx` files across
`src/app` and `src/components`) into 3 languages; ~10-12 translation namespaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. MVP Architecture | Frontend + in-memory only — no backend, no DB | ✅ PASS — `localStorage` for one persisted preference value is consistent with prior features (browser-only persistence), translation data is static bundled code, not external storage |
| II. Testing Discipline | Unit tests AND integration tests required for all features | ✅ PASS — unit tests for `LocaleContext`/`useTranslation`/detection/dateUtils; integration specs for detection + switching flows across screens |
| III. UI/UX Standards | Max 2 interactions for calendar nav; actions discoverable | ✅ PASS — language switcher reachable in 1 interaction from main screen and Settings (FR-005); switching preserves nav state |
| IV. Code Standards | English throughout (code/identifiers/docs); user-facing translated text is the feature's purpose | ✅ PASS — all new modules/identifiers/comments in English (FR-012); only translation dictionary *values* are in es/pt |

All gates pass. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/004-i18n-multilanguage-support/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── ui-contracts.md   # Phase 1 output — new i18n modules + extended components
└── tasks.md              # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                     # MODIFIED: wraps children in LocaleProvider
│   ├── page.tsx                       # MODIFIED: useTranslation() for top bar/labels,
│   │                                   #           renders LanguageSwitcher
│   └── settings/
│       └── page.tsx                   # MODIFIED: useTranslation(), renders LanguageSwitcher
├── i18n/                               # NEW
│   ├── locale.ts                      # Locale type, SUPPORTED_LOCALES, DEFAULT_LOCALE,
│   │                                   # resolveLocale(), detectBrowserLocale()
│   ├── LocaleContext.tsx              # LocaleProvider, useLocale, useTranslation
│   └── translations/
│       ├── en.ts                      # source-of-truth dictionary (Translations type)
│       ├── es.ts
│       └── pt.ts
├── components/
│   ├── LanguageSwitcher/              # NEW
│   │   ├── LanguageSwitcher.tsx
│   │   └── LanguageSwitcher.module.css
│   ├── ViewTabs/ViewTabs.tsx          # MODIFIED: useTranslation()
│   ├── Calendar/
│   │   ├── Calendar.tsx               # MODIFIED: useTranslation(), passes locale to dateUtils
│   │   ├── CalendarDay.tsx            # MODIFIED: useTranslation()
│   │   └── CalendarHeader.tsx         # MODIFIED: useTranslation(), passes locale to dateUtils
│   ├── DayView/DayView.tsx            # MODIFIED: useTranslation(), passes locale to dateUtils
│   ├── AppointmentForm/AppointmentForm.tsx        # MODIFIED: useTranslation() for labels + validation
│   ├── AppointmentDetail/AppointmentDetail.tsx    # MODIFIED: useTranslation()
│   ├── AppointmentTypeManager/AppointmentTypeManager.tsx # MODIFIED: useTranslation()
│   └── ScheduleConfig/ScheduleConfig.tsx          # MODIFIED: useTranslation()
└── utils/
    └── dateUtils.ts                   # MODIFIED: formatters accept `locale: Locale` param,
                                        #           map to BCP-47 tags for Intl
```

**Structure Decision**: Additive `src/i18n/` module (types, context/hooks, translation
dictionaries) plus a new `LanguageSwitcher` component, following the existing
`src/context/` + `src/components/<Name>/<Name>.tsx` + `.module.css` conventions. All
other listed files are modified in place to consume `useTranslation()`/`useLocale()` —
no files are removed or relocated.

## Complexity Tracking

*No violations — section intentionally empty.*

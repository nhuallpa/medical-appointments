# Tasks: Multilingual UI (i18n with Automatic Detection)

**Input**: Design documents from `specs/004-i18n-multilanguage-support/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md, quickstart.md

**Tests**: Required per the project constitution (Testing Discipline). Unit tests use
Vitest + React Testing Library under `tests/unit/`; integration tests use Playwright
under `tests/integration/`.

**Organization**: Tasks are grouped by user story (US1-US4, matching spec.md priorities
P1, P1, P2, P3) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4)

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Create `src/i18n/locale.ts` with `Locale` type, `SUPPORTED_LOCALES`,
  `DEFAULT_LOCALE`, `resolveLocale(tag)`, and `detectBrowserLocale()` per
  `contracts/ui-contracts.md`
- [ ] T002 [P] Add unit tests for `resolveLocale()` and `detectBrowserLocale()`
  (including regional variants `es-AR`, `pt-BR`, `en-GB`, and unsupported `fr`) in
  `tests/unit/i18n/locale.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: i18n infrastructure that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create `src/i18n/translations/en.ts` exporting the source-of-truth
  `Translations` dictionary (namespaces: `common`, `nav`, `viewTabs`, `calendar`,
  `dayView`, `appointmentForm`, `appointmentDetail`, `appointmentTypeManager`,
  `scheduleConfig`, `settings`, `validation`, `languageSwitcher` per
  `data-model.md`), populated by extracting every current hardcoded English string
  from `src/app/page.tsx`, `src/app/settings/page.tsx`, and all `src/components/**/*.tsx`
- [ ] T004 [P] Create `src/i18n/translations/es.ts` with Spanish translations for every
  key in `en.ts`, typed as `Translations` (compile error on missing/extra keys)
- [ ] T005 [P] Create `src/i18n/translations/pt.ts` with Portuguese translations for
  every key in `en.ts`, typed as `Translations` (compile error on missing/extra keys)
- [ ] T006 Create `src/i18n/LocaleContext.tsx` implementing `LocaleProvider`,
  `useLocale()`, and `useTranslation()` per `contracts/ui-contracts.md` and the
  `LanguagePreference` state-transition rules in `data-model.md` (localStorage key
  `medical-appointments.locale`, detection on mount, English fallback for missing keys)
- [ ] T007 [P] Add unit tests for `LocaleProvider`/`useLocale`/`useTranslation` covering
  detection-on-mount, localStorage override, manual `setLocale` persistence, and
  fallback-to-English for a missing key, in `tests/unit/i18n/LocaleContext.test.tsx`
- [ ] T008 Wrap `<AppointmentProvider>` with `<LocaleProvider>` in `src/app/layout.tsx`
- [ ] T009 Extend `src/utils/dateUtils.ts` exported formatters (`formatMonthLabel` and
  any other function currently hardcoding `"en-US"`) to accept a trailing
  `locale: Locale` parameter, mapping `en`→`en-US`, `es`→`es-ES`, `pt`→`pt-PT` for
  `Intl`/`toLocaleDateString` calls
- [ ] T010 [P] Update `tests/unit/utils/dateUtils.test.ts` for the new `locale`
  parameter: existing English assertions pass `"en"`, plus new cases for `"es"` and
  `"pt"` month/weekday names

**Checkpoint**: i18n infrastructure (types, dictionaries, context/hooks, locale-aware
date formatting) is ready. No UI changes are visible yet.

---

## Phase 3: User Story 1 - Automatic language detection on first visit (Priority: P1) 🎯 MVP

**Goal**: On first load, the main Calendar screen (top bar, tabs, calendar grid) renders
in the browser's language (es/en/pt), or English if unsupported.

**Independent Test**: Open the app in a fresh session with the browser language set to
Spanish, then Portuguese, then an unsupported language (e.g. French), and confirm the
top bar, view tabs, and calendar grid render in Spanish, Portuguese, and English
respectively.

### Tests for User Story 1

- [ ] T011 [P] [US1] Integration test in `tests/integration/i18n-auto-detect.spec.ts`:
  using Playwright's `locale` context option, load the app with `es-AR`, `pt-BR`, and
  `fr-FR` browser locales and assert the top bar, tabs, and calendar header render in
  Spanish, Portuguese, and English (default) respectively

### Implementation for User Story 1

- [ ] T012 [US1] Replace hardcoded strings in `src/app/page.tsx` (top bar / settings
  link) with `useTranslation()` lookups (`nav.*`)
- [ ] T013 [US1] Replace hardcoded tab labels in `src/components/ViewTabs/ViewTabs.tsx`
  with `useTranslation()` lookups (`viewTabs.*`)
- [ ] T014 [P] [US1] Replace hardcoded strings in `src/components/Calendar/Calendar.tsx`
  with `useTranslation()` lookups (`calendar.*`)
- [ ] T015 [P] [US1] Replace hardcoded strings in
  `src/components/Calendar/CalendarDay.tsx` with `useTranslation()` lookups
  (`calendar.*`)
- [ ] T016 [P] [US1] Replace hardcoded strings (e.g. "Today", aria-labels) in
  `src/components/Calendar/CalendarHeader.tsx` with `useTranslation()` lookups
  (`calendar.*`)

**Checkpoint**: Default Calendar screen renders fully in the browser-detected language
(or English fallback). User Story 1 is independently testable and demoable.

---

## Phase 4: User Story 2 - Manual language switching (Priority: P1)

**Goal**: A visible language switcher lets users change language at any time; the
choice persists across reloads and overrides auto-detection; in-progress UI state and
form input survive a switch.

**Independent Test**: Use the language switcher to cycle through English/Español/
Português, confirming immediate UI updates with no reload; reload the page and confirm
the chosen language persists; open the appointment form, type a value, switch language,
and confirm the value is preserved.

### Tests for User Story 2

- [ ] T017 [P] [US2] Unit tests for `LanguageSwitcher` in
  `tests/unit/components/LanguageSwitcher.test.tsx`: renders all three language
  options, marks the active locale, and calls `setLocale` on selection
- [ ] T018 [P] [US2] Integration test in `tests/integration/i18n-language-switch.spec.ts`:
  switch language via the switcher, assert immediate UI text change with no navigation;
  reload and assert the chosen language persists; open the appointment form, enter text,
  switch language, and assert the entered text remains

### Implementation for User Story 2

- [ ] T019 [US2] Create `src/components/LanguageSwitcher/LanguageSwitcher.tsx` and
  `LanguageSwitcher.module.css` per `contracts/ui-contracts.md` (options labeled
  "English" / "Español" / "Português", active locale indicated, calls `useLocale().setLocale`)
- [ ] T020 [US2] Render `<LanguageSwitcher />` in the top bar of `src/app/page.tsx`
- [ ] T021 [P] [US2] Render `<LanguageSwitcher />` in `src/app/settings/page.tsx`

**Checkpoint**: Users can detect (US1) and manually override (US2) the UI language on
the main screen — this is the deliverable MVP increment.

---

## Phase 5: User Story 3 - Fully translated experience across all screens (Priority: P2)

**Goal**: Every remaining screen, dialog, and message (day view, appointment form,
appointment detail, appointment type manager, schedule configuration, settings page,
and all validation/success/error messages) is translated in all three languages.

**Independent Test**: Switch to Spanish, then Portuguese, and visit every screen/dialog
listed above, including triggering a validation error on the appointment form,
confirming no leftover English (or mixed-language) text remains.

### Tests for User Story 3

- [ ] T022 [P] [US3] Integration test in `tests/integration/i18n-full-coverage.spec.ts`:
  for `es` and `pt`, navigate to Day view, open the Add Appointment form (assert labels
  and a validation error message are translated), open an appointment's detail view,
  and visit `/settings` (Appointment Type Manager + Schedule Configuration), asserting
  translated text throughout

### Implementation for User Story 3

- [ ] T023 [P] [US3] Replace hardcoded strings in `src/components/DayView/DayView.tsx`
  with `useTranslation()` lookups (`dayView.*`)
- [ ] T024 [P] [US3] Replace hardcoded strings, labels, and validation messages in
  `src/components/AppointmentForm/AppointmentForm.tsx` with `useTranslation()` lookups
  (`appointmentForm.*`, `validation.*`)
- [ ] T025 [P] [US3] Replace hardcoded strings in
  `src/components/AppointmentDetail/AppointmentDetail.tsx` with `useTranslation()`
  lookups (`appointmentDetail.*`)
- [ ] T026 [P] [US3] Replace hardcoded strings in
  `src/components/AppointmentTypeManager/AppointmentTypeManager.tsx` with
  `useTranslation()` lookups (`appointmentTypeManager.*`)
- [ ] T027 [P] [US3] Replace hardcoded strings in
  `src/components/ScheduleConfig/ScheduleConfig.tsx` with `useTranslation()` lookups
  (`scheduleConfig.*`)
- [ ] T028 [US3] Replace hardcoded page chrome/headings in
  `src/app/settings/page.tsx` with `useTranslation()` lookups (`settings.*`)
- [ ] T029 [US3] Update existing component unit tests touched by T023-T028
  (`tests/unit/components/AppointmentDetail.test.tsx`,
  `tests/unit/components/AppointmentForm.test.tsx`,
  `tests/unit/components/AppointmentTypeManager.test.tsx`,
  `tests/unit/components/DayView.test.tsx`,
  `tests/unit/components/ScheduleConfig.test.tsx`) to render within `LocaleProvider`
  and assert against translated (English-default) text

**Checkpoint**: 100% of screens/messages are translated in all three languages
(SC-003).

---

## Phase 6: User Story 4 - Localized dates and times (Priority: P3)

**Goal**: Calendar header, calendar day labels, and day view dates show month/weekday
names and date ordering per the selected language's conventions.

**Independent Test**: Switch between English, Spanish, and Portuguese and confirm the
Calendar header's month/year label and the Day view's date heading use that language's
month/weekday names (e.g. "junio" / "junho" / "June").

### Tests for User Story 4

- [ ] T030 [P] [US4] Integration test in `tests/integration/i18n-date-formatting.spec.ts`:
  for each of `en`, `es`, `pt`, switch language and assert the Calendar header and Day
  view date heading show the expected localized month/weekday name

### Implementation for User Story 4

- [ ] T031 [US4] Pass `locale` from `useLocale()` into `formatMonthLabel(...)` (and any
  other date formatter) in `src/components/Calendar/CalendarHeader.tsx`
- [ ] T032 [P] [US4] Pass `locale` from `useLocale()` into date formatters used in
  `src/components/Calendar/Calendar.tsx` and `src/components/Calendar/CalendarDay.tsx`
- [ ] T033 [P] [US4] Pass `locale` from `useLocale()` into date formatters used in
  `src/components/DayView/DayView.tsx`

**Checkpoint**: All user stories (US1-US4) are independently functional — full feature
complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T034 Run `npm run lint` and fix any TypeScript errors arising from
  `Translations`-typed dictionaries or new modules
- [ ] T035 [P] Run `npm test` (Vitest) and fix any regressions across unit tests
- [ ] T036 Run `npm run test:e2e` (Playwright) and fix regressions across all
  integration specs, including the new `i18n-*.spec.ts` files
- [ ] T037 [P] Visually review each screen in Spanish and Portuguese for layout overflow
  per `research.md` §7, adjusting affected `*.module.css` files only where a label
  visibly overflows or wraps awkwardly
- [ ] T038 Execute the manual validation steps in `quickstart.md` for US1-US4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (uses `Locale` type from T001) — BLOCKS
  all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational (Phase 2) completion
  - US1 (Phase 3) and US2 (Phase 4) together form the MVP and touch mostly disjoint
    files (US1: page/tabs/calendar; US2: new LanguageSwitcher) — can proceed in parallel
    after Phase 2
  - US3 (Phase 5) touches the remaining components, independent of US1/US2 files
  - US4 (Phase 6) only touches date-formatting call sites in files already modified by
    US1/US3 — recommended to run after US1/US3 to avoid merge conflicts in the same
    files, though it is functionally independent
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests are written first and MUST fail before implementation begins
- Implementation tasks marked `[P]` touch different files and can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T001-T002 (locale.ts + its tests):
Task: "Create src/i18n/translations/es.ts with Spanish translations"
Task: "Create src/i18n/translations/pt.ts with Portuguese translations"
# (T003 en.ts must complete first, since es.ts/pt.ts are typed against it)
```

## Parallel Example: User Story 1

```bash
Task: "Replace hardcoded strings in src/components/Calendar/Calendar.tsx with useTranslation()"
Task: "Replace hardcoded strings in src/components/Calendar/CalendarDay.tsx with useTranslation()"
Task: "Replace hardcoded strings in src/components/Calendar/CalendarHeader.tsx with useTranslation()"
```

## Parallel Example: User Story 3

```bash
Task: "Replace hardcoded strings in src/components/DayView/DayView.tsx with useTranslation()"
Task: "Replace hardcoded strings in src/components/AppointmentForm/AppointmentForm.tsx with useTranslation()"
Task: "Replace hardcoded strings in src/components/AppointmentDetail/AppointmentDetail.tsx with useTranslation()"
Task: "Replace hardcoded strings in src/components/AppointmentTypeManager/AppointmentTypeManager.tsx with useTranslation()"
Task: "Replace hardcoded strings in src/components/ScheduleConfig/ScheduleConfig.tsx with useTranslation()"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T010) — **CRITICAL**, blocks everything else
3. Complete Phase 3: User Story 1 (T011-T016)
4. Complete Phase 4: User Story 2 (T017-T021)
5. **STOP and VALIDATE**: Run quickstart US1/US2 steps — auto-detection + manual
   switching work on the main screen
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → infrastructure ready, no visible change
2. US1 + US2 → MVP: detection + manual switch on main screen → validate → demo
3. US3 → full screen/message coverage → validate → demo
4. US4 → localized date formatting → validate → demo
5. Polish (Phase 7) → lint/tests/layout review/full quickstart pass

---

## Notes

- `[P]` tasks touch different files and have no unmet dependencies
- `[Story]` labels map tasks to spec.md user stories (US1-US4) for traceability
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently before continuing

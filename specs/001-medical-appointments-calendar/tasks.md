# Tasks: Appointment Types, Repeatable Appointments & Schedule Configuration

**Feature increment**: Repeatable appointments, appointment types, and schedule availability configuration
**Built on top of**: Completed MVP (US1–US4 — view, navigate, add, delete appointments)
**Input**: Design documents from `specs/001-medical-appointments-calendar/`

**Testing**: Unit tests (Vitest + RTL) and integration tests (Playwright) are REQUIRED per the Testing Discipline principle of the project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths are included in every task description

---

## New Entities (reference while implementing)

```typescript
// Appointment type: defines whether a type is individual or repeatable
interface AppointmentType {
  id: string;
  name: string;           // e.g. "Dental", "Rehabilitation"
  repeatable: boolean;    // false = individual, true = can be a series
  maxSessions: number;    // 1 for individual; up to N for repeatable
  color?: string;         // Hex color for calendar display (optional)
}

// Schedule configuration: which days/hours are available for consultations
interface ScheduleConfig {
  enabledDays: number[];  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startTime: string;      // "HH:MM" — consultation start time
  endTime: string;        // "HH:MM" — consultation end time
}

// Extended Appointment (adds typeId and optional series fields)
interface Appointment {
  id: string;
  patientName: string;
  professionalName: string;
  date: string;
  time: string;
  typeId: string;          // Reference to AppointmentType.id
  seriesId?: string;       // UUID shared by all appointments in a series
  seriesIndex?: number;    // 1-based position within the series
  notes?: string;
  createdAt: string;
}

// Extended form data
interface AppointmentFormData {
  patientName: string;
  professionalName: string;
  date: string;           // First date of the series (or only date for individual)
  time: string;
  typeId: string;
  sessions: number;       // 1 for individual; 1–maxSessions for repeatable types
  notes?: string;
}
```

---

## Phase 1: Foundational Extensions (Blocking Prerequisites)

**Purpose**: Extend the data model, reducer, and utilities to support the new entities before any UI work begins.

**⚠️ CRITICAL**: All user story phases depend on this foundation.

- [X] T001 Extend TypeScript interfaces in src/types/appointment.ts: add `AppointmentType`, `ScheduleConfig`, update `Appointment` (add `typeId`, `seriesId?`, `seriesIndex?`), update `AppointmentFormData` (add `typeId`, `sessions`), update `AppointmentState` (add `appointmentTypes: AppointmentType[]`, `scheduleConfig: ScheduleConfig`), add new `AppointmentAction` variants (`ADD_APPOINTMENT_TYPE`, `DELETE_APPOINTMENT_TYPE`, `UPDATE_SCHEDULE_CONFIG`, `ADD_APPOINTMENT_SERIES`)
- [X] T002 [P] Implement `scheduleUtils.ts` with pure functions: `generateSeriesDates(startDate, sessions, enabledDays)` → `string[]` (consecutive enabled-day dates starting from startDate), `isDateEnabled(dateKey, enabledDays)` → `boolean`, `isTimeInRange(time, startTime, endTime)` → `boolean`, `getDefaultSchedule()` → `ScheduleConfig` (Mon–Fri, 08:00–18:00) in src/utils/scheduleUtils.ts
- [X] T003 [P] Write unit tests for all scheduleUtils functions including edge cases (series crossing month boundaries, weekend skipping, time boundary checks) in tests/unit/utils/scheduleUtils.test.ts
- [X] T004 Extend `AppointmentContext` reducer in src/context/AppointmentContext.tsx: add default `appointmentTypes` (seed "Dental"=individual and "Rehabilitation"=repeatable/10sessions), add default `scheduleConfig` (Mon–Fri, 08:00–18:00), implement `ADD_APPOINTMENT_TYPE`, `DELETE_APPOINTMENT_TYPE`, `UPDATE_SCHEDULE_CONFIG`, and `ADD_APPOINTMENT_SERIES` (generates N appointments on consecutive enabled days using `generateSeriesDates`); update `DELETE_APPOINTMENT` to clear `selectedAppointment` when any appointment in the same series is selected; add `DELETE_SERIES` action that removes all appointments sharing a `seriesId`
- [X] T005 Extend `useAppointments` hook in src/hooks/useAppointments.ts: add `appointmentTypes`, `scheduleConfig`, `addAppointmentType`, `deleteAppointmentType`, `updateScheduleConfig`, `addAppointmentSeries`, `deleteSeries` to the hook's return type and implementation

**Checkpoint**: Types compile, reducer handles all new actions, scheduleUtils tests pass.

---

## Phase 2: User Story 1 — Appointment Types (Priority: P1) 🎯 MVP

**Goal**: Users can define appointment types (individual vs repeatable with max sessions). The appointment form shows a type selector, and when a repeatable type is selected the sessions count input appears.

**Independent Test**: Open the appointment form → verify a Type dropdown is present with "Dental" and "Rehabilitation" as defaults → select "Rehabilitation" → verify a Sessions input appears (max 10) → select "Dental" → verify Sessions input disappears. Navigate to Settings → create a new type "Physical Therapy" (repeatable, 8 sessions) → verify it appears in the form dropdown.

### Tests for User Story 1 ⚠️

- [X] T006 [P] [US1] Write unit tests for AppointmentTypeManager: renders existing types, add-type form validation, delete action in tests/unit/components/AppointmentTypeManager.test.tsx
- [X] T007 [P] [US1] Write unit tests for updated AppointmentForm: type selector renders, sessions field appears/hides based on type, form submission includes typeId and sessions in tests/unit/components/AppointmentForm.test.tsx (update existing file)

### Implementation for User Story 1

- [X] T008 [US1] Implement `AppointmentTypeManager` component: list all types with name, individual/repeatable badge, maxSessions, and delete button; inline add-type form with name input, repeatable toggle, max sessions input (visible when repeatable=true) in src/components/AppointmentTypeManager/AppointmentTypeManager.tsx and src/components/AppointmentTypeManager/AppointmentTypeManager.module.css
- [X] T009 [US1] Update `AppointmentForm` to add a Type `<select>` field (required, maps to `typeId`), conditionally render Sessions `<input type="number">` when the selected type has `repeatable=true` (min=1, max=type.maxSessions, default=type.maxSessions), and include `typeId` and `sessions` in the submitted `AppointmentFormData` in src/components/AppointmentForm/AppointmentForm.tsx
- [X] T010 [US1] Show the appointment type name as a badge on each appointment item in CalendarDay and in the AppointmentDetail view in src/components/Calendar/CalendarDay.tsx and src/components/AppointmentDetail/AppointmentDetail.tsx
- [X] T011 [US1] Add Firebase Analytics event `appointment_type_created` in src/lib/analytics.ts and call it from AppointmentTypeManager; log operations via `createLogger("AppointmentTypeManager")` from src/utils/logger.ts

**Checkpoint**: Appointment form shows Type selector with default types. Sessions field appears for repeatable types. New types can be added and deleted from the AppointmentTypeManager.

---

## Phase 3: User Story 2 — Schedule Configuration (Priority: P2)

**Goal**: Users can configure which days of the week and which time window are enabled for consultations. The form warns when an appointment is scheduled outside the configured availability.

**Independent Test**: Open Settings → Days of Week: uncheck Saturday and Sunday → Time Range: set 09:00–17:00 → Save → Go back to calendar → Add appointment on a Saturday → verify a visible warning is displayed on the form. Go to a weekday → add appointment at 07:00 → verify warning. Go to weekday, add at 10:00 → verify no warning.

### Tests for User Story 2 ⚠️

- [X] T012 [P] [US2] Write unit tests for ScheduleConfig component: renders day checkboxes, time inputs, calls onSave with correct ScheduleConfig in tests/unit/components/ScheduleConfig.test.tsx
- [X] T013 [P] [US2] Write integration test for the schedule configuration flow (open settings, change days, change times, save, then verify warning in appointment form) in tests/integration/schedule-config.spec.ts

### Implementation for User Story 2

- [X] T014 [US2] Implement `ScheduleConfig` component: 7 day-of-week checkboxes (Sun–Sat labels), start-time and end-time inputs, Save button that calls `onSave(config)`; show current config values as defaults in src/components/ScheduleConfig/ScheduleConfig.tsx and src/components/ScheduleConfig/ScheduleConfig.module.css
- [X] T015 [US2] Create settings page at src/app/settings/page.tsx with two panels: "Appointment Types" (renders `AppointmentTypeManager`) and "Schedule Configuration" (renders `ScheduleConfig` wired to `updateScheduleConfig` from `useAppointments`)
- [X] T016 [US2] Add a "Settings" navigation link/button to the main calendar page in src/app/page.tsx (link to `/settings`)
- [X] T017 [US2] Add a schedule-conflict warning inside `AppointmentForm`: when the selected date falls on a disabled day OR the selected time is outside the configured range, display an inline warning message (non-blocking — user can still save) in src/components/AppointmentForm/AppointmentForm.tsx
- [X] T018 [US2] Add Firebase Analytics event `schedule_config_updated` in src/lib/analytics.ts and call it from the ScheduleConfig component on save; log via `createLogger("ScheduleConfig")`

**Checkpoint**: Settings page accessible. Day/time configuration persists in session. Appointment form shows out-of-schedule warnings.

---

## Phase 4: User Story 3 — Create Repeatable Appointments (Priority: P3)

**Goal**: When creating an appointment with a repeatable type and sessions > 1, the system generates the full series of appointments on consecutive enabled days at the same time. All series appointments appear on the calendar.

**Independent Test**: Select type "Rehabilitation", set sessions=5, pick a Monday date at 10:00. Submit. Verify that 5 appointments appear on the calendar: Monday, Tuesday, Wednesday, Thursday, Friday of that week, all at 10:00 for the same patient and professional. Each shows a series badge indicating its position (e.g. "1/5", "2/5").

### Tests for User Story 3 ⚠️

- [X] T019 [P] [US3] Write integration test for the repeatable appointments flow (select repeatable type, set sessions=3, submit, verify 3 calendar entries on consecutive enabled days) in tests/integration/repeatable-appointments.spec.ts

### Implementation for User Story 3

- [X] T020 [US3] Update `src/app/page.tsx` to call `addAppointmentSeries(data)` when `data.sessions > 1` and the selected type is repeatable, or `addAppointment(data)` when sessions=1; pass `scheduleConfig.enabledDays` as context for date generation
- [X] T021 [US3] Add a series indicator to `CalendarDay` appointment items: show "N/M" badge (e.g. "2/5") when the appointment has a `seriesId` and `seriesIndex`, styled as a small overlay chip in src/components/Calendar/CalendarDay.tsx and src/components/Calendar/CalendarDay.module.css
- [X] T022 [US3] Add Firebase Analytics event `appointment_series_created` with `{ sessions, typeId }` params in src/lib/analytics.ts and call it from page.tsx after successful series submission; log via `createLogger("page")`

**Checkpoint**: Repeatable types generate full series. Series entries visible on calendar with position badges. Individual appointments unaffected.

---

## Phase 5: User Story 4 — Series Management (Priority: P4)

**Goal**: A user can view all appointments in a series from the detail panel, and delete the entire series at once or just the individual appointment.

**Independent Test**: With a 5-session rehabilitation series on the calendar, click one appointment → detail view opens → verify a "Part of series (2/5)" indicator is shown → verify a "Delete Series (5 appointments)" button is present → click it → confirm → verify all 5 appointments are removed from the calendar.

### Tests for User Story 4 ⚠️

- [X] T023 [P] [US4] Write unit tests for updated AppointmentDetail: shows series info, Delete Series button appears for series appointments, calls onDeleteSeries with seriesId in tests/unit/components/AppointmentDetail.test.tsx (update existing file)

### Implementation for User Story 4

- [X] T024 [US4] Update `AppointmentDetail` to show series indicator ("Part of series: N of M sessions") and a "Delete Entire Series" button when `appointment.seriesId` is defined; existing single-delete flow unchanged in src/components/AppointmentDetail/AppointmentDetail.tsx
- [X] T025 [US4] Wire `deleteSeries(seriesId)` from `useAppointments` into the detail view; call `clearSelection()` after series deletion in src/app/page.tsx
- [X] T026 [US4] Add Firebase Analytics event `appointment_series_deleted` in src/lib/analytics.ts and call it from AppointmentDetail on confirmed series deletion; log via `createLogger("AppointmentDetail")`

**Checkpoint**: Series appointments show position. Full-series deletion works. Single appointment deletion from a series still works.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive layout, logging standard enforcement, and code quality for the new components.

- [X] T027 [P] Verify aria-labels on all new interactive elements: day-of-week checkboxes in ScheduleConfig, type selector in AppointmentForm, sessions input, Delete Series button in AppointmentDetail
- [X] T028 [P] Add responsive CSS for the settings page panels for mobile viewports (< 768px) in src/app/settings/page.module.css (create) and src/components/AppointmentTypeManager/AppointmentTypeManager.module.css
- [X] T029 Logging standard sweep: verify all new components use `createLogger` from src/utils/logger.ts and no direct `console.*` calls exist in any new src/ files
- [X] T030 [P] Add a navigation breadcrumb/back link on src/app/settings/page.tsx so users can return to the calendar from the settings page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. **BLOCKS all user story phases.**
- **US1 (Phase 2)**: Depends on Phase 1.
- **US2 (Phase 3)**: Depends on Phase 1 — settings page and ScheduleConfig are independent of US1's UI components.
- **US3 (Phase 4)**: Depends on Phase 1 (series generation in reducer) AND US1 (type selector for sessions input).
- **US4 (Phase 5)**: Depends on Phase 1 (DELETE_SERIES action) AND US3 (series appointments must exist).
- **Polish (Phase 6)**: Depends on all stories complete.

### User Story Dependencies

- **US1 (P1)**: No story-level dependencies — can start after Phase 1.
- **US2 (P2)**: No dependency on US1 — ScheduleConfig is independent. Can work in parallel with US1.
- **US3 (P3)**: Depends on US1 (type with `repeatable=true` drives the sessions field).
- **US4 (P4)**: Depends on US3 (series appointments must exist to test series management).

### Within Each User Story

1. Write tests FIRST — verify they FAIL before writing implementation.
2. Implement components, reducer extensions, and wiring.
3. Add analytics + logging calls.
4. Verify the story's integration test passes.

---

## Parallel Opportunities

### Phase 1 — T002/T003 can run in parallel with T004/T005 after T001:
```
T002  Implement scheduleUtils.ts
T003  Write scheduleUtils tests
                                    (then)
T004  Extend AppointmentContext     ← depends on T001 + T002 (uses scheduleUtils)
T005  Extend useAppointments hook   ← depends on T004
```

### US1 + US2 can run in parallel after Phase 1:
```
Dev A: T006 → T007 → T008 → T009 → T010 → T011  (US1 — Types)
Dev B: T012 → T013 → T014 → T015 → T016 → T017 → T018  (US2 — Schedule)
```

### US3 tests can run in parallel with implementation:
```
T019  Write repeatable integration test  (parallel with T020/T021)
T020  Wire addAppointmentSeries in page
T021  Add series badge to CalendarDay
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Foundational (T001–T005)
2. Complete Phase 2: US1 Appointment Types (T006–T011)
3. **STOP and VALIDATE**: appointment form shows type selector with default types
4. Demo: receptionist can now categorize appointments

### Incremental Delivery

1. Phase 1 → Data model extended, reducer handles new actions
2. Phase 2 (US1) → Type selector in form; settings panel for type management → **MVP+**
3. Phase 3 (US2) → Schedule config; out-of-schedule warnings in form
4. Phase 4 (US3) → Repeatable series generation; series badges on calendar
5. Phase 5 (US4) → Series management (view/delete full series)
6. Phase 6 → Polish

---

## Notes

- All tasks build on top of the already-complete MVP (view calendar, navigate months, add/delete individual appointments).
- `typeId` is required on every new appointment; the default type to pre-select in the form should be the first `AppointmentType` in state (avoids null `typeId` for existing sessions).
- When `DELETE_APPOINTMENT_TYPE` is dispatched for a type that has existing appointments, those appointments retain their `typeId` value but the type name becomes unresolvable — handle gracefully in components (fall back to "Unknown type").
- `generateSeriesDates` must skip dates that fall on disabled days — if a Monday is selected and Mon is enabled, day 1 is Monday, day 2 is Tuesday, etc., skipping any weekends or other disabled days.
- Firebase Analytics events for new actions: `appointment_type_created`, `schedule_config_updated`, `appointment_series_created`, `appointment_series_deleted`.
- The logging utility is already in src/utils/logger.ts — all new components must use `createLogger(moduleName)`.

# Tasks: Medical Appointments Calendar

**Input**: Design documents from `specs/001-medical-appointments-calendar/`

**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ui-contracts.md ✅, research.md ✅, quickstart.md ✅

**Testing**: Unit tests (Vitest + RTL) and integration tests (Playwright) are REQUIRED per the Testing Discipline principle of the project constitution. Tests are NOT optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths are included in every task description

## Path Conventions

All source code lives under `src/` with Next.js App Router at `src/app/`. Tests live at the root `tests/` directory, split into `tests/unit/` (Vitest + RTL) and `tests/integration/` (Playwright).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling configuration, and dependency installation.

- [X] T001 Initialize Next.js 14+ project with TypeScript 5.x (App Router) and install all dependencies listed in plan.md (react, react-dom, next, typescript, firebase) in package.json
- [X] T002 [P] Configure ESLint with TypeScript rules and Prettier formatting in .eslintrc.json and .prettierrc
- [X] T003 [P] Configure Vitest with React Testing Library and jsdom environment in vitest.config.ts and tests/setup.ts
- [X] T004 [P] Configure Playwright for integration tests targeting http://localhost:3000 in playwright.config.ts
- [X] T005 [P] Add global CSS reset and base typography in src/app/globals.css

**Checkpoint**: Dependencies installed, all tooling runnable — `npm run dev`, `npm run test`, `npm run test:e2e` should launch without errors (tests will fail until implemented).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared infrastructure — types, state management, utility functions, logging, and analytics initialization. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: All subsequent phases depend on this foundation being in place.

- [X] T006 Define all TypeScript interfaces (Appointment, AppointmentFormData, AppointmentsByDate, CalendarCell, CalendarGrid, AppointmentState, AppointmentAction union type) in src/types/appointment.ts
- [X] T007 [P] Implement dateUtils pure functions — generateMonthGrid, toDateKey, formatMonthLabel, isToday — in src/utils/dateUtils.ts (no side effects; all independently unit-testable)
- [X] T008 [P] Write unit tests covering all dateUtils functions including edge cases (month boundaries, leap years, today detection) in tests/unit/utils/dateUtils.test.ts
- [X] T009 Implement AppointmentContext with useReducer handling all six actions (ADD_APPOINTMENT, DELETE_APPOINTMENT, SELECT_APPOINTMENT, CLEAR_SELECTION, NAVIGATE_MONTH, GO_TO_TODAY) in src/context/AppointmentContext.tsx
- [X] T010 Implement useAppointments consumer hook exposing state, derived appointmentsByDate, and all operation functions; throw if called outside AppointmentProvider in src/hooks/useAppointments.ts
- [X] T011 [P] Write unit tests for useAppointments hook covering all dispatch actions and derived appointmentsByDate computation in tests/unit/hooks/useAppointments.test.ts
- [X] T012 [P] Implement structured logging utility with info/warn/error/debug levels, a module prefix parameter, and NODE_ENV-aware output suppression in src/utils/logger.ts
- [X] T013 [P] Initialize Firebase Analytics: configure Firebase app with environment variables, export a logEvent wrapper that accepts event name and params, and export named helpers (logPageView, logAppointmentCreated, logAppointmentDeleted, logMonthNavigated) in src/lib/analytics.ts
- [X] T014 Configure root layout wrapping the full component tree with AppointmentProvider and applying globals.css in src/app/layout.tsx

**Checkpoint**: Foundation ready — types compile, dateUtils tests pass, reducer handles all actions, logging and analytics modules export correctly.

---

## Phase 3: User Story 1 — View Monthly Calendar (Priority: P1) 🎯 MVP

**Goal**: A user opens the application and immediately sees a monthly calendar grid showing all appointments on their correct dates.

**Independent Test**: Open the application (with or without pre-seeded appointments). Verify the current month name and year appear in the header, a 7-column day grid is visible with all days of the month in the correct positions, and any appointments appear on their matching date cells.

### Tests for User Story 1 (REQUIRED per constitution) ⚠️

> **Write these tests FIRST — they must FAIL before implementation begins.**

- [X] T015 [P] [US1] Write unit tests for CalendarDay (renders day number, renders appointment list items, renders null cell as empty, calls onAddClick and onAppointmentClick) in tests/unit/components/Calendar.test.tsx
- [X] T016 [P] [US1] Write integration test for the view-calendar scenario (app loads, current month displayed, days visible, appointments on correct dates) in tests/integration/view-calendar.spec.ts

### Implementation for User Story 1

- [X] T017 [US1] Implement CalendarDay component rendering the day number, appointment items (patientName + time), add-click handler, and appointment-click handler; render empty cell when date is null in src/components/Calendar/CalendarDay.tsx and src/components/Calendar/CalendarDay.module.css
- [X] T018 [US1] Implement CalendarHeader component rendering the month/year label and three accessible buttons (prev, next, today) with aria-label attributes per ui-contracts.md in src/components/Calendar/CalendarHeader.tsx and src/components/Calendar/CalendarHeader.module.css
- [X] T019 [US1] Implement Calendar component: call generateMonthGrid from useAppointments state, render CalendarHeader and a 7-column CSS Grid of CalendarDay cells in src/components/Calendar/Calendar.tsx and src/components/Calendar/Calendar.module.css
- [X] T020 [US1] Implement the main page rendering Calendar and wiring add/select/close state with useState for form and detail modal visibility in src/app/page.tsx
- [X] T021 [US1] Fire logPageView() from analytics.ts on calendar mount in src/app/page.tsx; log calendar_view_loaded using logger.ts

**Checkpoint**: US1 fully functional and independently testable — calendar displays, appointments render on correct dates, integration test passes.

---

## Phase 4: User Story 2 — Navigate Between Months (Priority: P2)

**Goal**: A user clicks prev/next to move between months one step at a time, and Today to return to the current month with today's date highlighted.

**Independent Test**: With the current month visible, click next — verify header shows the following month. Click prev — verify the original month is restored. Click Today — verify the current month returns and today's date cell is visually highlighted.

### Tests for User Story 2 (REQUIRED per constitution) ⚠️

- [X] T022 [P] [US2] Write unit tests for CalendarHeader navigation callbacks and for NAVIGATE_MONTH / GO_TO_TODAY reducer actions in tests/unit/components/Calendar.test.tsx
- [X] T023 [P] [US2] Write integration test for navigate-months scenario (next, prev, today, today-highlight) in tests/integration/navigate-months.spec.ts

### Implementation for User Story 2

- [X] T024 [US2] Wire navigateMonth and goToToday from useAppointments into CalendarHeader onPrev, onNext, onToday props using useCallback in src/components/Calendar/Calendar.tsx
- [X] T025 [US2] Add CSS class for today-highlighted day cell (distinct background or border) using isToday prop in src/components/Calendar/CalendarDay.module.css
- [X] T026 [US2] Call logMonthNavigated(direction) from analytics.ts and log navigation action via logger.ts in src/components/Calendar/CalendarHeader.tsx

**Checkpoint**: US1 + US2 both pass their integration tests independently; today's date is visually highlighted after clicking Today.

---

## Phase 5: User Story 3 — Add a Medical Appointment (Priority: P3)

**Goal**: A user clicks a date cell or an Add Appointment button, completes the form, submits, and the new appointment appears on the calendar on the correct date immediately.

**Independent Test**: Click any date cell — form opens with that date pre-filled. Fill patient name, professional name, and time. Submit. Verify the appointment appears on the correct calendar date showing patient name and time. Attempt submit with a missing required field — verify the field is highlighted and the form does not save.

### Tests for User Story 3 (REQUIRED per constitution) ⚠️

- [X] T027 [P] [US3] Write unit tests for AppointmentForm: required field validation errors, pre-filled date, successful onSubmit call, Escape/cancel triggers onCancel in tests/unit/components/AppointmentForm.test.tsx
- [X] T028 [P] [US3] Write integration test for add-appointment scenario (open form via date click, fill fields, submit, verify calendar entry) in tests/integration/add-appointment.spec.ts

### Implementation for User Story 3

- [X] T029 [US3] Implement AppointmentForm modal with all five fields (patientName, professionalName, date, time, notes), per-field error display, focus trapping, Escape/outside-click cancel, and calling onSubmit only with valid data in src/components/AppointmentForm/AppointmentForm.tsx and src/components/AppointmentForm/AppointmentForm.module.css
- [X] T030 [US3] Wire onAddClick in CalendarDay to open AppointmentForm pre-filled with the clicked date; call addAppointment and close form on submit in src/app/page.tsx
- [X] T031 [US3] Call logAppointmentCreated() from analytics.ts and log the creation event via logger.ts inside AppointmentForm.tsx after successful submission

**Checkpoint**: US1 + US2 + US3 all independently testable; appointments created in the session persist until page reload.

---

## Phase 6: User Story 4 — Delete a Medical Appointment (Priority: P4)

**Goal**: A user selects an existing appointment, views its details, clicks Delete, confirms the prompt, and the appointment is permanently removed from the calendar.

**Independent Test**: With an appointment on the calendar, click it — detail view opens showing all fields. Click Delete — confirmation prompt appears. Click Cancel — appointment remains. Click Delete again and Confirm — appointment is gone from the calendar.

### Tests for User Story 4 (REQUIRED per constitution) ⚠️

- [X] T032 [P] [US4] Write unit tests for AppointmentDetail: displays all fields, delete-then-confirm calls onDelete, cancel retains appointment, Escape triggers onClose in tests/unit/components/AppointmentDetail.test.tsx
- [X] T033 [P] [US4] Write integration test for delete-appointment scenario (select, confirm-delete, verify removed; select, cancel-delete, verify retained) in tests/integration/delete-appointment.spec.ts

### Implementation for User Story 4

- [X] T034 [US4] Implement AppointmentDetail modal displaying all appointment fields and a two-step delete flow (Delete button → inline confirmation with Confirm + Cancel); Escape/outside-click triggers onClose, never onDelete in src/components/AppointmentDetail/AppointmentDetail.tsx and src/components/AppointmentDetail/AppointmentDetail.module.css
- [X] T035 [US4] Wire onAppointmentClick in CalendarDay to selectAppointment; render AppointmentDetail when selectedAppointment is non-null; call deleteAppointment and clearSelection on confirm in src/app/page.tsx
- [X] T036 [US4] Call logAppointmentDeleted() from analytics.ts and log the deletion event via logger.ts inside AppointmentDetail.tsx after confirmed deletion

**Checkpoint**: All four user stories pass their integration tests independently. Full CRUD cycle (view → navigate → add → delete) is operational.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsiveness, logging standard enforcement, performance validation, and final sign-off.

- [X] T037 [P] Accessibility audit: verify aria-labels on all interactive elements, focus trapping in AppointmentForm and AppointmentDetail modals, keyboard navigation (Tab, Enter, Escape) across all components
- [X] T038 [P] Add responsive CSS rules for mobile viewports (< 768px) — collapse calendar grid columns, increase touch target sizes — in src/components/Calendar/Calendar.module.css and src/app/globals.css
- [X] T039 Logging standard sweep: replace any direct console.log/warn/error calls with the logger utility from src/utils/logger.ts across all src/ files
- [X] T040 Performance check: load the app in Chrome DevTools and confirm calendar renders and is interactive within 2 seconds (SC-005); document result in quickstart.md
- [X] T041 Run all validation steps from quickstart.md for all four user stories and confirm every acceptance scenario passes
- [X] T042 [P] Code cleanup: remove dead code, unused imports, and commented-out blocks; verify all identifiers follow camelCase/PascalCase per Code Standards principle

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user story phases**.
- **US1 (Phase 3)**: Depends on Phase 2 — first story, no story-level dependencies.
- **US2 (Phase 4)**: Depends on Phase 2 — navigation actions are already in the reducer from Phase 2; extends Phase 3 UI.
- **US3 (Phase 5)**: Depends on Phase 2 — form and addAppointment are independent of US2; can overlap with US2 if staffed separately.
- **US4 (Phase 6)**: Depends on Phase 2 — deleteAppointment is in the reducer; AppointmentDetail is an independent component.
- **Polish (Phase 7)**: Depends on all desired stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — start after Phase 2.
- **US2 (P2)**: No dependencies on US1 at the code level (nav actions are in the reducer); extends CalendarHeader wiring.
- **US3 (P3)**: No dependencies on US2 — AppointmentForm is a new component; addAppointment is already in the reducer.
- **US4 (P4)**: No dependencies on US3 — AppointmentDetail is a new component; deleteAppointment is already in the reducer.

### Within Each User Story

1. Write tests FIRST — verify they FAIL before writing implementation.
2. Implement components and wiring.
3. Add analytics + logging calls.
4. Verify the story's integration test passes.
5. Commit before moving to the next story.

---

## Parallel Opportunities

### Phase 1 — can all run in parallel after T001:
```
T002  Configure ESLint + Prettier
T003  Configure Vitest + RTL
T004  Configure Playwright
T005  Add globals.css base styles
```

### Phase 2 — T007/T008 and T012/T013 can start immediately after T006:
```
T007  Implement dateUtils          T012  Implement logger utility
T008  Write dateUtils tests        T013  Initialize Firebase Analytics
T011  Write useAppointments tests
```

### Per User Story — tests and non-blocking tasks run in parallel:
```
# US1 example:
T015  Write Calendar unit tests
T016  Write view-calendar integration test
# (then implement T017 → T018 → T019 → T020 → T021 sequentially)

# US3 example:
T027  Write AppointmentForm unit tests
T028  Write add-appointment integration test
# (then implement T029 → T030 → T031 sequentially)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T014) — **CRITICAL, blocks everything**
3. Complete Phase 3: User Story 1 (T015–T021)
4. **STOP and VALIDATE**: run `npm run test` + `npm run test:e2e` for US1 only
5. Demo or deploy the read-only calendar view

### Incremental Delivery

1. Phase 1 + Phase 2 → Core infrastructure ready
2. Phase 3 (US1) → Calendar renders; independently testable → **MVP checkpoint**
3. Phase 4 (US2) → Navigation works; both US1 + US2 testable
4. Phase 5 (US3) → Appointments can be added; US1 + US2 + US3 testable
5. Phase 6 (US4) → Appointments can be deleted; full CRUD testable
6. Phase 7 → Polish, performance, accessibility, logging standard sign-off

### Parallel Team Strategy

With multiple developers after Phase 2 completes:
- **Dev A**: US1 (Phase 3)
- **Dev B**: US2 (Phase 4)
- **Dev C**: US3 + US4 (Phases 5–6, sequentially)

Each developer works on their own component files with no file-level conflicts.

---

## Notes

- `[P]` marks tasks that touch different files with no unresolved dependencies — safe to run in parallel.
- `[USn]` maps the task to a specific user story for traceability.
- Firebase Analytics (T013, T021, T026, T031, T036) requires a `.env.local` file with `NEXT_PUBLIC_FIREBASE_*` environment variables; document these in quickstart.md as part of T040.
- The logging utility (T012) must be the only way to emit console output in `src/` — direct `console.*` calls are banned per the logging standard sweep in T039.
- Each user story phase should be independently completable and testable without depending on features from later story phases.
- Commit after each story phase or logical group of tasks.

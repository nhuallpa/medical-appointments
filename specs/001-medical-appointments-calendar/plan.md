# Implementation Plan: Medical Appointments Calendar

**Branch**: `001-medical-appointments-calendar` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-medical-appointments-calendar/spec.md`

## Summary

A frontend-only web application built with Next.js and TypeScript that allows users to
view, add, and delete medical appointments on a monthly calendar. All data is stored
in-memory via React Context — no backend or database required. The MVP targets a single
medical practice receptionist managing a schedule without authentication.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 14+ (App Router), CSS Modules

**Storage**: In-memory via React Context + useReducer (browser session only)

**Testing**: Vitest + React Testing Library (unit), Playwright (integration)

**Target Platform**: Web browser (modern: Chrome, Firefox, Safari, Edge)

**Project Type**: Frontend web application (no backend)

**Performance Goals**: Calendar fully rendered and interactive within 2 seconds of page load

**Constraints**: No login, no persistence across page reloads, no backend, no external
API calls, single-month calendar view

**Scale/Scope**: Single-practice MVP, one user at a time, session-scoped data only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. MVP Architecture | Frontend + in-memory only — no backend, no DB | ✅ PASS — React Context replaces database |
| II. Testing Discipline | Unit tests AND integration tests required for all features | ✅ PASS — Vitest/RTL (unit) + Playwright (integration) planned |
| III. UI/UX Standards | Max 2 interactions for calendar nav; actions discoverable | ✅ PASS — Single-click prev/next navigation; explicit Add/Delete buttons |
| IV. Code Standards | English throughout; camelCase/PascalCase; no dead code | ✅ PASS — TypeScript enforces types; ESLint enforces standards |

All gates pass. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/001-medical-appointments-calendar/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ui-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx           # Root layout with AppointmentProvider
│   ├── page.tsx             # Main calendar page
│   └── globals.css          # Global reset and base styles
├── components/
│   ├── Calendar/
│   │   ├── Calendar.tsx         # Monthly grid view
│   │   ├── Calendar.module.css
│   │   ├── CalendarHeader.tsx   # Month title + navigation controls
│   │   ├── CalendarHeader.module.css
│   │   ├── CalendarDay.tsx      # Single day cell with appointment list
│   │   └── CalendarDay.module.css
│   ├── AppointmentForm/
│   │   ├── AppointmentForm.tsx  # Add appointment modal form
│   │   └── AppointmentForm.module.css
│   └── AppointmentDetail/
│       ├── AppointmentDetail.tsx    # Detail view with delete action
│       └── AppointmentDetail.module.css
├── context/
│   └── AppointmentContext.tsx   # React Context + useReducer store
├── hooks/
│   └── useAppointments.ts       # Consumer hook for appointment operations
├── types/
│   └── appointment.ts           # TypeScript interfaces
└── utils/
    └── dateUtils.ts             # Calendar grid generation, date formatting

tests/
├── unit/
│   ├── components/
│   │   ├── Calendar.test.tsx
│   │   ├── AppointmentForm.test.tsx
│   │   └── AppointmentDetail.test.tsx
│   ├── hooks/
│   │   └── useAppointments.test.ts
│   └── utils/
│       └── dateUtils.test.ts
└── integration/
    ├── view-calendar.spec.ts
    ├── navigate-months.spec.ts
    ├── add-appointment.spec.ts
    └── delete-appointment.spec.ts
```

**Structure Decision**: Single Next.js app (no backend). All source code lives under `src/`
with Next.js App Router at `src/app/`. Tests live at the root `tests/` directory, separated
into `unit/` (Vitest + RTL) and `integration/` (Playwright) following constitution requirements.

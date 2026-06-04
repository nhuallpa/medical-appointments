# Research: Medical Appointments Calendar

**Branch**: `001-medical-appointments-calendar` | **Date**: 2026-06-03

## Decision 1: Next.js Router Strategy

**Decision**: App Router (Next.js 14+)

**Rationale**: App Router is the current Next.js standard. It provides server and client
component separation, simpler layouts, and superior TypeScript integration. Since this is
a pure client-side app (all state in-memory), the entire page will use `"use client"` —
but App Router's structure organizes the project better for future growth.

**Alternatives considered**:
- Pages Router: Older pattern, still supported but moving toward deprecation. More
  documentation available but no technical advantage for this MVP.

---

## Decision 2: In-Memory State Management

**Decision**: React Context + `useReducer`

**Rationale**: A single global context with a reducer manages appointments cleanly without
any external dependency. It supports the four operations needed (list, add, delete, filter
by month) and is appropriate for a single-user, single-session MVP.

**Alternatives considered**:
- Zustand: Lightweight and ergonomic, but adds a dependency not justified for this scope.
- Redux Toolkit: Too heavy for an MVP with no async data fetching.
- `useState` in a top-level component: Works but becomes unwieldy when appointment state
  is needed across multiple nested components (Calendar, Form, Detail).

---

## Decision 3: Calendar Rendering

**Decision**: Custom calendar grid using CSS Grid

**Rationale**: The user specified CSS as the styling approach. A custom grid built with
CSS Grid gives full visual control with zero dependencies. The grid is straightforward:
7 columns, 5-6 rows, filled with the days of the displayed month (with leading/trailing
empty cells for alignment).

**Alternatives considered**:
- react-big-calendar: Full-featured but opinionated styling; conflicts with CSS Modules
  approach and adds a large dependency.
- FullCalendar: Powerful but overkill; licensing concerns for commercial use.
- react-calendar: Simpler but still an extra dependency; the custom implementation is
  under 100 lines of logic.

---

## Decision 4: Testing Stack

**Decision**: Vitest + React Testing Library (unit tests), Playwright (integration tests)

**Rationale**:
- Vitest integrates natively with Vite/Next.js build tooling, runs significantly faster
  than Jest, and has a Jest-compatible API so prior knowledge transfers directly.
- React Testing Library tests components from a user perspective (queries by role/label),
  which aligns directly with the constitution's requirement to validate user-facing
  functionality rather than implementation details.
- Playwright provides reliable cross-browser integration testing with excellent
  TypeScript support. It covers full user journeys (load page → navigate → add → delete)
  as required by the Testing Discipline principle.

**Alternatives considered**:
- Jest + RTL: Fully viable but slower; Vitest is strictly better for this stack.
- Cypress: Component and E2E testing in one tool, but heavier setup and slower CI
  execution compared to Playwright for E2E-only needs.

---

## Decision 5: Styling Strategy

**Decision**: CSS Modules (`.module.css` files per component)

**Rationale**: The user explicitly specified CSS. CSS Modules are natively supported by
Next.js, provide scoped class names to avoid conflicts, and require no additional
dependencies or build configuration. Each component owns its styles.

**Alternatives considered**:
- Tailwind CSS: Not requested; adds a dependency and requires a different mental model.
- Styled Components / Emotion: CSS-in-JS adds runtime overhead and was not requested.
- Global CSS only: Acceptable for very small apps but becomes unmaintainable as the
  component count grows.

---

## Decision 6: Date Handling

**Decision**: Native browser `Date` API + lightweight utility functions in `dateUtils.ts`

**Rationale**: The calendar needs three operations: generate a month grid (days of month
+ leading/trailing blanks), format a date for display, and compare dates. All three are
achievable with the native Date API in under 50 lines. No library justified.

**Algorithms**:
- Month grid: `new Date(year, month, 1)` gives the first day; `.getDay()` gives the
  weekday offset; `new Date(year, month + 1, 0).getDate()` gives the last day.
- Date key for appointments: ISO string sliced to `YYYY-MM-DD` format for map lookup.

**Alternatives considered**:
- date-fns: Excellent library but unnecessary for this feature scope.
- dayjs: Lightweight (2KB) but still an external dependency not justified here.

---

## Decision 7: Appointment ID Generation

**Decision**: `crypto.randomUUID()` (browser-native)

**Rationale**: Every appointment needs a stable unique ID for deletion. `crypto.randomUUID()`
is available in all modern browsers with no additional dependency.

**Alternatives considered**:
- Sequential counter: Simple but brittle if the array is filtered/sorted.
- `Date.now()` string: Cheap but not guaranteed unique under rapid sequential creation.
- `uuid` npm package: Adds a dependency for functionality the browser provides natively.

---

## Resolved Clarifications

All technical decisions are resolved. No NEEDS CLARIFICATION items remain from the
feature specification. Implementation can proceed to Phase 1 design.

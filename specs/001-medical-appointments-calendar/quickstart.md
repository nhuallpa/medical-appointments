# Quickstart: Medical Appointments Calendar

**Branch**: `001-medical-appointments-calendar` | **Date**: 2026-06-03

## Prerequisites

- Node.js 18+ installed
- npm or yarn available

## Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3000` in a browser. The calendar opens directly — no login required.

## Running Tests

```bash
# Unit tests (Vitest + React Testing Library)
npm run test

# Unit tests in watch mode
npm run test:watch

# Integration tests (Playwright) — requires dev server running
npm run test:e2e

# All tests
npm run test:all
```

## Validating the Four User Stories

### US1 — View Monthly Calendar

1. Open the application.
2. Verify the current month and year are displayed in the header.
3. Verify a 7-column calendar grid is visible with all days of the month shown.

### US2 — Navigate Between Months

1. Click the `›` (next) button in the calendar header.
2. Verify the calendar advances to the following month.
3. Click the `‹` (prev) button.
4. Verify the calendar returns to the previous month.
5. Click the `Today` button.
6. Verify the calendar returns to the current month with today's date highlighted.

### US3 — Add a Medical Appointment

1. Click on any day cell in the calendar.
2. Verify the appointment form opens with the clicked date pre-filled.
3. Fill in Patient Name, Professional Name, and Time.
4. Click Save.
5. Verify the appointment appears on the calendar on the correct date showing the patient name and time.
6. Attempt to save without filling in required fields.
7. Verify the form highlights the missing fields and does not save.

### US4 — Delete a Medical Appointment

1. Click on an existing appointment on the calendar.
2. Verify the appointment detail panel opens showing all fields.
3. Click the Delete button.
4. Verify a confirmation prompt appears.
5. Click Cancel — verify the appointment is still present on the calendar.
6. Click Delete again, then Confirm.
7. Verify the appointment is removed from the calendar.

## Project Structure Reference

See [plan.md](./plan.md) for the complete source code directory layout.

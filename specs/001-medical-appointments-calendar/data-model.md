# Data Model: Medical Appointments Calendar

**Branch**: `001-medical-appointments-calendar` | **Date**: 2026-06-03

## Entities

### Appointment

Represents a single scheduled medical visit. The primary entity in the system.

```typescript
interface Appointment {
  id: string;               // UUID generated via crypto.randomUUID()
  patientName: string;      // Required. Full name of the patient.
  professionalName: string; // Required. Name of the doctor or specialist.
  date: string;             // Required. ISO date string "YYYY-MM-DD".
  time: string;             // Required. 24-hour time string "HH:MM".
  notes?: string;           // Optional. Free-text notes about the appointment.
  createdAt: string;        // ISO timestamp, set at creation time.
}
```

**Validation rules**:
- `patientName`: Non-empty string, trimmed, max 100 characters.
- `professionalName`: Non-empty string, trimmed, max 100 characters.
- `date`: Valid calendar date in "YYYY-MM-DD" format. No range restriction (past and future dates allowed).
- `time`: Valid time in "HH:MM" format, 00:00–23:59.
- `notes`: Optional. Max 500 characters if provided.
- `id` and `createdAt` are system-generated and never provided by the user.

---

### AppointmentFormData

The shape of user input when creating a new appointment. Excludes system-generated fields.

```typescript
interface AppointmentFormData {
  patientName: string;
  professionalName: string;
  date: string;
  time: string;
  notes?: string;
}
```

---

## Derived Structures

### AppointmentsByDate

A computed lookup map used by the calendar to render appointments per day cell.
Not stored — derived on each render from the full appointments array.

```typescript
type AppointmentsByDate = Record<string, Appointment[]>;
// Key format: "YYYY-MM-DD"
// Value: array of Appointment objects for that date (may be empty or multiple)
```

### CalendarGrid

The structure produced by `dateUtils.generateMonthGrid()` for rendering the
calendar month view.

```typescript
interface CalendarCell {
  date: string | null; // "YYYY-MM-DD" for valid days; null for leading/trailing blank cells
  isToday: boolean;
  appointments: Appointment[];
}

type CalendarGrid = CalendarCell[][]; // 5 or 6 rows × 7 columns
```

---

## State Shape (React Context)

The complete in-memory state managed by `AppointmentContext`.

```typescript
interface AppointmentState {
  appointments: Appointment[]; // All appointments for the current session
  currentYear: number;         // Currently displayed calendar year
  currentMonth: number;        // Currently displayed calendar month (0-indexed)
  selectedAppointment: Appointment | null; // Appointment shown in detail view; null if none
}
```

---

## Reducer Actions

Actions dispatched to mutate the `AppointmentState`.

```typescript
type AppointmentAction =
  | { type: 'ADD_APPOINTMENT'; payload: AppointmentFormData }
  | { type: 'DELETE_APPOINTMENT'; payload: { id: string } }
  | { type: 'SELECT_APPOINTMENT'; payload: { appointment: Appointment } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'NAVIGATE_MONTH'; payload: { direction: 'prev' | 'next' } }
  | { type: 'GO_TO_TODAY' };
```

---

## State Transitions

```
Initial state
  → currentYear/currentMonth = today's year/month
  → appointments = []
  → selectedAppointment = null

ADD_APPOINTMENT(formData)
  → generates id + createdAt
  → appends new Appointment to appointments[]

DELETE_APPOINTMENT(id)
  → removes Appointment with matching id from appointments[]
  → clears selectedAppointment if it matches the deleted id

SELECT_APPOINTMENT(appointment)
  → sets selectedAppointment to the chosen Appointment

CLEAR_SELECTION
  → sets selectedAppointment to null

NAVIGATE_MONTH({ direction: 'next' })
  → increments currentMonth by 1
  → rolls over to next year when currentMonth exceeds 11

NAVIGATE_MONTH({ direction: 'prev' })
  → decrements currentMonth by 1
  → rolls back to previous year when currentMonth goes below 0

GO_TO_TODAY
  → resets currentYear and currentMonth to today's values
```

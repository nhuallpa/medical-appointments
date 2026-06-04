# UI Contracts: Medical Appointments Calendar

**Branch**: `001-medical-appointments-calendar` | **Date**: 2026-06-03

These contracts define the public interface of each React component and the central hook.
They are the boundary each component must honour; internal implementation may vary.

---

## Hook: `useAppointments`

**File**: `src/hooks/useAppointments.ts`

The single consumer interface for all appointment state and operations. Components
import this hook — they never import the context directly.

```typescript
interface UseAppointmentsReturn {
  // State
  appointments: Appointment[];
  currentYear: number;
  currentMonth: number;         // 0-indexed (0 = January)
  selectedAppointment: Appointment | null;

  // Derived
  appointmentsByDate: AppointmentsByDate; // Pre-computed lookup for the current month

  // Operations
  addAppointment: (data: AppointmentFormData) => void;
  deleteAppointment: (id: string) => void;
  selectAppointment: (appointment: Appointment) => void;
  clearSelection: () => void;
  navigateMonth: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
}
```

**Constraints**:
- Must be called inside a component tree wrapped by `AppointmentProvider`.
- Throws an error if called outside of `AppointmentProvider`.

---

## Component: `Calendar`

**File**: `src/components/Calendar/Calendar.tsx`

Top-level calendar component. Renders the header and the day grid. Consumes
`useAppointments` internally — no appointment-related props needed.

```typescript
interface CalendarProps {
  // No external props — Calendar reads all state from useAppointments
}
```

**Responsibilities**:
- Renders `CalendarHeader` and the grid of `CalendarDay` cells.
- Passes each day's date and appointments to `CalendarDay`.
- Manages the 7-column grid layout via CSS Modules.

---

## Component: `CalendarHeader`

**File**: `src/components/Calendar/CalendarHeader.tsx`

Displays the current month/year label and navigation controls.

```typescript
interface CalendarHeaderProps {
  year: number;
  month: number;          // 0-indexed
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}
```

**Constraints**:
- `onPrev`, `onNext`, `onToday` must be stable references (use `useCallback` in parent).
- Must render accessible button elements with descriptive `aria-label` attributes.

---

## Component: `CalendarDay`

**File**: `src/components/Calendar/CalendarDay.tsx`

Renders a single day cell in the calendar grid.

```typescript
interface CalendarDayProps {
  date: string | null;          // "YYYY-MM-DD"; null for blank leading/trailing cells
  isToday: boolean;
  appointments: Appointment[];
  onAddClick: (date: string) => void;       // Opens form pre-filled with this date
  onAppointmentClick: (appointment: Appointment) => void; // Opens detail view
}
```

**Constraints**:
- When `date` is null, renders an empty, non-interactive cell.
- Must display the day number prominently.
- When `appointments` is non-empty, renders each appointment as a clickable item
  showing at minimum `patientName` and `time`.
- Add action is discoverable (visible on hover or always visible) per UI/UX principle.

---

## Component: `AppointmentForm`

**File**: `src/components/AppointmentForm/AppointmentForm.tsx`

Modal form for creating a new appointment.

```typescript
interface AppointmentFormProps {
  initialDate?: string;   // Pre-fills the date field when opened from a day cell
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
}
```

**Constraints**:
- Validates all required fields before calling `onSubmit`.
- Marks invalid fields visually and displays a human-readable error message per field.
- Must trap focus within the modal while open (accessibility).
- Pressing Escape or clicking outside the modal triggers `onCancel`.
- `onSubmit` is only called with valid data — the caller does not re-validate.

**Fields rendered**:

| Field | Label | Required | Input type |
|-------|-------|----------|------------|
| `patientName` | Patient Name | Yes | text |
| `professionalName` | Professional Name | Yes | text |
| `date` | Date | Yes | date |
| `time` | Time | Yes | time |
| `notes` | Notes | No | textarea |

---

## Component: `AppointmentDetail`

**File**: `src/components/AppointmentDetail/AppointmentDetail.tsx`

Read-only detail view for an existing appointment, with a delete action.

```typescript
interface AppointmentDetailProps {
  appointment: Appointment;
  onDelete: (id: string) => void;
  onClose: () => void;
}
```

**Constraints**:
- Displays all appointment fields (patientName, professionalName, date, time, notes).
- Delete action must show a confirmation prompt before calling `onDelete`.
- Confirmation prompt must have distinct "Confirm" and "Cancel" controls.
- `onDelete` is called only after the user explicitly confirms — never on first click.
- Pressing Escape or clicking outside triggers `onClose` (not delete).

---

## Utility: `dateUtils`

**File**: `src/utils/dateUtils.ts`

Pure functions with no side effects. All functions are independently unit-testable.

```typescript
// Returns a 5 or 6-row × 7-col grid of CalendarCell objects for the given month
function generateMonthGrid(year: number, month: number, appointments: Appointment[]): CalendarGrid;

// Formats a Date object to "YYYY-MM-DD" string
function toDateKey(date: Date): string;

// Returns the display label for a month (e.g., "June 2026")
function formatMonthLabel(year: number, month: number): string;

// Returns true if the given "YYYY-MM-DD" string matches today's date
function isToday(dateKey: string): boolean;
```

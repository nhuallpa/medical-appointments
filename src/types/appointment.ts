// ── Appointment Type ────────────────────────────────────────────────────────

export interface AppointmentType {
  id: string;
  name: string;
  repeatable: boolean;
  maxSessions: number; // 1 for individual; ≥2 for repeatable
  color?: string; // hex color for calendar badges
}

// ── Schedule Configuration ───────────────────────────────────────────────────

export interface ScheduleConfig {
  enabledDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  slotIntervalMinutes: number; // 15 | 30 | 45 | 60. Default: 30.
}

// ── Appointment ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientName: string;
  professionalName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  typeId: string; // references AppointmentType.id
  seriesId?: string; // shared UUID for all appointments in a series
  seriesIndex?: number; // 1-based position within series
  seriesTotal?: number; // total sessions in this series
  notes?: string;
  createdAt: string; // ISO timestamp
}

// ── Form Data ────────────────────────────────────────────────────────────────

export interface AppointmentFormData {
  patientName: string;
  professionalName: string;
  date: string; // first date (or only date for individual)
  time: string;
  typeId: string;
  sessions: number; // 1 for individual; 1–maxSessions for repeatable
  notes?: string;
}

// ── Derived Structures ───────────────────────────────────────────────────────

export interface CalendarCell {
  date: string | null; // "YYYY-MM-DD"; null for leading/trailing blank cells
  isToday: boolean;
  appointments: Appointment[];
}

export type CalendarGrid = CalendarCell[][];

export type AppointmentsByDate = Record<string, Appointment[]>;

// ── View Mode ────────────────────────────────────────────────────────────────

export type ViewMode = "calendar" | "day";

export interface TimeSlot {
  time: string; // "HH:MM" — the slot's start time
  appointments: Appointment[]; // appointments whose time falls within this slot
}

// ── State ────────────────────────────────────────────────────────────────────

export interface AppointmentState {
  appointments: Appointment[];
  appointmentTypes: AppointmentType[];
  scheduleConfig: ScheduleConfig;
  currentYear: number;
  currentMonth: number; // 0-indexed
  selectedAppointment: Appointment | null;
  viewMode: ViewMode;
  currentDate: string; // "YYYY-MM-DD" — selected date shared by Calendar and Day views
}

// ── Actions ──────────────────────────────────────────────────────────────────

export type AppointmentAction =
  // Existing actions
  | { type: "ADD_APPOINTMENT"; payload: AppointmentFormData }
  | { type: "DELETE_APPOINTMENT"; payload: { id: string } }
  | { type: "SELECT_APPOINTMENT"; payload: { appointment: Appointment } }
  | { type: "CLEAR_SELECTION" }
  | { type: "NAVIGATE_MONTH"; payload: { direction: "prev" | "next" } }
  | { type: "GO_TO_TODAY" }
  // New actions
  | { type: "ADD_APPOINTMENT_TYPE"; payload: Omit<AppointmentType, "id"> }
  | { type: "DELETE_APPOINTMENT_TYPE"; payload: { id: string } }
  | { type: "UPDATE_SCHEDULE_CONFIG"; payload: Partial<ScheduleConfig> }
  | { type: "ADD_APPOINTMENT_SERIES"; payload: AppointmentFormData }
  | { type: "DELETE_SERIES"; payload: { seriesId: string } }
  | { type: "SET_VIEW_MODE"; payload: { mode: ViewMode } }
  | { type: "SET_CURRENT_DATE"; payload: { date: string } }
  | { type: "NAVIGATE_DAY"; payload: { direction: "prev" | "next" } };

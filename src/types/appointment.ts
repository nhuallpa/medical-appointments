export interface Appointment {
  id: string;
  patientName: string;
  professionalName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  notes?: string;
  createdAt: string; // ISO timestamp
}

export interface AppointmentFormData {
  patientName: string;
  professionalName: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CalendarCell {
  date: string | null; // "YYYY-MM-DD"; null for blank leading/trailing cells
  isToday: boolean;
  appointments: Appointment[];
}

export type CalendarGrid = CalendarCell[][];

export type AppointmentsByDate = Record<string, Appointment[]>;

export interface AppointmentState {
  appointments: Appointment[];
  currentYear: number;
  currentMonth: number; // 0-indexed
  selectedAppointment: Appointment | null;
}

export type AppointmentAction =
  | { type: "ADD_APPOINTMENT"; payload: AppointmentFormData }
  | { type: "DELETE_APPOINTMENT"; payload: { id: string } }
  | { type: "SELECT_APPOINTMENT"; payload: { appointment: Appointment } }
  | { type: "CLEAR_SELECTION" }
  | { type: "NAVIGATE_MONTH"; payload: { direction: "prev" | "next" } }
  | { type: "GO_TO_TODAY" };

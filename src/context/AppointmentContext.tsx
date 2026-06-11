"use client";

import React, { createContext, useReducer, useContext } from "react";
import type {
  Appointment,
  AppointmentAction,
  AppointmentFormData,
  AppointmentState,
  AppointmentType,
} from "@/types/appointment";
import { generateSeriesDates, getDefaultSchedule } from "@/utils/scheduleUtils";

const today = new Date();

const DEFAULT_TYPES: AppointmentType[] = [
  { id: "type-dental", name: "Dental", repeatable: false, maxSessions: 1, color: "#3b82f6" },
  {
    id: "type-rehab",
    name: "Rehabilitation",
    repeatable: true,
    maxSessions: 10,
    color: "#10b981",
  },
  {
    id: "type-general",
    name: "General Consultation",
    repeatable: false,
    maxSessions: 1,
    color: "#8b5cf6",
  },
];

const initialState: AppointmentState = {
  appointments: [],
  appointmentTypes: DEFAULT_TYPES,
  scheduleConfig: getDefaultSchedule(),
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth(),
  selectedAppointment: null,
};

function buildAppointment(data: AppointmentFormData, overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: crypto.randomUUID(),
    patientName: data.patientName.trim(),
    professionalName: data.professionalName.trim(),
    date: data.date,
    time: data.time,
    typeId: data.typeId,
    notes: data.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function reducer(state: AppointmentState, action: AppointmentAction): AppointmentState {
  switch (action.type) {
    case "ADD_APPOINTMENT": {
      const data: AppointmentFormData = action.payload;
      const newAppt = buildAppointment(data);
      return { ...state, appointments: [...state.appointments, newAppt] };
    }

    case "ADD_APPOINTMENT_SERIES": {
      const data: AppointmentFormData = action.payload;
      const sessions = Math.max(1, data.sessions ?? 1);
      const seriesId = crypto.randomUUID();
      const dates = generateSeriesDates(
        data.date,
        sessions,
        state.scheduleConfig.enabledDays
      );
      const newAppts: Appointment[] = dates.map((date, idx) =>
        buildAppointment(
          { ...data, date },
          { seriesId, seriesIndex: idx + 1, seriesTotal: dates.length }
        )
      );
      return { ...state, appointments: [...state.appointments, ...newAppts] };
    }

    case "DELETE_APPOINTMENT": {
      const filtered = state.appointments.filter((a) => a.id !== action.payload.id);
      const selected =
        state.selectedAppointment?.id === action.payload.id ? null : state.selectedAppointment;
      return { ...state, appointments: filtered, selectedAppointment: selected };
    }

    case "DELETE_SERIES": {
      const { seriesId } = action.payload;
      const filtered = state.appointments.filter((a) => a.seriesId !== seriesId);
      const selected =
        state.selectedAppointment?.seriesId === seriesId ? null : state.selectedAppointment;
      return { ...state, appointments: filtered, selectedAppointment: selected };
    }

    case "SELECT_APPOINTMENT":
      return { ...state, selectedAppointment: action.payload.appointment };

    case "CLEAR_SELECTION":
      return { ...state, selectedAppointment: null };

    case "NAVIGATE_MONTH": {
      let { currentYear, currentMonth } = state;
      if (action.payload.direction === "next") {
        currentMonth += 1;
        if (currentMonth > 11) { currentMonth = 0; currentYear += 1; }
      } else {
        currentMonth -= 1;
        if (currentMonth < 0) { currentMonth = 11; currentYear -= 1; }
      }
      return { ...state, currentYear, currentMonth };
    }

    case "GO_TO_TODAY": {
      const now = new Date();
      return { ...state, currentYear: now.getFullYear(), currentMonth: now.getMonth() };
    }

    case "ADD_APPOINTMENT_TYPE": {
      const newType: AppointmentType = { id: crypto.randomUUID(), ...action.payload };
      return { ...state, appointmentTypes: [...state.appointmentTypes, newType] };
    }

    case "DELETE_APPOINTMENT_TYPE": {
      const types = state.appointmentTypes.filter((t) => t.id !== action.payload.id);
      return { ...state, appointmentTypes: types };
    }

    case "UPDATE_SCHEDULE_CONFIG":
      return {
        ...state,
        scheduleConfig: { ...state.scheduleConfig, ...action.payload },
      };

    default:
      return state;
  }
}

interface AppointmentContextValue {
  state: AppointmentState;
  dispatch: React.Dispatch<AppointmentAction>;
}

const AppointmentContext = createContext<AppointmentContextValue | null>(null);

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppointmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointmentContext(): AppointmentContextValue {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointmentContext must be used within AppointmentProvider");
  return ctx;
}

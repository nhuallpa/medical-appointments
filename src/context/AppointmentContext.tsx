"use client";

import React, { createContext, useReducer, useContext } from "react";
import type {
  Appointment,
  AppointmentAction,
  AppointmentFormData,
  AppointmentState,
} from "@/types/appointment";

const today = new Date();

const initialState: AppointmentState = {
  appointments: [],
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth(),
  selectedAppointment: null,
};

function reducer(state: AppointmentState, action: AppointmentAction): AppointmentState {
  switch (action.type) {
    case "ADD_APPOINTMENT": {
      const data: AppointmentFormData = action.payload;
      const newAppt: Appointment = {
        id: crypto.randomUUID(),
        patientName: data.patientName.trim(),
        professionalName: data.professionalName.trim(),
        date: data.date,
        time: data.time,
        notes: data.notes?.trim(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, appointments: [...state.appointments, newAppt] };
    }
    case "DELETE_APPOINTMENT": {
      const filtered = state.appointments.filter((a) => a.id !== action.payload.id);
      const selected =
        state.selectedAppointment?.id === action.payload.id ? null : state.selectedAppointment;
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
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear += 1;
        }
      } else {
        currentMonth -= 1;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear -= 1;
        }
      }
      return { ...state, currentYear, currentMonth };
    }
    case "GO_TO_TODAY": {
      const now = new Date();
      return { ...state, currentYear: now.getFullYear(), currentMonth: now.getMonth() };
    }
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
  if (!ctx) {
    throw new Error("useAppointmentContext must be used within AppointmentProvider");
  }
  return ctx;
}

export { reducer };

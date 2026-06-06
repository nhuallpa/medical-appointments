"use client";

import { useCallback } from "react";
import { useAppointmentContext } from "@/context/AppointmentContext";
import type { Appointment, AppointmentFormData, AppointmentsByDate } from "@/types/appointment";

export function useAppointments() {
  const { state, dispatch } = useAppointmentContext();

  const appointmentsByDate: AppointmentsByDate = {};
  for (const appt of state.appointments) {
    if (!appointmentsByDate[appt.date]) {
      appointmentsByDate[appt.date] = [];
    }
    appointmentsByDate[appt.date].push(appt);
  }

  const addAppointment = useCallback(
    (data: AppointmentFormData) => dispatch({ type: "ADD_APPOINTMENT", payload: data }),
    [dispatch]
  );

  const deleteAppointment = useCallback(
    (id: string) => dispatch({ type: "DELETE_APPOINTMENT", payload: { id } }),
    [dispatch]
  );

  const selectAppointment = useCallback(
    (appointment: Appointment) =>
      dispatch({ type: "SELECT_APPOINTMENT", payload: { appointment } }),
    [dispatch]
  );

  const clearSelection = useCallback(
    () => dispatch({ type: "CLEAR_SELECTION" }),
    [dispatch]
  );

  const navigateMonth = useCallback(
    (direction: "prev" | "next") =>
      dispatch({ type: "NAVIGATE_MONTH", payload: { direction } }),
    [dispatch]
  );

  const goToToday = useCallback(() => dispatch({ type: "GO_TO_TODAY" }), [dispatch]);

  return {
    appointments: state.appointments,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    selectedAppointment: state.selectedAppointment,
    appointmentsByDate,
    addAppointment,
    deleteAppointment,
    selectAppointment,
    clearSelection,
    navigateMonth,
    goToToday,
  };
}

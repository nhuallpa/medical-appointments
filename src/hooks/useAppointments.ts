"use client";

import { useCallback } from "react";
import { useAppointmentContext } from "@/context/AppointmentContext";
import { generateTimeSlots } from "@/utils/scheduleUtils";
import type {
  Appointment,
  AppointmentFormData,
  AppointmentsByDate,
  AppointmentType,
  ScheduleConfig,
  ViewMode,
} from "@/types/appointment";

export function useAppointments() {
  const { state, dispatch } = useAppointmentContext();

  const appointmentsByDate: AppointmentsByDate = {};
  for (const appt of state.appointments) {
    if (!appointmentsByDate[appt.date]) appointmentsByDate[appt.date] = [];
    appointmentsByDate[appt.date].push(appt);
  }

  const timeSlots = generateTimeSlots(
    state.scheduleConfig.startTime,
    state.scheduleConfig.endTime,
    state.scheduleConfig.slotIntervalMinutes,
    appointmentsByDate[state.currentDate] ?? []
  );

  const addAppointment = useCallback(
    (data: AppointmentFormData) => dispatch({ type: "ADD_APPOINTMENT", payload: data }),
    [dispatch]
  );

  const addAppointmentSeries = useCallback(
    (data: AppointmentFormData) => dispatch({ type: "ADD_APPOINTMENT_SERIES", payload: data }),
    [dispatch]
  );

  const deleteAppointment = useCallback(
    (id: string) => dispatch({ type: "DELETE_APPOINTMENT", payload: { id } }),
    [dispatch]
  );

  const deleteSeries = useCallback(
    (seriesId: string) => dispatch({ type: "DELETE_SERIES", payload: { seriesId } }),
    [dispatch]
  );

  const selectAppointment = useCallback(
    (appointment: Appointment) =>
      dispatch({ type: "SELECT_APPOINTMENT", payload: { appointment } }),
    [dispatch]
  );

  const clearSelection = useCallback(() => dispatch({ type: "CLEAR_SELECTION" }), [dispatch]);

  const navigateMonth = useCallback(
    (direction: "prev" | "next") =>
      dispatch({ type: "NAVIGATE_MONTH", payload: { direction } }),
    [dispatch]
  );

  const goToToday = useCallback(() => dispatch({ type: "GO_TO_TODAY" }), [dispatch]);

  const addAppointmentType = useCallback(
    (type: Omit<AppointmentType, "id">) =>
      dispatch({ type: "ADD_APPOINTMENT_TYPE", payload: type }),
    [dispatch]
  );

  const deleteAppointmentType = useCallback(
    (id: string) => dispatch({ type: "DELETE_APPOINTMENT_TYPE", payload: { id } }),
    [dispatch]
  );

  const updateScheduleConfig = useCallback(
    (config: Partial<ScheduleConfig>) =>
      dispatch({ type: "UPDATE_SCHEDULE_CONFIG", payload: config }),
    [dispatch]
  );

  const setViewMode = useCallback(
    (mode: ViewMode) => dispatch({ type: "SET_VIEW_MODE", payload: { mode } }),
    [dispatch]
  );

  const setCurrentDate = useCallback(
    (date: string) => dispatch({ type: "SET_CURRENT_DATE", payload: { date } }),
    [dispatch]
  );

  const navigateDay = useCallback(
    (direction: "prev" | "next") => dispatch({ type: "NAVIGATE_DAY", payload: { direction } }),
    [dispatch]
  );

  return {
    appointments: state.appointments,
    appointmentTypes: state.appointmentTypes,
    scheduleConfig: state.scheduleConfig,
    currentYear: state.currentYear,
    currentMonth: state.currentMonth,
    selectedAppointment: state.selectedAppointment,
    viewMode: state.viewMode,
    currentDate: state.currentDate,
    appointmentsByDate,
    timeSlots,
    addAppointment,
    addAppointmentSeries,
    deleteAppointment,
    deleteSeries,
    selectAppointment,
    clearSelection,
    navigateMonth,
    goToToday,
    addAppointmentType,
    deleteAppointmentType,
    updateScheduleConfig,
    setViewMode,
    setCurrentDate,
    navigateDay,
  };
}

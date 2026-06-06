import { describe, it, expect } from "vitest";
import { reducer } from "@/context/AppointmentContext";
import type { AppointmentState, AppointmentFormData } from "@/types/appointment";

const today = new Date();

const baseState: AppointmentState = {
  appointments: [],
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth(),
  selectedAppointment: null,
};

const formData: AppointmentFormData = {
  patientName: "Jane Doe",
  professionalName: "Dr. Smith",
  date: "2026-06-10",
  time: "09:00",
};

describe("reducer — ADD_APPOINTMENT", () => {
  it("adds a new appointment with generated id and createdAt", () => {
    const state = reducer(baseState, { type: "ADD_APPOINTMENT", payload: formData });
    expect(state.appointments).toHaveLength(1);
    expect(state.appointments[0].patientName).toBe("Jane Doe");
    expect(state.appointments[0].id).toBeTruthy();
    expect(state.appointments[0].createdAt).toBeTruthy();
  });

  it("trims whitespace from patient and professional names", () => {
    const state = reducer(baseState, {
      type: "ADD_APPOINTMENT",
      payload: { ...formData, patientName: "  Jane  ", professionalName: "  Dr. Smith  " },
    });
    expect(state.appointments[0].patientName).toBe("Jane");
    expect(state.appointments[0].professionalName).toBe("Dr. Smith");
  });
});

describe("reducer — DELETE_APPOINTMENT", () => {
  it("removes the appointment with matching id", () => {
    const withAppt = reducer(baseState, { type: "ADD_APPOINTMENT", payload: formData });
    const id = withAppt.appointments[0].id;
    const state = reducer(withAppt, { type: "DELETE_APPOINTMENT", payload: { id } });
    expect(state.appointments).toHaveLength(0);
  });

  it("clears selectedAppointment if it was the deleted one", () => {
    const withAppt = reducer(baseState, { type: "ADD_APPOINTMENT", payload: formData });
    const appt = withAppt.appointments[0];
    const withSelection = reducer(withAppt, {
      type: "SELECT_APPOINTMENT",
      payload: { appointment: appt },
    });
    const state = reducer(withSelection, {
      type: "DELETE_APPOINTMENT",
      payload: { id: appt.id },
    });
    expect(state.selectedAppointment).toBeNull();
  });
});

describe("reducer — SELECT_APPOINTMENT / CLEAR_SELECTION", () => {
  it("sets selectedAppointment", () => {
    const withAppt = reducer(baseState, { type: "ADD_APPOINTMENT", payload: formData });
    const appt = withAppt.appointments[0];
    const state = reducer(withAppt, { type: "SELECT_APPOINTMENT", payload: { appointment: appt } });
    expect(state.selectedAppointment?.id).toBe(appt.id);
  });

  it("clears selectedAppointment", () => {
    const withAppt = reducer(baseState, { type: "ADD_APPOINTMENT", payload: formData });
    const appt = withAppt.appointments[0];
    const selected = reducer(withAppt, {
      type: "SELECT_APPOINTMENT",
      payload: { appointment: appt },
    });
    const state = reducer(selected, { type: "CLEAR_SELECTION" });
    expect(state.selectedAppointment).toBeNull();
  });
});

describe("reducer — NAVIGATE_MONTH", () => {
  it("advances to next month", () => {
    const state = reducer(
      { ...baseState, currentYear: 2026, currentMonth: 5 },
      { type: "NAVIGATE_MONTH", payload: { direction: "next" } }
    );
    expect(state.currentMonth).toBe(6);
    expect(state.currentYear).toBe(2026);
  });

  it("rolls month forward at December boundary", () => {
    const state = reducer(
      { ...baseState, currentYear: 2026, currentMonth: 11 },
      { type: "NAVIGATE_MONTH", payload: { direction: "next" } }
    );
    expect(state.currentMonth).toBe(0);
    expect(state.currentYear).toBe(2027);
  });

  it("goes back one month", () => {
    const state = reducer(
      { ...baseState, currentYear: 2026, currentMonth: 5 },
      { type: "NAVIGATE_MONTH", payload: { direction: "prev" } }
    );
    expect(state.currentMonth).toBe(4);
  });

  it("rolls month backward at January boundary", () => {
    const state = reducer(
      { ...baseState, currentYear: 2026, currentMonth: 0 },
      { type: "NAVIGATE_MONTH", payload: { direction: "prev" } }
    );
    expect(state.currentMonth).toBe(11);
    expect(state.currentYear).toBe(2025);
  });
});

describe("reducer — GO_TO_TODAY", () => {
  it("resets to today's year and month", () => {
    const now = new Date();
    const state = reducer(
      { ...baseState, currentYear: 2030, currentMonth: 11 },
      { type: "GO_TO_TODAY" }
    );
    expect(state.currentYear).toBe(now.getFullYear());
    expect(state.currentMonth).toBe(now.getMonth());
  });
});

describe("appointmentsByDate derivation", () => {
  it("groups appointments by date key", () => {
    const s1 = reducer(baseState, { type: "ADD_APPOINTMENT", payload: formData });
    const s2 = reducer(s1, {
      type: "ADD_APPOINTMENT",
      payload: { ...formData, date: "2026-06-10" },
    });
    const byDate: Record<string, typeof s2.appointments> = {};
    for (const a of s2.appointments) {
      byDate[a.date] = [...(byDate[a.date] ?? []), a];
    }
    expect(byDate["2026-06-10"]).toHaveLength(2);
  });
});

"use client";

import { useCallback } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { generateMonthGrid } from "@/utils/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDay } from "./CalendarDay";
import type { Appointment } from "@/types/appointment";
import styles from "./Calendar.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarProps {
  onAddClick: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function Calendar({ onAddClick, onAppointmentClick }: CalendarProps) {
  const { appointments, currentYear, currentMonth, navigateMonth, goToToday } = useAppointments();

  const grid = generateMonthGrid(currentYear, currentMonth, appointments);

  const handlePrev = useCallback(() => navigateMonth("prev"), [navigateMonth]);
  const handleNext = useCallback(() => navigateMonth("next"), [navigateMonth]);
  const handleToday = useCallback(() => goToToday(), [goToToday]);

  const hasAppointments = appointments.length > 0;

  return (
    <div className={styles.wrapper}>
      {!hasAppointments && (
        <p className={styles.emptyState}>
          No appointments yet —{" "}
          <span>click any date to add an appointment</span>
        </p>
      )}
      <CalendarHeader
        year={currentYear}
        month={currentMonth}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      <div className={styles.grid}>
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.weekdayHeader} data-testid="weekday-header">
            {day}
          </div>
        ))}

        {grid.flat().map((cell, idx) => (
          <CalendarDay
            key={cell.date ?? `blank-${idx}`}
            date={cell.date}
            isToday={cell.isToday}
            appointments={cell.appointments}
            onAddClick={onAddClick}
            onAppointmentClick={onAppointmentClick}
          />
        ))}
      </div>
    </div>
  );
}

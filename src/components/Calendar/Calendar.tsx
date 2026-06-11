"use client";

import { useCallback } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useTranslation } from "@/i18n/LocaleContext";
import { generateMonthGrid } from "@/utils/dateUtils";
import { isDateEnabled } from "@/utils/scheduleUtils";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDay } from "./CalendarDay";
import type { Appointment } from "@/types/appointment";
import styles from "./Calendar.module.css";

interface CalendarProps {
  onAddClick: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function Calendar({ onAddClick, onAppointmentClick }: CalendarProps) {
  const {
    appointments,
    appointmentTypes,
    scheduleConfig,
    currentYear,
    currentMonth,
    navigateMonth,
    goToToday,
    setCurrentDate,
  } = useAppointments();
  const { t, messages } = useTranslation();

  const grid = generateMonthGrid(currentYear, currentMonth, appointments);

  const handlePrev = useCallback(() => navigateMonth("prev"), [navigateMonth]);
  const handleNext = useCallback(() => navigateMonth("next"), [navigateMonth]);
  const handleToday = useCallback(() => goToToday(), [goToToday]);

  const hasAppointments = appointments.length > 0;

  return (
    <div className={styles.wrapper}>
      {!hasAppointments && (
        <p className={styles.emptyState}>
          {t("calendar.emptyStatePrefix")}{" "}
          <span>{t("calendar.emptyStateAction")}</span>
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
        {messages.calendar.weekdays.map((day) => (
          <div key={day} className={styles.weekdayHeader} data-testid="weekday-header">
            {day}
          </div>
        ))}

        {grid.flat().map((cell, idx) => (
          <CalendarDay
            key={cell.date ?? `blank-${idx}`}
            date={cell.date}
            isToday={cell.isToday}
            isUnavailable={cell.date ? !isDateEnabled(cell.date, scheduleConfig.enabledDays) : false}
            appointments={cell.appointments}
            appointmentTypes={appointmentTypes}
            onAddClick={onAddClick}
            onAppointmentClick={onAppointmentClick}
            onSelectDate={setCurrentDate}
          />
        ))}
      </div>
    </div>
  );
}

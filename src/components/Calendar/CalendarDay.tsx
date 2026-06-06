"use client";

import type { Appointment } from "@/types/appointment";
import styles from "./CalendarDay.module.css";

interface CalendarDayProps {
  date: string | null;
  isToday: boolean;
  appointments: Appointment[];
  onAddClick: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarDay({
  date,
  isToday,
  appointments,
  onAddClick,
  onAppointmentClick,
}: CalendarDayProps) {
  if (!date) {
    return <div className={styles.empty} />;
  }

  const dayNumber = parseInt(date.split("-")[2], 10);

  return (
    <div
      className={`${styles.cell} ${isToday ? styles.today : ""}`}
      data-testid="calendar-day"
      data-today={isToday ? "true" : undefined}
    >
      <div className={styles.header}>
        <span className={styles.dayNumber}>{dayNumber}</span>
        <button
          className={styles.addBtn}
          onClick={() => onAddClick(date)}
          aria-label={`Add appointment on ${date}`}
          title="Add appointment"
        >
          +
        </button>
      </div>

      <ul className={styles.appointmentList}>
        {appointments.map((appt) => (
          <li key={appt.id}>
            <button
              className={styles.appointmentItem}
              onClick={() => onAppointmentClick(appt)}
              title={`${appt.patientName} — ${appt.professionalName}`}
            >
              <span className={styles.apptTime}>{appt.time}</span>
              <span className={styles.apptName}>{appt.patientName}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

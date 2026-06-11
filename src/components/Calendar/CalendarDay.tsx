"use client";

import type { Appointment, AppointmentType } from "@/types/appointment";
import styles from "./CalendarDay.module.css";

interface CalendarDayProps {
  date: string | null;
  isToday: boolean;
  appointments: Appointment[];
  appointmentTypes: AppointmentType[];
  onAddClick: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarDay({
  date,
  isToday,
  appointments,
  appointmentTypes,
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
        {appointments.map((appt) => {
          const typeDef = appointmentTypes.find((t) => t.id === appt.typeId);
          const typeColor = typeDef?.color ?? "#6366f1";
          const seriesLabel =
            appt.seriesId && appt.seriesIndex && appt.seriesTotal
              ? `${appt.seriesIndex}/${appt.seriesTotal}`
              : null;
          return (
            <li key={appt.id}>
              <button
                className={styles.appointmentItem}
                onClick={() => onAppointmentClick(appt)}
                title={`${appt.patientName} — ${appt.professionalName}${typeDef ? ` (${typeDef.name})` : ""}`}
                style={{ borderLeftColor: typeColor }}
              >
                <span className={styles.apptTime}>{appt.time}</span>
                <span className={styles.apptName}>{appt.patientName}</span>
                {seriesLabel && (
                  <span className={styles.seriesBadge}>{seriesLabel}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

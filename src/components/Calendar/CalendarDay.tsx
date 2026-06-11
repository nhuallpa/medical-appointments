"use client";

import type { Appointment, AppointmentType } from "@/types/appointment";
import { useTranslation } from "@/i18n/LocaleContext";
import styles from "./CalendarDay.module.css";

interface CalendarDayProps {
  date: string | null;
  isToday: boolean;
  isUnavailable: boolean;
  appointments: Appointment[];
  appointmentTypes: AppointmentType[];
  onAddClick: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onSelectDate: (date: string) => void;
}

export function CalendarDay({
  date,
  isToday,
  isUnavailable,
  appointments,
  appointmentTypes,
  onAddClick,
  onAppointmentClick,
  onSelectDate,
}: CalendarDayProps) {
  const { t } = useTranslation();

  if (!date) {
    return <div className={styles.empty} />;
  }

  const dayNumber = parseInt(date.split("-")[2], 10);

  return (
    <div
      className={`${styles.cell} ${isToday ? styles.today : ""} ${isUnavailable ? styles.unavailable : ""}`}
      data-testid="calendar-day"
      data-today={isToday ? "true" : undefined}
    >
      <div className={styles.header}>
        <button
          className={styles.dayNumber}
          onClick={() => onSelectDate(date)}
          aria-label={t("calendar.selectDate", { date })}
        >
          {dayNumber}
        </button>
        <button
          className={styles.addBtn}
          onClick={() => onAddClick(date)}
          aria-label={t("calendar.addAppointmentOn", { date })}
          title={t("common.addAppointment")}
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

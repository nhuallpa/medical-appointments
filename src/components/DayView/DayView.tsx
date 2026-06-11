"use client";

import type { Appointment, AppointmentType, TimeSlot } from "@/types/appointment";
import { formatFullDateLabel } from "@/utils/dateUtils";
import { useLocale } from "@/i18n/LocaleContext";
import styles from "./DayView.module.css";

interface DayViewProps {
  date: string;
  timeSlots: TimeSlot[];
  appointmentTypes: AppointmentType[];
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onAddClick: (date: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({
  date,
  timeSlots,
  appointmentTypes,
  onPrevDay,
  onNextDay,
  onToday,
  onAddClick,
  onAppointmentClick,
}: DayViewProps) {
  const { locale } = useLocale();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{formatFullDateLabel(date, locale)}</h1>
        <div className={styles.controls}>
          <button className={styles.navBtn} onClick={onPrevDay} aria-label="Previous day">
            ‹
          </button>
          <button className={styles.todayBtn} onClick={onToday} aria-label="Go to today">
            Today
          </button>
          <button className={styles.navBtn} onClick={onNextDay} aria-label="Next day">
            ›
          </button>
        </div>
      </div>

      {timeSlots.length === 0 ? (
        <p className={styles.emptyState}>No time slots configured for this day.</p>
      ) : (
        <ul className={styles.slotList}>
          {timeSlots.map((slot) => (
            <li key={slot.time} className={styles.slotRow}>
              <span className={styles.slotTime}>{slot.time}</span>
              <div className={styles.slotContent}>
                {slot.appointments.map((appt) => {
                  const typeDef = appointmentTypes.find((t) => t.id === appt.typeId);
                  const typeColor = typeDef?.color ?? "#6366f1";
                  return (
                    <button
                      key={appt.id}
                      className={styles.appointmentItem}
                      onClick={() => onAppointmentClick(appt)}
                      title={`${appt.patientName} — ${appt.professionalName}${typeDef ? ` (${typeDef.name})` : ""}`}
                      style={{ borderLeftColor: typeColor }}
                    >
                      <span className={styles.apptName}>{appt.patientName}</span>
                    </button>
                  );
                })}
                <button
                  className={styles.addBtn}
                  onClick={() => onAddClick(date, slot.time)}
                  aria-label={`Add appointment at ${slot.time}`}
                  title="Add appointment"
                >
                  + Add appointment
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Appointment, AppointmentType } from "@/types/appointment";
import { logAppointmentDeleted, logAppointmentSeriesDeleted } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import styles from "./AppointmentDetail.module.css";

const logger = createLogger("AppointmentDetail");

interface AppointmentDetailProps {
  appointment: Appointment;
  appointmentTypes: AppointmentType[];
  onDelete: (id: string) => void;
  onDeleteSeries?: (seriesId: string) => void;
  onClose: () => void;
}

export function AppointmentDetail({
  appointment,
  appointmentTypes,
  onDelete,
  onDeleteSeries,
  onClose,
}: AppointmentDetailProps) {
  const [confirming, setConfirming] = useState<"single" | "series" | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const typeDef = appointmentTypes.find((t) => t.id === appointment.typeId);
  const isSeries = Boolean(appointment.seriesId);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleConfirmDelete = async () => {
    if (confirming === "series" && appointment.seriesId && onDeleteSeries) {
      logger.info("Series deleted", { seriesId: appointment.seriesId });
      await logAppointmentSeriesDeleted(appointment.seriesId);
      onDeleteSeries(appointment.seriesId);
    } else {
      logger.info("Appointment deleted", { id: appointment.id });
      await logAppointmentDeleted(appointment.id);
      onDelete(appointment.id);
    }
  };

  const formattedDate = new Date(appointment.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="detail-title" className={styles.title}>
            Appointment Details
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <dl className={styles.fields}>
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>Patient</dt>
            <dd className={styles.fieldValue}>{appointment.patientName}</dd>
          </div>
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>Professional</dt>
            <dd className={styles.fieldValue}>{appointment.professionalName}</dd>
          </div>
          {typeDef && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>Type</dt>
              <dd className={styles.fieldValue}>{typeDef.name}</dd>
            </div>
          )}
          {isSeries && appointment.seriesIndex && appointment.seriesTotal && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>Series</dt>
              <dd className={styles.fieldValue}>
                Session {appointment.seriesIndex} of {appointment.seriesTotal}
              </dd>
            </div>
          )}
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>Date</dt>
            <dd className={styles.fieldValue}>{formattedDate}</dd>
          </div>
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>Time</dt>
            <dd className={styles.fieldValue}>{appointment.time}</dd>
          </div>
          {appointment.notes && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>Notes</dt>
              <dd className={styles.fieldValue}>{appointment.notes}</dd>
            </div>
          )}
        </dl>

        <div className={styles.actions}>
          {confirming ? (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>
                {confirming === "series"
                  ? `Remove all ${appointment.seriesTotal} sessions?`
                  : "Remove this appointment?"}
              </span>
              <button className={styles.cancelConfirmBtn} onClick={() => setConfirming(null)}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirmDelete}>
                Confirm
              </button>
            </div>
          ) : (
            <div className={styles.deleteButtons}>
              <button className={styles.deleteBtn} onClick={() => setConfirming("single")}>
                Delete
              </button>
              {isSeries && onDeleteSeries && (
                <button
                  className={`${styles.deleteBtn} ${styles.deleteSeries}`}
                  onClick={() => setConfirming("series")}
                  aria-label={`Delete series (${appointment.seriesTotal} sessions)`}
                >
                  Delete Series ({appointment.seriesTotal})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

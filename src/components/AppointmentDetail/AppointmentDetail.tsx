"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Appointment } from "@/types/appointment";
import { logAppointmentDeleted } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import styles from "./AppointmentDetail.module.css";

const logger = createLogger("AppointmentDetail");

interface AppointmentDetailProps {
  appointment: Appointment;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function AppointmentDetail({ appointment, onDelete, onClose }: AppointmentDetailProps) {
  const [confirming, setConfirming] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

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
    logger.info("Appointment deleted", { id: appointment.id });
    await logAppointmentDeleted(appointment.id);
    onDelete(appointment.id);
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
              <span className={styles.confirmText}>Remove this appointment?</span>
              <button className={styles.cancelConfirmBtn} onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirmDelete}>
                Confirm
              </button>
            </div>
          ) : (
            <button className={styles.deleteBtn} onClick={() => setConfirming(true)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

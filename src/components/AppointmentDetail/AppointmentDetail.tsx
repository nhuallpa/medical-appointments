"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Appointment, AppointmentType } from "@/types/appointment";
import { logAppointmentDeleted, logAppointmentSeriesDeleted } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import { formatFullDateLabel } from "@/utils/dateUtils";
import { useLocale, useTranslation } from "@/i18n/LocaleContext";
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
  const { locale } = useLocale();
  const { t } = useTranslation();
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

  const formattedDate = formatFullDateLabel(appointment.date, locale);

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
            {t("appointmentDetail.title")}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t("common.close")}>
            ×
          </button>
        </div>

        <dl className={styles.fields}>
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>{t("appointmentDetail.patient")}</dt>
            <dd className={styles.fieldValue}>{appointment.patientName}</dd>
          </div>
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>{t("appointmentDetail.professional")}</dt>
            <dd className={styles.fieldValue}>{appointment.professionalName}</dd>
          </div>
          {typeDef && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>{t("appointmentDetail.type")}</dt>
              <dd className={styles.fieldValue}>{typeDef.name}</dd>
            </div>
          )}
          {isSeries && appointment.seriesIndex && appointment.seriesTotal && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>{t("appointmentDetail.series")}</dt>
              <dd className={styles.fieldValue}>
                {t("appointmentDetail.sessionOf", {
                  index: appointment.seriesIndex,
                  total: appointment.seriesTotal,
                })}
              </dd>
            </div>
          )}
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>{t("appointmentDetail.date")}</dt>
            <dd className={styles.fieldValue}>{formattedDate}</dd>
          </div>
          <div className={styles.fieldRow}>
            <dt className={styles.fieldLabel}>{t("appointmentDetail.time")}</dt>
            <dd className={styles.fieldValue}>{appointment.time}</dd>
          </div>
          {appointment.notes && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>{t("appointmentDetail.notes")}</dt>
              <dd className={styles.fieldValue}>{appointment.notes}</dd>
            </div>
          )}
        </dl>

        <div className={styles.actions}>
          {confirming ? (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>
                {confirming === "series"
                  ? t("appointmentDetail.removeSeriesConfirm", { total: appointment.seriesTotal ?? 0 })
                  : t("appointmentDetail.removeAppointmentConfirm")}
              </span>
              <button className={styles.cancelConfirmBtn} onClick={() => setConfirming(null)}>
                {t("common.cancel")}
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirmDelete}>
                {t("common.confirm")}
              </button>
            </div>
          ) : (
            <div className={styles.deleteButtons}>
              <button className={styles.deleteBtn} onClick={() => setConfirming("single")}>
                {t("common.delete")}
              </button>
              {isSeries && onDeleteSeries && (
                <button
                  className={`${styles.deleteBtn} ${styles.deleteSeries}`}
                  onClick={() => setConfirming("series")}
                  aria-label={t("appointmentDetail.deleteSeriesAriaLabel", {
                    total: appointment.seriesTotal ?? 0,
                  })}
                >
                  {t("appointmentDetail.deleteSeries", { total: appointment.seriesTotal ?? 0 })}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

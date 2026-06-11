"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { AppointmentFormData, AppointmentType, ScheduleConfig } from "@/types/appointment";
import { isPastDate, isDateEnabled, isTimeInRange } from "@/utils/scheduleUtils";
import { toDateKey } from "@/utils/dateUtils";
import { logAppointmentCreated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import styles from "./AppointmentForm.module.css";

const logger = createLogger("AppointmentForm");

interface AppointmentFormProps {
  initialDate?: string;
  appointmentTypes: AppointmentType[];
  scheduleConfig: ScheduleConfig;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
}

interface FormErrors {
  patientName?: string;
  professionalName?: string;
  date?: string;
  time?: string;
}

function todayKey(): string {
  return toDateKey(new Date());
}

export function AppointmentForm({
  initialDate,
  appointmentTypes,
  scheduleConfig,
  onSubmit,
  onCancel,
}: AppointmentFormProps) {
  const defaultType = appointmentTypes[0] ?? null;

  const [patientName, setPatientName] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [date, setDate] = useState(initialDate ?? "");
  const [time, setTime] = useState("");
  const [typeId, setTypeId] = useState(defaultType?.id ?? "");
  const [sessions, setSessions] = useState(defaultType?.maxSessions ?? 1);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const firstInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const selectedType = appointmentTypes.find((t) => t.id === typeId) ?? null;
  const isRepeatable = selectedType?.repeatable ?? false;

  // Sync sessions when type changes
  useEffect(() => {
    if (selectedType) {
      setSessions(selectedType.repeatable ? selectedType.maxSessions : 1);
    }
  }, [typeId, selectedType]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  // Schedule warnings (non-blocking)
  const scheduleWarnings: string[] = [];
  if (date) {
    if (!isDateEnabled(date, scheduleConfig.enabledDays)) {
      scheduleWarnings.push("This day is not within configured consultation days.");
    }
  }
  if (time) {
    if (!isTimeInRange(time, scheduleConfig.startTime, scheduleConfig.endTime)) {
      scheduleWarnings.push(
        `Time is outside consultation hours (${scheduleConfig.startTime}–${scheduleConfig.endTime}).`
      );
    }
  }

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!patientName.trim()) errs.patientName = "Patient name is required";
    if (!professionalName.trim()) errs.professionalName = "Professional name is required";
    if (!date) {
      errs.date = "Date is required";
    } else if (isPastDate(date)) {
      errs.date = "Date cannot be in the past";
    }
    if (!time) errs.time = "Time is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const data: AppointmentFormData = {
      patientName: patientName.trim(),
      professionalName: professionalName.trim(),
      date,
      time,
      typeId,
      sessions: isRepeatable ? Math.max(1, sessions) : 1,
      notes: notes.trim() || undefined,
    };
    logger.info("Submitting appointment", { date, typeId, sessions: data.sessions });
    await logAppointmentCreated(date);
    onSubmit(data);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onCancel();
  };

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className={styles.modal}>
        <h2 id="form-title" className={styles.title}>
          New Appointment
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Patient Name */}
          <div className={styles.field}>
            <label htmlFor="patientName" className={styles.label}>
              Patient Name <span className={styles.required}>*</span>
            </label>
            <input
              id="patientName"
              ref={firstInputRef}
              type="text"
              className={`${styles.input} ${errors.patientName ? styles.inputError : ""}`}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              maxLength={100}
              autoComplete="off"
            />
            {errors.patientName && (
              <span className={styles.error} role="alert">
                {errors.patientName}
              </span>
            )}
          </div>

          {/* Professional Name */}
          <div className={styles.field}>
            <label htmlFor="professionalName" className={styles.label}>
              Professional Name <span className={styles.required}>*</span>
            </label>
            <input
              id="professionalName"
              type="text"
              className={`${styles.input} ${errors.professionalName ? styles.inputError : ""}`}
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              maxLength={100}
              autoComplete="off"
            />
            {errors.professionalName && (
              <span className={styles.error} role="alert">
                {errors.professionalName}
              </span>
            )}
          </div>

          {/* Appointment Type */}
          <div className={styles.field}>
            <label htmlFor="appointmentType" className={styles.label}>
              Appointment Type <span className={styles.required}>*</span>
            </label>
            <select
              id="appointmentType"
              className={styles.input}
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              aria-label="Appointment type"
            >
              {appointmentTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sessions (only for repeatable types) */}
          {isRepeatable && (
            <div className={styles.field}>
              <label htmlFor="sessions" className={styles.label}>
                Sessions <span className={styles.required}>*</span>
              </label>
              <input
                id="sessions"
                type="number"
                className={styles.input}
                value={sessions}
                min={1}
                max={selectedType?.maxSessions ?? 10}
                onChange={(e) => setSessions(Number(e.target.value))}
                aria-label="Number of sessions"
              />
              <span className={styles.hint}>
                {sessions} session{sessions !== 1 ? "s" : ""} on consecutive available days (max{" "}
                {selectedType?.maxSessions})
              </span>
            </div>
          )}

          {/* Date + Time row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="date" className={styles.label}>
                {isRepeatable ? "Start Date" : "Date"} <span className={styles.required}>*</span>
              </label>
              <input
                id="date"
                type="date"
                className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
                value={date}
                min={todayKey()}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <span className={styles.error} role="alert">
                  {errors.date}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="time" className={styles.label}>
                Time <span className={styles.required}>*</span>
              </label>
              <input
                id="time"
                type="time"
                className={`${styles.input} ${errors.time ? styles.inputError : ""}`}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              {errors.time && (
                <span className={styles.error} role="alert">
                  {errors.time}
                </span>
              )}
            </div>
          </div>

          {/* Schedule warnings */}
          {scheduleWarnings.length > 0 && (
            <div className={styles.warning} role="note" aria-live="polite">
              {scheduleWarnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className={styles.field}>
            <label htmlFor="notes" className={styles.label}>
              Notes
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              {isRepeatable && sessions > 1 ? `Save ${sessions} Sessions` : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

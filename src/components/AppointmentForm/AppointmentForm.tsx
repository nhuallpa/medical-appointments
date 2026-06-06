"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { AppointmentFormData } from "@/types/appointment";
import { logAppointmentCreated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import styles from "./AppointmentForm.module.css";

const logger = createLogger("AppointmentForm");

interface AppointmentFormProps {
  initialDate?: string;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
}

interface FormErrors {
  patientName?: string;
  professionalName?: string;
  date?: string;
  time?: string;
}

export function AppointmentForm({ initialDate, onSubmit, onCancel }: AppointmentFormProps) {
  const [patientName, setPatientName] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [date, setDate] = useState(initialDate ?? "");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const firstInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!patientName.trim()) errs.patientName = "Patient name is required";
    if (!professionalName.trim()) errs.professionalName = "Professional name is required";
    if (!date) errs.date = "Date is required";
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
      notes: notes.trim() || undefined,
    };
    logger.info("Submitting appointment", { date });
    await logAppointmentCreated(date);
    onSubmit(data);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onCancel();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className={styles.modal}>
        <h2 id="form-title" className={styles.title}>New Appointment</h2>

        <form onSubmit={handleSubmit} noValidate>
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
              <span className={styles.error} role="alert">{errors.patientName}</span>
            )}
          </div>

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
              <span className={styles.error} role="alert">{errors.professionalName}</span>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="date" className={styles.label}>
                Date <span className={styles.required}>*</span>
              </label>
              <input
                id="date"
                type="date"
                className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <span className={styles.error} role="alert">{errors.date}</span>
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
                <span className={styles.error} role="alert">{errors.time}</span>
              )}
            </div>
          </div>

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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

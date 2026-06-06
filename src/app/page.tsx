"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar } from "@/components/Calendar/Calendar";
import { AppointmentForm } from "@/components/AppointmentForm/AppointmentForm";
import { AppointmentDetail } from "@/components/AppointmentDetail/AppointmentDetail";
import { useAppointments } from "@/hooks/useAppointments";
import { logPageView } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import type { Appointment, AppointmentFormData } from "@/types/appointment";
import styles from "./page.module.css";

const logger = createLogger("page");

export default function Home() {
  const { addAppointment, deleteAppointment, selectAppointment, clearSelection, selectedAppointment } =
    useAppointments();

  const [formOpen, setFormOpen] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    logPageView("calendar");
    logger.info("Calendar page mounted");
  }, []);

  const handleAddClick = useCallback((date: string) => {
    setFormInitialDate(date);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: AppointmentFormData) => {
      addAppointment(data);
      setFormOpen(false);
      setFormInitialDate(undefined);
      logger.info("Appointment added", { date: data.date });
    },
    [addAppointment]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setFormInitialDate(undefined);
  }, []);

  const handleAppointmentClick = useCallback(
    (appointment: Appointment) => {
      selectAppointment(appointment);
    },
    [selectAppointment]
  );

  const handleDetailClose = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteAppointment(id);
      logger.info("Appointment deleted", { id });
    },
    [deleteAppointment]
  );

  return (
    <main className={styles.main}>
      <Calendar onAddClick={handleAddClick} onAppointmentClick={handleAppointmentClick} />

      {formOpen && (
        <AppointmentForm
          initialDate={formInitialDate}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onDelete={handleDelete}
          onClose={handleDetailClose}
        />
      )}
    </main>
  );
}

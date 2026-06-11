"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Calendar } from "@/components/Calendar/Calendar";
import { AppointmentForm } from "@/components/AppointmentForm/AppointmentForm";
import { AppointmentDetail } from "@/components/AppointmentDetail/AppointmentDetail";
import { useAppointments } from "@/hooks/useAppointments";
import { logPageView, logAppointmentSeriesCreated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import type { Appointment, AppointmentFormData } from "@/types/appointment";
import styles from "./page.module.css";

const logger = createLogger("page");

export default function Home() {
  const {
    addAppointment,
    addAppointmentSeries,
    deleteAppointment,
    deleteSeries,
    selectAppointment,
    clearSelection,
    selectedAppointment,
    appointmentTypes,
    scheduleConfig,
  } = useAppointments();

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
    async (data: AppointmentFormData) => {
      const selectedType = appointmentTypes.find((t) => t.id === data.typeId);
      const isSeries = (selectedType?.repeatable ?? false) && data.sessions > 1;

      if (isSeries) {
        addAppointmentSeries(data);
        logger.info("Appointment series created", { sessions: data.sessions, typeId: data.typeId });
        await logAppointmentSeriesCreated(data.typeId, data.sessions);
      } else {
        addAppointment(data);
        logger.info("Appointment added", { date: data.date });
      }

      setFormOpen(false);
      setFormInitialDate(undefined);
    },
    [addAppointment, addAppointmentSeries, appointmentTypes]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setFormInitialDate(undefined);
  }, []);

  const handleAppointmentClick = useCallback(
    (appointment: Appointment) => selectAppointment(appointment),
    [selectAppointment]
  );

  const handleDetailClose = useCallback(() => clearSelection(), [clearSelection]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteAppointment(id);
      clearSelection();
      logger.info("Appointment deleted", { id });
    },
    [deleteAppointment, clearSelection]
  );

  const handleDeleteSeries = useCallback(
    (seriesId: string) => {
      deleteSeries(seriesId);
      logger.info("Series deleted", { seriesId });
    },
    [deleteSeries]
  );

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href="/settings" className={styles.settingsLink}>
          ⚙ Settings
        </Link>
      </div>

      <Calendar onAddClick={handleAddClick} onAppointmentClick={handleAppointmentClick} />

      {formOpen && (
        <AppointmentForm
          initialDate={formInitialDate}
          appointmentTypes={appointmentTypes}
          scheduleConfig={scheduleConfig}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          appointmentTypes={appointmentTypes}
          onDelete={handleDelete}
          onDeleteSeries={handleDeleteSeries}
          onClose={handleDetailClose}
        />
      )}
    </main>
  );
}

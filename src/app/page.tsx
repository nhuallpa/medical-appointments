"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Calendar } from "@/components/Calendar/Calendar";
import { DayView } from "@/components/DayView/DayView";
import { ViewTabs } from "@/components/ViewTabs/ViewTabs";
import { AppointmentForm } from "@/components/AppointmentForm/AppointmentForm";
import { AppointmentDetail } from "@/components/AppointmentDetail/AppointmentDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { useAppointments } from "@/hooks/useAppointments";
import { useTranslation } from "@/i18n/LocaleContext";
import { logPageView, logAppointmentSeriesCreated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import { toDateKey } from "@/utils/dateUtils";
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
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    navigateDay,
    timeSlots,
  } = useAppointments();
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<string | undefined>(undefined);
  const [formInitialTime, setFormInitialTime] = useState<string | undefined>(undefined);

  useEffect(() => {
    logPageView("calendar");
    logger.info("Calendar page mounted");
  }, []);

  const handleAddClick = useCallback((date: string) => {
    setFormInitialDate(date);
    setFormInitialTime(undefined);
    setFormOpen(true);
  }, []);

  const handleSlotAddClick = useCallback((date: string, time: string) => {
    setFormInitialDate(date);
    setFormInitialTime(time);
    setFormOpen(true);
  }, []);

  const handlePrevDay = useCallback(() => navigateDay("prev"), [navigateDay]);
  const handleNextDay = useCallback(() => navigateDay("next"), [navigateDay]);
  const handleDayToday = useCallback(() => {
    setCurrentDate(toDateKey(new Date()));
  }, [setCurrentDate]);

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
      setFormInitialTime(undefined);
    },
    [addAppointment, addAppointmentSeries, appointmentTypes]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setFormInitialDate(undefined);
    setFormInitialTime(undefined);
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
        <LanguageSwitcher />
        <Link href="/settings" className={styles.settingsLink}>
          ⚙ {t("nav.settings")}
        </Link>
      </div>

      <ViewTabs active={viewMode} onChange={setViewMode} />

      {viewMode === "calendar" ? (
        <Calendar onAddClick={handleAddClick} onAppointmentClick={handleAppointmentClick} />
      ) : (
        <DayView
          date={currentDate}
          timeSlots={timeSlots}
          appointmentTypes={appointmentTypes}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onToday={handleDayToday}
          onAddClick={handleSlotAddClick}
          onAppointmentClick={handleAppointmentClick}
        />
      )}

      {formOpen && (
        <AppointmentForm
          initialDate={formInitialDate}
          initialTime={formInitialTime}
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

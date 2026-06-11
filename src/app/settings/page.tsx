"use client";

import Link from "next/link";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentTypeManager } from "@/components/AppointmentTypeManager/AppointmentTypeManager";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { ScheduleConfig } from "@/components/ScheduleConfig/ScheduleConfig";
import { useTranslation } from "@/i18n/LocaleContext";
import { createLogger } from "@/utils/logger";
import styles from "./settings.module.css";

const logger = createLogger("SettingsPage");

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    appointmentTypes,
    scheduleConfig,
    addAppointmentType,
    deleteAppointmentType,
    updateScheduleConfig,
  } = useAppointments();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink} aria-label={t("settings.backToCalendarAriaLabel")}>
          ← {t("settings.backToCalendar")}
        </Link>
        <h1 className={styles.title}>{t("settings.title")}</h1>
        <LanguageSwitcher />
      </div>

      <div className={styles.panels}>
        <section aria-label={t("appointmentTypeManager.title")}>
          <AppointmentTypeManager
            types={appointmentTypes}
            onAdd={(type) => {
              logger.info("Appointment type added from settings", { name: type.name });
              addAppointmentType(type);
            }}
            onDelete={(id) => {
              logger.info("Appointment type deleted from settings", { id });
              deleteAppointmentType(id);
            }}
          />
        </section>

        <section aria-label={t("scheduleConfig.title")}>
          <ScheduleConfig
            config={scheduleConfig}
            onSave={(config) => {
              logger.info("Schedule config updated", config);
              updateScheduleConfig(config);
            }}
          />
        </section>
      </div>
    </main>
  );
}

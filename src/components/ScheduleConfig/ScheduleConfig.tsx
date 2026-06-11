"use client";

import { useState } from "react";
import type { ScheduleConfig as ScheduleConfigType } from "@/types/appointment";
import { logScheduleConfigUpdated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import { useTranslation } from "@/i18n/LocaleContext";
import styles from "./ScheduleConfig.module.css";

const logger = createLogger("ScheduleConfig");

interface ScheduleConfigProps {
  config: ScheduleConfigType;
  onSave: (config: ScheduleConfigType) => void;
}

export function ScheduleConfig({ config, onSave }: ScheduleConfigProps) {
  const { t, messages } = useTranslation();
  const [enabledDays, setEnabledDays] = useState<number[]>(config.enabledDays);
  const [startTime, setStartTime] = useState(config.startTime);
  const [endTime, setEndTime] = useState(config.endTime);
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(config.slotIntervalMinutes ?? 30);

  const toggleDay = (dow: number) => {
    setEnabledDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    const updated: ScheduleConfigType = { enabledDays, startTime, endTime, slotIntervalMinutes };
    logger.info("Saving schedule config", updated);
    await logScheduleConfigUpdated();
    onSave(updated);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>{t("scheduleConfig.title")}</h3>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>{t("scheduleConfig.availableDays")}</p>
        <div className={styles.dayGrid}>
          {messages.scheduleConfig.dayNames.map((label, dow) => (
            <label key={dow} className={styles.dayLabel}>
              <input
                type="checkbox"
                checked={enabledDays.includes(dow)}
                onChange={() => toggleDay(dow)}
                aria-label={label}
              />
              <span className={styles.dayName}>{label.slice(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>{t("scheduleConfig.consultationHours")}</p>
        <div className={styles.timeRow}>
          <div className={styles.timeField}>
            <label htmlFor="startTime" className={styles.timeLabel}>
              {t("scheduleConfig.startTime")}
            </label>
            <input
              id="startTime"
              type="time"
              className={styles.timeInput}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <span className={styles.timeSep}>—</span>
          <div className={styles.timeField}>
            <label htmlFor="endTime" className={styles.timeLabel}>
              {t("scheduleConfig.endTime")}
            </label>
            <input
              id="endTime"
              type="time"
              className={styles.timeInput}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className={styles.timeField}>
            <label htmlFor="slotInterval" className={styles.timeLabel}>
              {t("scheduleConfig.slotInterval")}
            </label>
            <select
              id="slotInterval"
              className={styles.timeInput}
              value={slotIntervalMinutes}
              onChange={(e) => setSlotIntervalMinutes(Number(e.target.value))}
            >
              <option value={15}>{t("scheduleConfig.minutes", { count: 15 })}</option>
              <option value={30}>{t("scheduleConfig.minutes", { count: 30 })}</option>
              <option value={45}>{t("scheduleConfig.minutes", { count: 45 })}</option>
              <option value={60}>{t("scheduleConfig.minutes", { count: 60 })}</option>
            </select>
          </div>
        </div>
      </div>

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        aria-label={t("scheduleConfig.saveConfigurationAriaLabel")}
      >
        {t("scheduleConfig.saveConfiguration")}
      </button>
    </div>
  );
}

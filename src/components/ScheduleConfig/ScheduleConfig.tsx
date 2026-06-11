"use client";

import { useState } from "react";
import type { ScheduleConfig as ScheduleConfigType } from "@/types/appointment";
import { logScheduleConfigUpdated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import styles from "./ScheduleConfig.module.css";

const logger = createLogger("ScheduleConfig");

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScheduleConfigProps {
  config: ScheduleConfigType;
  onSave: (config: ScheduleConfigType) => void;
}

export function ScheduleConfig({ config, onSave }: ScheduleConfigProps) {
  const [enabledDays, setEnabledDays] = useState<number[]>(config.enabledDays);
  const [startTime, setStartTime] = useState(config.startTime);
  const [endTime, setEndTime] = useState(config.endTime);

  const toggleDay = (dow: number) => {
    setEnabledDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    const updated: ScheduleConfigType = { enabledDays, startTime, endTime };
    logger.info("Saving schedule config", updated);
    await logScheduleConfigUpdated();
    onSave(updated);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Schedule Configuration</h3>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Available Days</p>
        <div className={styles.dayGrid}>
          {DAY_LABELS.map((label, dow) => (
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
        <p className={styles.sectionLabel}>Consultation Hours</p>
        <div className={styles.timeRow}>
          <div className={styles.timeField}>
            <label htmlFor="startTime" className={styles.timeLabel}>
              Start Time
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
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              className={styles.timeInput}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button className={styles.saveBtn} onClick={handleSave} aria-label="Save schedule configuration">
        Save Configuration
      </button>
    </div>
  );
}

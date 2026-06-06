"use client";

import { formatMonthLabel } from "@/utils/dateUtils";
import { logMonthNavigated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import styles from "./CalendarHeader.module.css";

const logger = createLogger("CalendarHeader");

interface CalendarHeaderProps {
  year: number;
  month: number; // 0-indexed
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({ year, month, onPrev, onNext, onToday }: CalendarHeaderProps) {
  const handlePrev = () => {
    logMonthNavigated("prev");
    logger.debug("navigated prev");
    onPrev();
  };

  const handleNext = () => {
    logMonthNavigated("next");
    logger.debug("navigated next");
    onNext();
  };

  const handleToday = () => {
    logMonthNavigated("today");
    logger.debug("navigated to today");
    onToday();
  };

  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{formatMonthLabel(year, month)}</h1>
      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={handlePrev} aria-label="Previous month">
          ‹
        </button>
        <button className={styles.todayBtn} onClick={handleToday} aria-label="Go to today">
          Today
        </button>
        <button className={styles.navBtn} onClick={handleNext} aria-label="Next month">
          ›
        </button>
      </div>
    </div>
  );
}

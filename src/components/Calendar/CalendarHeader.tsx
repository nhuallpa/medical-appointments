"use client";

import { formatMonthLabel } from "@/utils/dateUtils";
import { useTranslation } from "@/i18n/LocaleContext";
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
  const { t, locale } = useTranslation();

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
      <h1 className={styles.title}>{formatMonthLabel(year, month, locale)}</h1>
      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={handlePrev} aria-label={t("calendar.previousMonth")}>
          ‹
        </button>
        <button className={styles.todayBtn} onClick={handleToday} aria-label={t("common.goToToday")}>
          {t("common.today")}
        </button>
        <button className={styles.navBtn} onClick={handleNext} aria-label={t("calendar.nextMonth")}>
          ›
        </button>
      </div>
    </div>
  );
}

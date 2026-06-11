"use client";

import type { ViewMode } from "@/types/appointment";
import { useTranslation } from "@/i18n/LocaleContext";
import styles from "./ViewTabs.module.css";

interface ViewTabsProps {
  active: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const TABS: { mode: ViewMode; labelKey: "viewTabs.calendar" | "viewTabs.day" }[] = [
  { mode: "calendar", labelKey: "viewTabs.calendar" },
  { mode: "day", labelKey: "viewTabs.day" },
];

export function ViewTabs({ active, onChange }: ViewTabsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.tablist} role="tablist">
      {TABS.map(({ mode, labelKey }) => (
        <button
          key={mode}
          role="tab"
          type="button"
          aria-selected={active === mode}
          className={`${styles.tab} ${active === mode ? styles.active : ""}`}
          onClick={() => onChange(mode)}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}

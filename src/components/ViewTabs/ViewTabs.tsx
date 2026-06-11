"use client";

import type { ViewMode } from "@/types/appointment";
import styles from "./ViewTabs.module.css";

interface ViewTabsProps {
  active: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const TABS: { mode: ViewMode; label: string }[] = [
  { mode: "calendar", label: "Calendar" },
  { mode: "day", label: "Day" },
];

export function ViewTabs({ active, onChange }: ViewTabsProps) {
  return (
    <div className={styles.tablist} role="tablist">
      {TABS.map(({ mode, label }) => (
        <button
          key={mode}
          role="tab"
          type="button"
          aria-selected={active === mode}
          className={`${styles.tab} ${active === mode ? styles.active : ""}`}
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

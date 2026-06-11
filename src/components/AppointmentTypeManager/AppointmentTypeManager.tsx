"use client";

import { useState } from "react";
import type { AppointmentType } from "@/types/appointment";
import { logAppointmentTypeCreated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import styles from "./AppointmentTypeManager.module.css";

const logger = createLogger("AppointmentTypeManager");

interface AppointmentTypeManagerProps {
  types: AppointmentType[];
  onAdd: (type: Omit<AppointmentType, "id">) => void;
  onDelete: (id: string) => void;
}

export function AppointmentTypeManager({ types, onAdd, onDelete }: AppointmentTypeManagerProps) {
  const [name, setName] = useState("");
  const [repeatable, setRepeatable] = useState(false);
  const [maxSessions, setMaxSessions] = useState(5);
  const [nameError, setNameError] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) {
      setNameError("Type name is required");
      return;
    }
    setNameError("");
    const newType = { name: name.trim(), repeatable, maxSessions: repeatable ? maxSessions : 1 };
    logger.info("Adding appointment type", { name: newType.name });
    await logAppointmentTypeCreated(newType.name);
    onAdd(newType);
    setName("");
    setRepeatable(false);
    setMaxSessions(5);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Appointment Types</h3>

      <ul className={styles.typeList}>
        {types.map((t) => (
          <li key={t.id} className={styles.typeItem}>
            <div className={styles.typeInfo}>
              <span className={styles.typeName}>{t.name}</span>
              {t.repeatable ? (
                <span className={`${styles.badge} ${styles.badgeRepeatable}`}>
                  Repeatable · {t.maxSessions} sessions
                </span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeIndividual}`}>Individual</span>
              )}
            </div>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(t.id)}
              aria-label={`Delete ${t.name}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.addForm}>
        <h4 className={styles.addTitle}>Add New Type</h4>

        <div className={styles.field}>
          <label htmlFor="typeName" className={styles.label}>
            Type Name
          </label>
          <input
            id="typeName"
            type="text"
            className={`${styles.input} ${nameError ? styles.inputError : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Physical Therapy"
            maxLength={60}
          />
          {nameError && <span className={styles.error} role="alert">{nameError}</span>}
        </div>

        <div className={styles.checkRow}>
          <input
            id="typeRepeatable"
            type="checkbox"
            checked={repeatable}
            onChange={(e) => setRepeatable(e.target.checked)}
          />
          <label htmlFor="typeRepeatable" className={styles.checkLabel}>
            Repeatable
          </label>
        </div>

        {repeatable && (
          <div className={styles.field}>
            <label htmlFor="maxSessions" className={styles.label}>
              Max Sessions
            </label>
            <input
              id="maxSessions"
              type="number"
              className={styles.input}
              value={maxSessions}
              min={2}
              max={30}
              onChange={(e) => setMaxSessions(Number(e.target.value))}
            />
          </div>
        )}

        <button className={styles.addBtn} onClick={handleAdd}>
          Add Type
        </button>
      </div>
    </div>
  );
}

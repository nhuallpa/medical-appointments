"use client";

import { useState } from "react";
import type { AppointmentType } from "@/types/appointment";
import { logAppointmentTypeCreated } from "@/lib/analytics";
import { createLogger } from "@/utils/logger";
import { useTranslation } from "@/i18n/LocaleContext";
import styles from "./AppointmentTypeManager.module.css";

const logger = createLogger("AppointmentTypeManager");

interface AppointmentTypeManagerProps {
  types: AppointmentType[];
  onAdd: (type: Omit<AppointmentType, "id">) => void;
  onDelete: (id: string) => void;
}

export function AppointmentTypeManager({ types, onAdd, onDelete }: AppointmentTypeManagerProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [repeatable, setRepeatable] = useState(false);
  const [maxSessions, setMaxSessions] = useState(5);
  const [nameError, setNameError] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) {
      setNameError(t("validation.typeNameRequired"));
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
      <h3 className={styles.sectionTitle}>{t("appointmentTypeManager.title")}</h3>

      <ul className={styles.typeList}>
        {types.map((type) => (
          <li key={type.id} className={styles.typeItem}>
            <div className={styles.typeInfo}>
              <span className={styles.typeName}>{type.name}</span>
              {type.repeatable ? (
                <span className={`${styles.badge} ${styles.badgeRepeatable}`}>
                  {t("appointmentTypeManager.repeatableBadge", { max: type.maxSessions })}
                </span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeIndividual}`}>
                  {t("appointmentTypeManager.individualBadge")}
                </span>
              )}
            </div>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(type.id)}
              aria-label={t("appointmentTypeManager.deleteAriaLabel", { name: type.name })}
            >
              {t("common.delete")}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.addForm}>
        <h4 className={styles.addTitle}>{t("appointmentTypeManager.addNewType")}</h4>

        <div className={styles.field}>
          <label htmlFor="typeName" className={styles.label}>
            {t("appointmentTypeManager.typeName")}
          </label>
          <input
            id="typeName"
            type="text"
            className={`${styles.input} ${nameError ? styles.inputError : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("appointmentTypeManager.typeNamePlaceholder")}
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
            {t("appointmentTypeManager.repeatable")}
          </label>
        </div>

        {repeatable && (
          <div className={styles.field}>
            <label htmlFor="maxSessions" className={styles.label}>
              {t("appointmentTypeManager.maxSessions")}
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
          {t("appointmentTypeManager.addType")}
        </button>
      </div>
    </div>
  );
}

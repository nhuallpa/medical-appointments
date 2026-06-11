"use client";

import { SUPPORTED_LOCALES, type Locale } from "@/i18n/locale";
import { useLocale, useTranslation, type TranslationKey } from "@/i18n/LocaleContext";
import styles from "./LanguageSwitcher.module.css";

const LOCALE_LABEL_KEYS: Record<Locale, TranslationKey> = {
  en: "languageSwitcher.english",
  es: "languageSwitcher.spanish",
  pt: "languageSwitcher.portuguese",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <select
      className={styles.select}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      aria-label={t("languageSwitcher.label")}
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {t(LOCALE_LABEL_KEYS[loc])}
        </option>
      ))}
    </select>
  );
}

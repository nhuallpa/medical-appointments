# Phase 1 Data Model: Multilingual UI (i18n with Automatic Detection)

This feature introduces no new domain/business entities (appointments, schedules, and
appointment types are unchanged from feature 001/003). It adds two small,
client-side-only concepts that live alongside — not inside — `AppointmentContext`.

## Locale

The supported UI languages.

```ts
type Locale = "en" | "es" | "pt";
```

- `SUPPORTED_LOCALES: Locale[] = ["en", "es", "pt"]`
- `DEFAULT_LOCALE: Locale = "en"` (per FR-003 / Assumptions)

## LanguagePreference

Represents the user's active and persisted language choice. Held in `LocaleContext`
state (not in `AppointmentContext`'s reducer, and not part of its in-memory appointment
data).

| Field      | Type                  | Description                                                                 |
|------------|-----------------------|------------------------------------------------------------------------------|
| `locale`   | `Locale`               | The currently active UI language.                                            |
| `source`   | `"auto" \| "manual"`   | Whether `locale` came from browser detection or an explicit user selection.  |

**State transitions**:

1. On mount: `localStorage["medical-appointments.locale"]` is read.
   - If it holds a valid `Locale` → `{ locale: <stored>, source: "manual" }`.
   - Otherwise → detect from `navigator.languages`/`navigator.language`, map to a
     supported locale or `DEFAULT_LOCALE` → `{ locale: <detected>, source: "auto" }`.
2. On manual switch (`setLocale(newLocale)`): state becomes
   `{ locale: newLocale, source: "manual" }` and `newLocale` is written to
   `localStorage["medical-appointments.locale"]`.
3. Detection (step 1, auto branch) never writes to `localStorage` — only an explicit
   user choice persists (FR-007).

**Validation rules**:

- `locale` MUST always be one of `SUPPORTED_LOCALES`.
- A value read from `localStorage` that is not in `SUPPORTED_LOCALES` is treated as
  absent (falls through to detection).

## Translations (Translation Resource)

A static, compile-time dictionary per locale, not user data. One module per locale under
`src/i18n/translations/{en,es,pt}.ts`, all conforming to the same `Translations` type
(inferred from `en.ts`, the reference/source language per the spec's Assumptions).

Top-level namespaces (one per UI area, mirroring `src/components/*` and `src/app/*`):

| Namespace               | Covers                                                              |
|--------------------------|----------------------------------------------------------------------|
| `common`                 | Shared words/actions: Save, Cancel, Delete, Edit, Close, Today, etc. |
| `nav`                    | Top bar / settings link                                              |
| `viewTabs`               | Calendar / Day tab labels                                            |
| `calendar`               | Monthly calendar view, header navigation                             |
| `dayView`                | Day view, time slots, day navigation                                 |
| `appointmentForm`        | Create/edit appointment form fields, labels, helper text             |
| `appointmentDetail`      | Appointment detail panel, delete confirmations                       |
| `appointmentTypeManager` | Appointment type list/management UI                                  |
| `scheduleConfig`         | Schedule configuration screen (working days, hours, slot interval)   |
| `settings`               | Settings page chrome                                                 |
| `validation`             | Form validation / error messages                                     |
| `languageSwitcher`       | Labels for the language switcher control itself                      |

**Lookup/fallback contract** (`t(key)` in `useTranslation()`):

1. Resolve `key` (a dot-path, e.g. `"appointmentForm.fields.date"`) against the active
   locale's dictionary.
2. If the key resolves to a non-empty string, return it.
3. If the key is missing or `undefined` in the active locale, fall back to the same path
   in `en` (FR-009).
4. `en` is therefore required to have 100% key coverage; `es`/`pt` are validated against
   `en`'s shape via the shared `Translations` TypeScript type (a missing key in `es`/`pt`
   is a compile error, not a runtime fallback in normal operation).

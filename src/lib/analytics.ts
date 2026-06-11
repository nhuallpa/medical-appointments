"use client";

import { createLogger } from "@/utils/logger";

const logger = createLogger("analytics");

// Firebase is only initialized when environment variables are present.
// Add NEXT_PUBLIC_FIREBASE_* keys to .env.local to enable analytics.
let logEventFn: ((name: string, params?: Record<string, unknown>) => void) | null = null;

async function getLogEvent() {
  if (logEventFn) return logEventFn;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !appId || !measurementId) {
    logger.debug("Firebase env vars not configured — analytics disabled");
    return null;
  }

  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getAnalytics, logEvent } = await import("firebase/analytics");

    const firebaseConfig = {
      apiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId,
      measurementId,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const analytics = getAnalytics(app);

    logEventFn = (name, params) => logEvent(analytics, name, params);
    return logEventFn;
  } catch (err) {
    logger.error("Failed to initialize Firebase Analytics", err);
    return null;
  }
}

async function track(name: string, params?: Record<string, unknown>) {
  const logEvent = await getLogEvent();
  if (!logEvent) return;
  logEvent(name, params);
  logger.debug(`event: ${name}`, params);
}

export async function logPageView(page: string) {
  await track("page_view", { page });
}

export async function logMonthNavigated(direction: "prev" | "next" | "today") {
  await track("month_navigated", { direction });
}

export async function logAppointmentCreated(date: string) {
  await track("appointment_created", { date });
}

export async function logAppointmentDeleted(id: string) {
  await track("appointment_deleted", { appointment_id: id });
}

export async function logAppointmentTypeCreated(name: string) {
  await track("appointment_type_created", { type_name: name });
}

export async function logAppointmentSeriesCreated(typeId: string, sessions: number) {
  await track("appointment_series_created", { type_id: typeId, sessions });
}

export async function logAppointmentSeriesDeleted(seriesId: string) {
  await track("appointment_series_deleted", { series_id: seriesId });
}

export async function logScheduleConfigUpdated() {
  await track("schedule_config_updated");
}

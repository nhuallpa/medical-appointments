import type { Appointment, ScheduleConfig, TimeSlot } from "@/types/appointment";
import { toDateKey } from "./dateUtils";

export function getDefaultSchedule(): ScheduleConfig {
  return {
    enabledDays: [1, 2, 3, 4, 5], // Mon–Fri
    startTime: "08:00",
    endTime: "18:00",
    slotIntervalMinutes: 30,
  };
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Generates time slots from startTime (inclusive) to endTime (exclusive), stepping by
 * intervalMinutes. The final slot is included even if it covers a shorter period than
 * intervalMinutes. Each appointment is assigned to the latest slot whose time is
 * <= the appointment's time, or to the first slot if it is earlier than all slots.
 * Returns [] if startTime >= endTime or intervalMinutes <= 0.
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number,
  appointments: Appointment[]
): TimeSlot[] {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  if (intervalMinutes <= 0 || startMinutes >= endMinutes) return [];

  const slots: TimeSlot[] = [];
  for (let m = startMinutes; m < endMinutes; m += intervalMinutes) {
    slots.push({ time: minutesToTime(m), appointments: [] });
  }

  for (const appt of appointments) {
    const apptMinutes = timeToMinutes(appt.time);
    let target = slots[0];
    for (const slot of slots) {
      if (timeToMinutes(slot.time) <= apptMinutes) {
        target = slot;
      } else {
        break;
      }
    }
    target.appointments.push(appt);
  }

  return slots;
}

export function isDateEnabled(dateKey: string, enabledDays: number[]): boolean {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dow = new Date(year, month - 1, day).getDay();
  return enabledDays.includes(dow);
}

export function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  return time >= startTime && time <= endTime;
}

/** Returns true if dateKey is strictly before today (local date). */
export function isPastDate(dateKey: string): boolean {
  return dateKey < toDateKey(new Date());
}

/**
 * Generates `sessions` consecutive enabled-day dates starting from (and including)
 * startDate. Days not in enabledDays are skipped. startDate itself is included as
 * day 1 when it falls on an enabled day; otherwise the next enabled day is day 1.
 */
export function generateSeriesDates(
  startDate: string,
  sessions: number,
  enabledDays: number[]
): string[] {
  if (sessions <= 0 || enabledDays.length === 0) return [];

  const dates: string[] = [];
  const [year, month, day] = startDate.split("-").map(Number);
  const cursor = new Date(year, month - 1, day);

  while (dates.length < sessions) {
    const key = toDateKey(cursor);
    if (isDateEnabled(key, enabledDays)) {
      dates.push(key);
    }
    cursor.setDate(cursor.getDate() + 1);

    // Safety cap: prevent infinite loop when enabledDays is empty or sessions is absurd
    if (cursor.getFullYear() - year > 5) break;
  }

  return dates;
}

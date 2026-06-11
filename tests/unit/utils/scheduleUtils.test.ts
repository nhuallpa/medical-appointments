import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDefaultSchedule,
  isDateEnabled,
  isTimeInRange,
  isPastDate,
  generateSeriesDates,
  generateTimeSlots,
} from "@/utils/scheduleUtils";
import type { Appointment } from "@/types/appointment";

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: `appt-${Math.random()}`,
    patientName: "Ana García",
    professionalName: "Dr. López",
    date: "2026-06-10",
    time: "09:00",
    typeId: "type-general",
    createdAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getDefaultSchedule", () => {
  it("returns Mon-Fri as enabled days", () => {
    expect(getDefaultSchedule().enabledDays).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns 08:00–18:00 time range", () => {
    const s = getDefaultSchedule();
    expect(s.startTime).toBe("08:00");
    expect(s.endTime).toBe("18:00");
  });

  it("returns a 30-minute slot interval by default", () => {
    expect(getDefaultSchedule().slotIntervalMinutes).toBe(30);
  });
});

describe("isDateEnabled", () => {
  it("returns true for a Monday when Mon-Fri enabled", () => {
    // 2026-06-01 is a Monday
    expect(isDateEnabled("2026-06-01", [1, 2, 3, 4, 5])).toBe(true);
  });

  it("returns false for a Sunday when Mon-Fri enabled", () => {
    // 2026-06-07 is a Sunday
    expect(isDateEnabled("2026-06-07", [1, 2, 3, 4, 5])).toBe(false);
  });

  it("returns true for Saturday when all days enabled", () => {
    expect(isDateEnabled("2026-06-06", [0, 1, 2, 3, 4, 5, 6])).toBe(true);
  });
});

describe("isTimeInRange", () => {
  it("returns true for a time within range", () => {
    expect(isTimeInRange("10:00", "08:00", "18:00")).toBe(true);
  });

  it("returns true for boundary start time", () => {
    expect(isTimeInRange("08:00", "08:00", "18:00")).toBe(true);
  });

  it("returns true for boundary end time", () => {
    expect(isTimeInRange("18:00", "08:00", "18:00")).toBe(true);
  });

  it("returns false for a time before start", () => {
    expect(isTimeInRange("07:59", "08:00", "18:00")).toBe(false);
  });

  it("returns false for a time after end", () => {
    expect(isTimeInRange("18:01", "08:00", "18:00")).toBe(false);
  });
});

describe("isPastDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 10, 12, 0, 0)); // June 10, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for yesterday", () => {
    expect(isPastDate("2026-06-09")).toBe(true);
  });

  it("returns false for today", () => {
    expect(isPastDate("2026-06-10")).toBe(false);
  });

  it("returns false for tomorrow", () => {
    expect(isPastDate("2026-06-11")).toBe(false);
  });
});

describe("generateSeriesDates", () => {
  it("generates the correct number of dates", () => {
    // 2026-06-01 is Monday
    const dates = generateSeriesDates("2026-06-01", 5, [1, 2, 3, 4, 5]);
    expect(dates).toHaveLength(5);
  });

  it("skips weekends when Mon-Fri enabled", () => {
    // Start Monday, need 6 dates → Fri is day 5, Mon (next week) is day 6
    const dates = generateSeriesDates("2026-06-01", 6, [1, 2, 3, 4, 5]);
    expect(dates).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
      "2026-06-08",
    ]);
  });

  it("includes startDate when it falls on an enabled day", () => {
    const dates = generateSeriesDates("2026-06-01", 1, [1, 2, 3, 4, 5]);
    expect(dates[0]).toBe("2026-06-01");
  });

  it("skips startDate and advances to next enabled day when startDate is disabled", () => {
    // 2026-06-07 is Sunday — not in Mon-Fri; first enabled day is Monday 2026-06-08
    const dates = generateSeriesDates("2026-06-07", 2, [1, 2, 3, 4, 5]);
    expect(dates[0]).toBe("2026-06-08");
    expect(dates[1]).toBe("2026-06-09");
  });

  it("crosses month boundary correctly", () => {
    // Start 2026-06-29 (Mon), 5 sessions → crosses into July
    const dates = generateSeriesDates("2026-06-29", 5, [1, 2, 3, 4, 5]);
    expect(dates).toContain("2026-07-01");
    expect(dates).toHaveLength(5);
  });

  it("returns empty array when sessions is 0", () => {
    expect(generateSeriesDates("2026-06-01", 0, [1, 2, 3, 4, 5])).toEqual([]);
  });

  it("returns empty array when no days enabled", () => {
    expect(generateSeriesDates("2026-06-01", 3, [])).toEqual([]);
  });
});

describe("generateTimeSlots", () => {
  it("generates evenly-spaced slots covering the full range", () => {
    const slots = generateTimeSlots("08:00", "18:00", 30, []);
    expect(slots).toHaveLength(20);
    expect(slots[0].time).toBe("08:00");
    expect(slots[slots.length - 1].time).toBe("17:30");
  });

  it("includes a final shorter slot when the interval does not evenly divide the range", () => {
    const slots = generateTimeSlots("08:00", "08:45", 30, []);
    expect(slots.map((s) => s.time)).toEqual(["08:00", "08:30"]);
  });

  it("returns an empty array when startTime equals endTime", () => {
    expect(generateTimeSlots("08:00", "08:00", 30, [])).toEqual([]);
  });

  it("returns an empty array when startTime is after endTime", () => {
    expect(generateTimeSlots("18:00", "08:00", 30, [])).toEqual([]);
  });

  it("returns an empty array when intervalMinutes is 0 or negative", () => {
    expect(generateTimeSlots("08:00", "18:00", 0, [])).toEqual([]);
    expect(generateTimeSlots("08:00", "18:00", -15, [])).toEqual([]);
  });

  it("assigns an appointment to the slot whose time matches exactly", () => {
    const appt = makeAppointment({ time: "09:00" });
    const slots = generateTimeSlots("08:00", "18:00", 30, [appt]);
    const slot = slots.find((s) => s.time === "09:00");
    expect(slot?.appointments).toEqual([appt]);
  });

  it("assigns an appointment to the latest slot whose time is <= the appointment time", () => {
    const appt = makeAppointment({ time: "09:15" });
    const slots = generateTimeSlots("08:00", "18:00", 30, [appt]);
    const slot900 = slots.find((s) => s.time === "09:00");
    const slot930 = slots.find((s) => s.time === "09:30");
    expect(slot900?.appointments).toEqual([appt]);
    expect(slot930?.appointments).toEqual([]);
  });

  it("assigns an appointment earlier than the first slot to the first slot", () => {
    const appt = makeAppointment({ time: "07:00" });
    const slots = generateTimeSlots("08:00", "18:00", 30, [appt]);
    expect(slots[0].appointments).toEqual([appt]);
  });

  it("groups multiple appointments within the same slot", () => {
    const appt1 = makeAppointment({ id: "a1", time: "10:05" });
    const appt2 = makeAppointment({ id: "a2", time: "10:25" });
    const slots = generateTimeSlots("08:00", "18:00", 30, [appt1, appt2]);
    const slot = slots.find((s) => s.time === "10:00");
    expect(slot?.appointments).toEqual([appt1, appt2]);
  });
});

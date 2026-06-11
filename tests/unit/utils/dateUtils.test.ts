import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateMonthGrid,
  toDateKey,
  formatMonthLabel,
  isToday,
} from "@/utils/dateUtils";
import type { Appointment } from "@/types/appointment";

const mockAppt = (date: string): Appointment => ({
  id: `id-${date}`,
  patientName: "Test Patient",
  professionalName: "Dr. Test",
  date,
  time: "10:00",
  createdAt: new Date().toISOString(),
});

describe("toDateKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toDateKey(new Date(2026, 5, 3))).toBe("2026-06-03");
  });

  it("zero-pads month and day", () => {
    expect(toDateKey(new Date(2026, 0, 9))).toBe("2026-01-09");
  });
});

describe("formatMonthLabel", () => {
  it("returns month name and year", () => {
    expect(formatMonthLabel(2026, 5, "en")).toBe("June 2026");
  });

  it("handles January correctly", () => {
    expect(formatMonthLabel(2026, 0, "en")).toBe("January 2026");
  });

  it("formats in Spanish", () => {
    expect(formatMonthLabel(2026, 5, "es")).toBe("junio de 2026");
  });

  it("formats in Portuguese", () => {
    expect(formatMonthLabel(2026, 5, "pt")).toBe("junho de 2026");
  });
});

describe("isToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0)); // June 5, 2026 noon local time
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for today", () => {
    expect(isToday("2026-06-05")).toBe(true);
  });

  it("returns false for another date", () => {
    expect(isToday("2026-06-04")).toBe(false);
  });
});

describe("generateMonthGrid", () => {
  it("returns rows of 7 columns", () => {
    const grid = generateMonthGrid(2026, 5, []);
    for (const row of grid) {
      expect(row).toHaveLength(7);
    }
  });

  it("includes all days of the month", () => {
    const grid = generateMonthGrid(2026, 5, []); // June 2026 has 30 days
    const dayCells = grid.flat().filter((c) => c.date !== null);
    expect(dayCells).toHaveLength(30);
  });

  it("starts on the correct weekday", () => {
    // June 2026 starts on Monday (index 1)
    const grid = generateMonthGrid(2026, 5, []);
    expect(grid[0][0].date).toBeNull(); // Sunday slot is blank
    expect(grid[0][1].date).toBe("2026-06-01");
  });

  it("assigns appointments to correct date cells", () => {
    const appt = mockAppt("2026-06-15");
    const grid = generateMonthGrid(2026, 5, [appt]);
    const cell = grid.flat().find((c) => c.date === "2026-06-15");
    expect(cell?.appointments).toHaveLength(1);
    expect(cell?.appointments[0].id).toBe("id-2026-06-15");
  });

  it("marks today cell with isToday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0)); // June 5, 2026 noon local time
    const grid = generateMonthGrid(2026, 5, []);
    const todayCell = grid.flat().find((c) => c.date === "2026-06-05");
    expect(todayCell?.isToday).toBe(true);
    vi.useRealTimers();
  });

  it("handles February in a leap year (29 days)", () => {
    const grid = generateMonthGrid(2024, 1, []);
    const dayCells = grid.flat().filter((c) => c.date !== null);
    expect(dayCells).toHaveLength(29);
  });

  it("handles December month boundary (roll to next year)", () => {
    const grid = generateMonthGrid(2026, 11, []);
    const dayCells = grid.flat().filter((c) => c.date !== null);
    expect(dayCells).toHaveLength(31);
    expect(dayCells[0].date).toBe("2026-12-01");
  });

  it("leaves cells without appointments with an empty array", () => {
    const grid = generateMonthGrid(2026, 5, []);
    const dayCells = grid.flat().filter((c) => c.date !== null);
    for (const cell of dayCells) {
      expect(cell.appointments).toHaveLength(0);
    }
  });
});

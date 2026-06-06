import type { Appointment, CalendarCell, CalendarGrid } from "@/types/appointment";

export function generateMonthGrid(
  year: number,
  month: number,
  appointments: Appointment[]
): CalendarGrid {
  const appointmentsByDate: Record<string, Appointment[]> = {};
  for (const appt of appointments) {
    if (!appointmentsByDate[appt.date]) {
      appointmentsByDate[appt.date] = [];
    }
    appointmentsByDate[appt.date].push(appt);
  }

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDateKey(new Date());

  const cells: CalendarCell[] = [];

  // Leading blank cells
  for (let i = 0; i < firstDay; i++) {
    cells.push({ date: null, isToday: false, appointments: [] });
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      date: dateKey,
      isToday: dateKey === todayKey,
      appointments: appointmentsByDate[dateKey] ?? [],
    });
  }

  // Trailing blank cells to complete the last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ date: null, isToday: false, appointments: [] });
    }
  }

  const grid: CalendarGrid = [];
  for (let row = 0; row < cells.length / 7; row++) {
    grid.push(cells.slice(row * 7, row * 7 + 7));
  }

  return grid;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey(new Date());
}

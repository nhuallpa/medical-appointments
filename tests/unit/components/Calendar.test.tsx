import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDay } from "@/components/Calendar/CalendarDay";
import { CalendarHeader } from "@/components/Calendar/CalendarHeader";
import type { Appointment, AppointmentType } from "@/types/appointment";

const mockTypes: AppointmentType[] = [
  { id: "t-dental", name: "Dental", repeatable: false, maxSessions: 1, color: "#3b82f6" },
];

const mockAppt: Appointment = {
  id: "appt-1",
  patientName: "Ana García",
  professionalName: "Dr. López",
  date: "2026-06-10",
  time: "09:00",
  typeId: "t-dental",
  createdAt: "2026-06-01T00:00:00.000Z",
};

// ──── CalendarDay ────────────────────────────────────────────────────────────

describe("CalendarDay", () => {
  it("renders the day number", () => {
    render(
      <CalendarDay
        date="2026-06-10"
        isToday={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders null date as an empty, non-interactive cell", () => {
    const { container } = render(
      <CalendarDay
        date={null}
        isToday={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("renders appointment items with patient name and time", () => {
    render(
      <CalendarDay
        date="2026-06-10"
        isToday={false}
        appointments={[mockAppt]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    expect(screen.getByText(/Ana García/)).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
  });

  it("calls onAppointmentClick when an appointment item is clicked", async () => {
    const onAppointmentClick = vi.fn();
    render(
      <CalendarDay
        date="2026-06-10"
        isToday={false}
        appointments={[mockAppt]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={onAppointmentClick}
      />
    );
    await userEvent.click(screen.getByText(/Ana García/));
    expect(onAppointmentClick).toHaveBeenCalledWith(mockAppt);
  });

  it("calls onAddClick with the date when the add button is clicked", async () => {
    const onAddClick = vi.fn();
    render(
      <CalendarDay
        date="2026-06-10"
        isToday={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={onAddClick}
        onAppointmentClick={vi.fn()}
      />
    );
    const addBtn = screen.getByRole("button", { name: /add/i });
    await userEvent.click(addBtn);
    expect(onAddClick).toHaveBeenCalledWith("2026-06-10");
  });

  it("marks the cell with data-today when isToday is true", () => {
    const { container } = render(
      <CalendarDay
        date="2026-06-10"
        isToday={true}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    expect(container.firstChild).toHaveAttribute("data-today", "true");
  });
});

// ──── CalendarHeader ─────────────────────────────────────────────────────────

describe("CalendarHeader", () => {
  it("renders the month and year label", () => {
    render(
      <CalendarHeader
        year={2026}
        month={5}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onToday={vi.fn()}
      />
    );
    expect(screen.getByText("June 2026")).toBeInTheDocument();
  });

  it("calls onPrev when prev button is clicked", async () => {
    const onPrev = vi.fn();
    render(
      <CalendarHeader year={2026} month={5} onPrev={onPrev} onNext={vi.fn()} onToday={vi.fn()} />
    );
    await userEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPrev).toHaveBeenCalled();
  });

  it("calls onNext when next button is clicked", async () => {
    const onNext = vi.fn();
    render(
      <CalendarHeader year={2026} month={5} onPrev={vi.fn()} onNext={onNext} onToday={vi.fn()} />
    );
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it("calls onToday when today button is clicked", async () => {
    const onToday = vi.fn();
    render(
      <CalendarHeader
        year={2026}
        month={5}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onToday={onToday}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /today/i }));
    expect(onToday).toHaveBeenCalled();
  });
});

// ──── Navigation action tests (US2) ─────────────────────────────────────────

describe("CalendarHeader — navigation callbacks are stable references", () => {
  it("renders three navigation buttons", () => {
    render(
      <CalendarHeader
        year={2026}
        month={5}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onToday={vi.fn()}
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
});

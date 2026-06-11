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
        isUnavailable={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
        onSelectDate={vi.fn()}
      />
    );
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders null date as an empty, non-interactive cell", () => {
    const { container } = render(
      <CalendarDay
        date={null}
        isToday={false}
        isUnavailable={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
        onSelectDate={vi.fn()}
      />
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("renders appointment items with patient name and time", () => {
    render(
      <CalendarDay
        date="2026-06-10"
        isToday={false}
        isUnavailable={false}
        appointments={[mockAppt]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
        onSelectDate={vi.fn()}
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
        isUnavailable={false}
        appointments={[mockAppt]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={onAppointmentClick}
        onSelectDate={vi.fn()}
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
        isUnavailable={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={onAddClick}
        onAppointmentClick={vi.fn()}
        onSelectDate={vi.fn()}
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
        isUnavailable={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
        onSelectDate={vi.fn()}
      />
    );
    expect(container.firstChild).toHaveAttribute("data-today", "true");
  });

  it("calls onSelectDate with the date when the day number is clicked", async () => {
    const onSelectDate = vi.fn();
    render(
      <CalendarDay
        date="2026-06-10"
        isToday={false}
        isUnavailable={false}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
        onSelectDate={onSelectDate}
      />
    );
    await userEvent.click(screen.getByText("10"));
    expect(onSelectDate).toHaveBeenCalledWith("2026-06-10");
  });
});

// ──── CalendarDay — unavailable days (US2) ──────────────────────────────────

describe("CalendarDay — unavailable days", () => {
  it("applies the unavailable class when isUnavailable is true", () => {
    const { container } = render(
      <CalendarDay
        date="2026-06-13"
        isToday={false}
        isUnavailable={true}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
        onSelectDate={vi.fn()}
      />
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/unavailable/);
  });

  it("still renders the date number, appointments, and a working add button when unavailable", async () => {
    const onAddClick = vi.fn();
    const onAppointmentClick = vi.fn();
    render(
      <CalendarDay
        date="2026-06-13"
        isToday={false}
        isUnavailable={true}
        appointments={[mockAppt]}
        appointmentTypes={mockTypes}
        onAddClick={onAddClick}
        onAppointmentClick={onAppointmentClick}
        onSelectDate={vi.fn()}
      />
    );
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText(/Ana García/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(onAddClick).toHaveBeenCalledWith("2026-06-13");

    await userEvent.click(screen.getByText(/Ana García/));
    expect(onAppointmentClick).toHaveBeenCalledWith(mockAppt);
  });

  it("applies both today and unavailable classes when both are true", () => {
    const { container } = render(
      <CalendarDay
        date="2026-06-13"
        isToday={true}
        isUnavailable={true}
        appointments={[]}
        appointmentTypes={mockTypes}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
        onSelectDate={vi.fn()}
      />
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/today/);
    expect((container.firstChild as HTMLElement).className).toMatch(/unavailable/);
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

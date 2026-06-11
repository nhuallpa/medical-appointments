import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DayView } from "@/components/DayView/DayView";
import type { Appointment, AppointmentType, TimeSlot } from "@/types/appointment";

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

function makeSlots(): TimeSlot[] {
  return [
    { time: "08:00", appointments: [] },
    { time: "08:30", appointments: [] },
    { time: "09:00", appointments: [mockAppt] },
  ];
}

describe("DayView", () => {
  it("renders the formatted date", () => {
    render(
      <DayView
        date="2026-06-10"
        timeSlots={makeSlots()}
        appointmentTypes={mockTypes}
        onPrevDay={vi.fn()}
        onNextDay={vi.fn()}
        onToday={vi.fn()}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    expect(screen.getByText(/Wednesday, June 10, 2026/i)).toBeInTheDocument();
  });

  it("calls onPrevDay, onNextDay, and onToday when nav buttons are clicked", async () => {
    const onPrevDay = vi.fn();
    const onNextDay = vi.fn();
    const onToday = vi.fn();
    render(
      <DayView
        date="2026-06-10"
        timeSlots={makeSlots()}
        appointmentTypes={mockTypes}
        onPrevDay={onPrevDay}
        onNextDay={onNextDay}
        onToday={onToday}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /previous/i }));
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    await userEvent.click(screen.getByRole("button", { name: /today/i }));
    expect(onPrevDay).toHaveBeenCalled();
    expect(onNextDay).toHaveBeenCalled();
    expect(onToday).toHaveBeenCalled();
  });

  it("renders one row per time slot with its time label", () => {
    render(
      <DayView
        date="2026-06-10"
        timeSlots={makeSlots()}
        appointmentTypes={mockTypes}
        onPrevDay={vi.fn()}
        onNextDay={vi.fn()}
        onToday={vi.fn()}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("08:30")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("renders an appointment within its slot and calls onAppointmentClick when clicked", async () => {
    const onAppointmentClick = vi.fn();
    render(
      <DayView
        date="2026-06-10"
        timeSlots={makeSlots()}
        appointmentTypes={mockTypes}
        onPrevDay={vi.fn()}
        onNextDay={vi.fn()}
        onToday={vi.fn()}
        onAddClick={vi.fn()}
        onAppointmentClick={onAppointmentClick}
      />
    );
    await userEvent.click(screen.getByText(/Ana García/));
    expect(onAppointmentClick).toHaveBeenCalledWith(mockAppt);
  });

  it("calls onAddClick with the date and the slot's time when a slot's add control is clicked", async () => {
    const onAddClick = vi.fn();
    render(
      <DayView
        date="2026-06-10"
        timeSlots={makeSlots()}
        appointmentTypes={mockTypes}
        onPrevDay={vi.fn()}
        onNextDay={vi.fn()}
        onToday={vi.fn()}
        onAddClick={onAddClick}
        onAppointmentClick={vi.fn()}
      />
    );
    const addButtons = screen.getAllByRole("button", { name: /add appointment/i });
    await userEvent.click(addButtons[0]);
    expect(onAddClick).toHaveBeenCalledWith("2026-06-10", "08:00");
  });

  it("renders an empty-state message when there are no time slots", () => {
    render(
      <DayView
        date="2026-06-10"
        timeSlots={[]}
        appointmentTypes={mockTypes}
        onPrevDay={vi.fn()}
        onNextDay={vi.fn()}
        onToday={vi.fn()}
        onAddClick={vi.fn()}
        onAppointmentClick={vi.fn()}
      />
    );
    expect(screen.getByText(/no time slots/i)).toBeInTheDocument();
  });
});

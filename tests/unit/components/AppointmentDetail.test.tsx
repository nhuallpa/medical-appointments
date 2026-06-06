import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentDetail } from "@/components/AppointmentDetail/AppointmentDetail";
import type { Appointment } from "@/types/appointment";

const appt: Appointment = {
  id: "appt-99",
  patientName: "Carlos Ruiz",
  professionalName: "Dr. Martínez",
  date: "2026-06-15",
  time: "14:00",
  notes: "Bring prior X-rays",
  createdAt: "2026-06-01T00:00:00.000Z",
};

describe("AppointmentDetail", () => {
  it("displays all appointment fields", () => {
    render(<AppointmentDetail appointment={appt} onDelete={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();
    expect(screen.getByText("Dr. Martínez")).toBeInTheDocument();
    expect(screen.getByText("14:00")).toBeInTheDocument();
    expect(screen.getByText("Bring prior X-rays")).toBeInTheDocument();
  });

  it("shows confirmation prompt when Delete is clicked", async () => {
    render(<AppointmentDetail appointment={appt} onDelete={vi.fn()} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
  });

  it("calls onDelete with the appointment id after confirmation", async () => {
    const onDelete = vi.fn();
    render(<AppointmentDetail appointment={appt} onDelete={onDelete} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onDelete).toHaveBeenCalledWith(appt.id);
  });

  it("cancels the confirmation and retains the appointment", async () => {
    const onDelete = vi.fn();
    render(<AppointmentDetail appointment={appt} onDelete={onDelete} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /confirm/i })).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<AppointmentDetail appointment={appt} onDelete={vi.fn()} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<AppointmentDetail appointment={appt} onDelete={vi.fn()} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});

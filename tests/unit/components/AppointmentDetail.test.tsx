import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentDetail } from "@/components/AppointmentDetail/AppointmentDetail";
import type { Appointment, AppointmentType } from "@/types/appointment";

const defaultTypes: AppointmentType[] = [
  { id: "t-dental", name: "Dental", repeatable: false, maxSessions: 1 },
  { id: "t-rehab", name: "Rehabilitation", repeatable: true, maxSessions: 10 },
];

const appt: Appointment = {
  id: "appt-99",
  patientName: "Carlos Ruiz",
  professionalName: "Dr. Martínez",
  date: "2026-06-15",
  time: "14:00",
  typeId: "t-dental",
  notes: "Bring prior X-rays",
  createdAt: "2026-06-01T00:00:00.000Z",
};

const seriesAppt: Appointment = {
  ...appt,
  id: "appt-s1",
  typeId: "t-rehab",
  seriesId: "series-abc",
  seriesIndex: 2,
  seriesTotal: 5,
};

describe("AppointmentDetail — individual appointment", () => {
  it("displays all appointment fields", () => {
    render(
      <AppointmentDetail
        appointment={appt}
        appointmentTypes={defaultTypes}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();
    expect(screen.getByText("Dr. Martínez")).toBeInTheDocument();
    expect(screen.getByText("14:00")).toBeInTheDocument();
    expect(screen.getByText("Bring prior X-rays")).toBeInTheDocument();
    expect(screen.getByText("Dental")).toBeInTheDocument();
  });

  it("shows confirmation prompt when Delete is clicked", async () => {
    render(
      <AppointmentDetail
        appointment={appt}
        appointmentTypes={defaultTypes}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
  });

  it("calls onDelete with the appointment id after confirmation", async () => {
    const onDelete = vi.fn();
    render(
      <AppointmentDetail
        appointment={appt}
        appointmentTypes={defaultTypes}
        onDelete={onDelete}
        onClose={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onDelete).toHaveBeenCalledWith(appt.id);
  });

  it("cancels the confirmation and retains the appointment", async () => {
    const onDelete = vi.fn();
    render(
      <AppointmentDetail
        appointment={appt}
        appointmentTypes={defaultTypes}
        onDelete={onDelete}
        onClose={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /confirm/i })).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <AppointmentDetail
        appointment={appt}
        appointmentTypes={defaultTypes}
        onDelete={vi.fn()}
        onClose={onClose}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(
      <AppointmentDetail
        appointment={appt}
        appointmentTypes={defaultTypes}
        onDelete={vi.fn()}
        onClose={onClose}
      />
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("AppointmentDetail — series appointment (US4)", () => {
  it("shows series position indicator", () => {
    render(
      <AppointmentDetail
        appointment={seriesAppt}
        appointmentTypes={defaultTypes}
        onDelete={vi.fn()}
        onDeleteSeries={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/session 2 of 5/i)).toBeInTheDocument();
  });

  it("shows Delete Series button for series appointments", () => {
    render(
      <AppointmentDetail
        appointment={seriesAppt}
        appointmentTypes={defaultTypes}
        onDelete={vi.fn()}
        onDeleteSeries={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /delete series \(/i })).toBeInTheDocument();
  });

  it("calls onDeleteSeries with seriesId after confirming series deletion", async () => {
    const onDeleteSeries = vi.fn();
    render(
      <AppointmentDetail
        appointment={seriesAppt}
        appointmentTypes={defaultTypes}
        onDelete={vi.fn()}
        onDeleteSeries={onDeleteSeries}
        onClose={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /delete series \(/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onDeleteSeries).toHaveBeenCalledWith("series-abc");
  });

  it("does not call onDelete when canceling series deletion", async () => {
    const onDelete = vi.fn();
    render(
      <AppointmentDetail
        appointment={seriesAppt}
        appointmentTypes={defaultTypes}
        onDelete={onDelete}
        onDeleteSeries={vi.fn()}
        onClose={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /delete series \(/i }));
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});

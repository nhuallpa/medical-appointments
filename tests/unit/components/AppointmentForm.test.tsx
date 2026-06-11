import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentForm } from "@/components/AppointmentForm/AppointmentForm";
import type { AppointmentType, ScheduleConfig } from "@/types/appointment";

const defaultTypes: AppointmentType[] = [
  { id: "t-dental", name: "Dental", repeatable: false, maxSessions: 1 },
  { id: "t-rehab", name: "Rehabilitation", repeatable: true, maxSessions: 10 },
];

const defaultSchedule: ScheduleConfig = {
  enabledDays: [1, 2, 3, 4, 5],
  startTime: "08:00",
  endTime: "18:00",
};

// Use a future date for valid submissions (avoids past-date rejection)
const FUTURE_DATE = "2027-01-15";

describe("AppointmentForm — core fields", () => {
  it("renders all required fields including type selector", () => {
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/professional name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/appointment type/i)).toBeInTheDocument();
  });

  it("pre-fills the date field when initialDate is provided", () => {
    render(
      <AppointmentForm
        initialDate={FUTURE_DATE}
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/^date/i)).toHaveValue(FUTURE_DATE);
  });

  it("shows sessions field when a repeatable type is selected", async () => {
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await userEvent.selectOptions(screen.getByLabelText(/appointment type/i), "t-rehab");
    expect(screen.getByLabelText(/sessions/i)).toBeInTheDocument();
  });

  it("hides sessions field when an individual type is selected", async () => {
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await userEvent.selectOptions(screen.getByLabelText(/appointment type/i), "t-dental");
    expect(screen.queryByLabelText(/sessions/i)).not.toBeInTheDocument();
  });

  it("shows 4 validation errors when submitting empty form", async () => {
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    // patientName, professionalName, date, time
    expect(screen.getAllByRole("alert")).toHaveLength(4);
  });

  it("does not call onSubmit when form is invalid", async () => {
    const onSubmit = vi.fn();
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with valid data including typeId and sessions", async () => {
    const onSubmit = vi.fn();
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    await userEvent.type(screen.getByLabelText(/patient name/i), "Ana García");
    await userEvent.type(screen.getByLabelText(/professional name/i), "Dr. López");
    await userEvent.type(screen.getByLabelText(/^date/i), FUTURE_DATE);
    await userEvent.type(screen.getByLabelText(/time/i), "09:00");

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        patientName: "Ana García",
        professionalName: "Dr. López",
        date: FUTURE_DATE,
        time: "09:00",
        typeId: expect.any(String),
        sessions: 1,
      })
    );
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onCancel when Escape key is pressed", async () => {
    const onCancel = vi.fn();
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("AppointmentForm — past date validation", () => {
  it("shows 'Date cannot be in the past' error when a clearly past date is submitted", async () => {
    const onSubmit = vi.fn();
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    await userEvent.type(screen.getByLabelText(/patient name/i), "Ana");
    await userEvent.type(screen.getByLabelText(/professional name/i), "Dr. X");
    await userEvent.type(screen.getByLabelText(/^date/i), "2020-01-01"); // definitely past
    await userEvent.type(screen.getByLabelText(/time/i), "10:00");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/cannot be in the past/i)).toBeInTheDocument();
  });

  it("accepts a clearly future date without past-date error", async () => {
    const onSubmit = vi.fn();
    render(
      <AppointmentForm
        appointmentTypes={defaultTypes}
        scheduleConfig={defaultSchedule}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    await userEvent.type(screen.getByLabelText(/patient name/i), "Ana");
    await userEvent.type(screen.getByLabelText(/professional name/i), "Dr. X");
    await userEvent.type(screen.getByLabelText(/^date/i), FUTURE_DATE);
    await userEvent.type(screen.getByLabelText(/time/i), "10:00");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalled();
    expect(screen.queryByText(/cannot be in the past/i)).not.toBeInTheDocument();
  });
});

describe("AppointmentForm — schedule warnings", () => {
  it("shows a warning when date falls on a disabled day", async () => {
    render(
      <AppointmentForm
        initialDate="2027-01-16" // Saturday
        appointmentTypes={defaultTypes}
        scheduleConfig={{ enabledDays: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "18:00" }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    // Populate required fields so warning appears on render (date is pre-filled)
    expect(screen.getByRole("note")).toBeInTheDocument(); // schedule warning
  });

  it("shows a warning when time is outside the configured range", async () => {
    render(
      <AppointmentForm
        initialDate={FUTURE_DATE}
        appointmentTypes={defaultTypes}
        scheduleConfig={{ enabledDays: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "18:00" }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const timeInput = screen.getByLabelText(/time/i);
    await userEvent.type(timeInput, "07:00");
    expect(screen.getByRole("note")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentForm } from "@/components/AppointmentForm/AppointmentForm";

describe("AppointmentForm", () => {
  it("renders all required fields", () => {
    render(<AppointmentForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/professional name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
  });

  it("pre-fills the date field when initialDate is provided", () => {
    render(<AppointmentForm initialDate="2026-06-10" onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/^date/i)).toHaveValue("2026-06-10");
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<AppointmentForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(screen.getAllByRole("alert")).toHaveLength(4); // patientName, professionalName, date, time
  });

  it("does not call onSubmit when form is invalid", async () => {
    const onSubmit = vi.fn();
    render(<AppointmentForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with valid data", async () => {
    const onSubmit = vi.fn();
    render(<AppointmentForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/patient name/i), "Ana García");
    await userEvent.type(screen.getByLabelText(/professional name/i), "Dr. López");
    await userEvent.type(screen.getByLabelText(/^date/i), "2026-06-10");
    await userEvent.type(screen.getByLabelText(/time/i), "09:00");

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        patientName: "Ana García",
        professionalName: "Dr. López",
        date: "2026-06-10",
        time: "09:00",
      })
    );
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<AppointmentForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onCancel when Escape key is pressed", async () => {
    const onCancel = vi.fn();
    render(<AppointmentForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalled();
  });
});

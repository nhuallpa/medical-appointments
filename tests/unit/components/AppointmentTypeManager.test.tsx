import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentTypeManager } from "@/components/AppointmentTypeManager/AppointmentTypeManager";
import type { AppointmentType } from "@/types/appointment";

const types: AppointmentType[] = [
  { id: "t1", name: "Dental", repeatable: false, maxSessions: 1, color: "#3b82f6" },
  { id: "t2", name: "Rehabilitation", repeatable: true, maxSessions: 10, color: "#10b981" },
];

describe("AppointmentTypeManager", () => {
  it("renders all existing appointment types", () => {
    render(<AppointmentTypeManager types={types} onAdd={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Dental")).toBeInTheDocument();
    expect(screen.getByText("Rehabilitation")).toBeInTheDocument();
  });

  it("shows 'Individual' badge for non-repeatable types", () => {
    render(<AppointmentTypeManager types={types} onAdd={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Individual")).toBeInTheDocument();
  });

  it("shows 'Repeatable' badge for repeatable types", () => {
    render(<AppointmentTypeManager types={types} onAdd={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Repeatable · 10 sessions")).toBeInTheDocument();
  });

  it("calls onDelete with the type id when delete button is clicked", async () => {
    const onDelete = vi.fn();
    render(<AppointmentTypeManager types={types} onAdd={vi.fn()} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await userEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith("t1");
  });

  it("shows max sessions field only when repeatable is checked in add form", async () => {
    render(<AppointmentTypeManager types={types} onAdd={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByLabelText(/max sessions/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: /repeatable/i }));
    expect(screen.getByLabelText(/max sessions/i)).toBeInTheDocument();
  });

  it("calls onAdd with correct data when add form is submitted", async () => {
    const onAdd = vi.fn();
    render(<AppointmentTypeManager types={types} onAdd={onAdd} onDelete={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/type name/i), "Physical Therapy");
    await userEvent.click(screen.getByRole("checkbox", { name: /repeatable/i }));
    await userEvent.clear(screen.getByLabelText(/max sessions/i));
    await userEvent.type(screen.getByLabelText(/max sessions/i), "8");
    await userEvent.click(screen.getByRole("button", { name: /add type/i }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Physical Therapy", repeatable: true, maxSessions: 8 })
    );
  });

  it("shows validation error when submitting with empty name", async () => {
    render(<AppointmentTypeManager types={types} onAdd={vi.fn()} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /add type/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

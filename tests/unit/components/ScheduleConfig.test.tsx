import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScheduleConfig } from "@/components/ScheduleConfig/ScheduleConfig";
import type { ScheduleConfig as ScheduleConfigType } from "@/types/appointment";

const defaultConfig: ScheduleConfigType = {
  enabledDays: [1, 2, 3, 4, 5],
  startTime: "08:00",
  endTime: "18:00",
};

describe("ScheduleConfig", () => {
  it("renders 7 day-of-week checkboxes", () => {
    render(<ScheduleConfig config={defaultConfig} onSave={vi.fn()} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(7);
  });

  it("checks Mon-Fri by default when enabledDays=[1,2,3,4,5]", () => {
    render(<ScheduleConfig config={defaultConfig} onSave={vi.fn()} />);
    const monCheckbox = screen.getByRole("checkbox", { name: /monday/i });
    const sunCheckbox = screen.getByRole("checkbox", { name: /sunday/i });
    expect(monCheckbox).toBeChecked();
    expect(sunCheckbox).not.toBeChecked();
  });

  it("renders start and end time inputs with correct values", () => {
    render(<ScheduleConfig config={defaultConfig} onSave={vi.fn()} />);
    expect(screen.getByLabelText(/start time/i)).toHaveValue("08:00");
    expect(screen.getByLabelText(/end time/i)).toHaveValue("18:00");
  });

  it("calls onSave with updated enabledDays when a day checkbox is toggled", async () => {
    const onSave = vi.fn();
    render(<ScheduleConfig config={defaultConfig} onSave={onSave} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /saturday/i }));
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ enabledDays: expect.arrayContaining([6]) })
    );
  });

  it("calls onSave with updated start time", async () => {
    const onSave = vi.fn();
    render(<ScheduleConfig config={defaultConfig} onSave={onSave} />);
    await userEvent.clear(screen.getByLabelText(/start time/i));
    await userEvent.type(screen.getByLabelText(/start time/i), "09:00");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: "09:00" })
    );
  });
});

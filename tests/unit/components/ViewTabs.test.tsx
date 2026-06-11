import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewTabs } from "@/components/ViewTabs/ViewTabs";

describe("ViewTabs", () => {
  it("renders a Calendar tab and a Day tab inside a tablist", () => {
    render(<ViewTabs active="calendar" onChange={vi.fn()} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /calendar/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /day/i })).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected=true and the other with false", () => {
    render(<ViewTabs active="calendar" onChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /calendar/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /day/i })).toHaveAttribute("aria-selected", "false");
  });

  it("marks the Day tab as active when active='day'", () => {
    render(<ViewTabs active="day" onChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /day/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /calendar/i })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange with 'day' when the Day tab is clicked", async () => {
    const onChange = vi.fn();
    render(<ViewTabs active="calendar" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: /day/i }));
    expect(onChange).toHaveBeenCalledWith("day");
  });

  it("calls onChange with 'calendar' when the Calendar tab is clicked", async () => {
    const onChange = vi.fn();
    render(<ViewTabs active="day" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: /calendar/i }));
    expect(onChange).toHaveBeenCalledWith("calendar");
  });
});

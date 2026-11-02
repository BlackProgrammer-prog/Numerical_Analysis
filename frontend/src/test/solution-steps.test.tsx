import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SolutionSteps } from "@/components/solution-steps";

afterEach(cleanup);

describe("solution steps", () => {
  it("prompts for a conversion before displaying steps", () => {
    render(<SolutionSteps steps={[]} loading={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("ابتدا تبدیل مبنا");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows loading while the calculation is pending", () => {
    render(<SolutionSteps steps={[]} loading />);
    expect(screen.getByRole("status")).toHaveTextContent("در حال محاسبه");
  });

  it("renders returned steps in order with left-to-right arithmetic", () => {
    render(<SolutionSteps loading={false} steps={[
      { title: "تقسیم صحیح متوالی", description: "خارج‌قسمت ۲۲ و باقی‌مانده ۱ است.", expression: "45 = 2 × 22 + 1" },
      { title: "نتیجهٔ نهایی", description: "باقی‌مانده‌ها را از پایین به بالا می‌خوانیم.", expression: "(45)_10 → (101101)_2" },
    ]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("خارج‌قسمت ۲۲");
    expect(screen.getByText("45 = 2 × 22 + 1")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("(45)_10 → (101101)_2")).toBeInTheDocument();
  });
});

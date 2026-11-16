import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Index } from "@/routes/index";
import { convertNumber } from "@/lib/api";

vi.mock("@/lib/api", () => ({ convertNumber: vi.fn() }));
vi.mock("@/components/polynomial-lab", () => ({ PolynomialLab: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.restoreAllMocks(); });

it("selects base 64, rejects missing symbols, and sends the custom alphabet", async () => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  vi.mocked(convertNumber).mockResolvedValue({
    number: "63", sourceBase: 10, targetBase: 64, method: "standard",
    extraDigits: "@#", precision: 20, result: "#", truncated: false, steps: [],
    benchmark: {
      standard: { method: "standard", medianMicroseconds: 1 },
      horner: { method: "horner", medianMicroseconds: 2 },
      iterations: 30, fasterMethod: "standard", speedup: 2,
    },
  });
  render(<Index />);
  fireEvent.change(document.getElementById("number")!, { target: { value: "63" } });
  fireEvent.click(document.getElementById("target-base")!);
  fireEvent.click(screen.getByText("وارد کردن مبنای دلخواه"));
  fireEvent.change(document.getElementById("custom-base")!, { target: { value: "64" } });
  fireEvent.click(screen.getByRole("button", { name: "تأیید" }));
  expect(screen.getByRole("dialog", { name: "جدول کاراکترهای دلخواه" })).toBeInTheDocument();
  expect(screen.getByRole("table")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "ذخیره کاراکترها" }));
  expect(screen.getByRole("alert")).toHaveTextContent("برای هر ردیف دقیقاً یک کاراکتر وارد کنید.");
  fireEvent.change(screen.getByLabelText("کاراکتر رقم 62"), { target: { value: "@" } });
  fireEvent.change(screen.getByLabelText("کاراکتر رقم 63"), { target: { value: "@" } });
  fireEvent.click(screen.getByRole("button", { name: "ذخیره کاراکترها" }));
  expect(screen.getByRole("alert")).toHaveTextContent("کاراکترها نباید تکراری");
  fireEvent.change(screen.getByLabelText("کاراکتر رقم 63"), { target: { value: "#" } });
  fireEvent.click(screen.getByRole("button", { name: "ذخیره کاراکترها" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  const form = document.getElementById("number")!.closest("form")!;
  expect(screen.getByText("62 = @")).toBeInTheDocument();
  expect(screen.getByText("63 = #")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "تنظیم جدول کاراکترها" }));
  expect(screen.getByLabelText("کاراکتر رقم 62")).toHaveValue("@");
  fireEvent.change(screen.getByLabelText("کاراکتر رقم 62"), { target: { value: "😀" } });
  fireEvent.click(screen.getByRole("button", { name: "انصراف" }));
  expect(screen.getByText("62 = @")).toBeInTheDocument();
  fireEvent.submit(form);
  await waitFor(() => expect(convertNumber).toHaveBeenCalledWith({
    number: "63", sourceBase: 10, targetBase: 64, method: "standard", extraDigits: "@#",
  }));
  await waitFor(() => expect(screen.getByText("#", { selector: "output" })).toBeInTheDocument());
});

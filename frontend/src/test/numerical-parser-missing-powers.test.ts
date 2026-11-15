import { expect, it } from "vitest";
import { parsePolynomial } from "@/lib/numerical";

it("inserts zero coefficients for missing powers", () => {
  expect(parsePolynomial("x^3+2x-5").coefficients).toEqual([1, 0, 2, -5]);
});

import { expect, it } from "vitest";
import { parsePolynomial } from "@/lib/numerical";

it("accepts common classroom polynomial notation", () => {
  expect(parsePolynomial("P(x) = x³ − 2x + 1").coefficients).toEqual([1, 0, -2, 1]);
});

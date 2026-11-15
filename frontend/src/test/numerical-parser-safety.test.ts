import { expect, it } from "vitest";
import { parsePolynomial } from "@/lib/numerical";

it("combines terms and rejects executable expressions", () => {
  expect(parsePolynomial("2x^2-x^2+3").coefficients).toEqual([1, 0, 3]);
  expect(() => parsePolynomial("alert(1)+x")).toThrow();
});

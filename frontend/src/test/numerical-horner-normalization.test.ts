import { expect, it } from "vitest";
import { runHorner } from "@/lib/numerical";

it("normalizes a negative leading coefficient", () => {
  const result = runHorner([-1, 0, -2, 5], 2);
  expect(result.leadingCoefficientNormalized).toBe(true);
  expect(result.normalizedCoefficients).toEqual([1, 0, 2, -5]);
});

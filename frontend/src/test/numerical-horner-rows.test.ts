import { expect, it } from "vitest";
import { runHorner } from "@/lib/numerical";

it("builds all three Horner rows", () => {
  const result = runHorner([1, 0, 2, -5], 1);
  expect(result.products).toEqual([null, 1, 1, 3]);
  expect(result.sums).toEqual([1, 1, 3, -2]);
  expect(result.remainder).toBe(-2);
});

import { expect, it } from "vitest";
import { runNewton } from "@/lib/numerical";

it("solves the lesson and exercise examples", () => {
  expect(runNewton([1, 0, 5, 1], { initial: -0.2, tolerance: 1e-8, maxIterations: 50 }).root).toBeCloseTo(-0.198437, 6);
  expect(runNewton([1, 0, -1, 1], { initial: -1.5, tolerance: 1e-8, maxIterations: 50 }).root).toBeCloseTo(-1.324718, 6);
});

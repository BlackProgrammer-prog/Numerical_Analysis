import { expect, it } from "vitest";
import { runNewton } from "@/lib/numerical";

it("stops safely when the derivative is near zero", () => {
  expect(runNewton([1, 0, 1], { initial: 0, tolerance: 1e-8, maxIterations: 10 }).reason).toBe("derivative");
});

import { expect, it } from "vitest";
import { calculateBounds } from "@/lib/numerical";

it("matches the notebook root interval", () => {
  expect(calculateBounds([1, 0, 2, -5]).interval).toEqual([-1, 2]);
});

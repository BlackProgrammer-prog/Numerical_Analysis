import { expect, it } from "vitest";
import { runHorner } from "@/lib/numerical";

it("distinguishes confirmation from an inconclusive bound test", () => {
  expect(runHorner([1, 0, 2, -5], 1).boundStatus).toBe("not-confirmed");
  expect(runHorner([1, 0, 2, -5], 2).boundStatus).toBe("confirmed");
  expect(runHorner([1, 0, 2, -5], 0).boundStatus).toBe("not-applicable");
});

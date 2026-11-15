import { expect, it } from "vitest";
import { parseBivariatePolynomial, reduceAtX, runBivariateNewton } from "@/lib/numerical";

it("holds x constant while solving for y", () => {
  const polynomial = parseBivariatePolynomial("y^3+xy+1");
  expect(reduceAtX(polynomial, 5)).toEqual([1, 0, 5, 1]);
  expect(runBivariateNewton(polynomial, 5, { initial: -0.2, tolerance: 1e-8, maxIterations: 50 }).root).toBeCloseTo(-0.198437, 6);
});

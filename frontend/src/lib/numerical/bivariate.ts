import type { BivariatePolynomial } from "./parser";
import type { NewtonResult } from "./types";
import { runNewton, type NewtonOptions } from "./newton";

export function reduceAtX(polynomial: BivariatePolynomial, x: number): number[] {
  const degree = Math.max(...polynomial.terms.map((term) => term.yPower));
  const coefficients = Array(degree + 1).fill(0) as number[];
  for (const term of polynomial.terms) {
    const index = degree - term.yPower;
    coefficients[index] = coefficients[index]! + term.coefficient * x ** term.xPower;
  }
  return coefficients;
}

export function runBivariateNewton(polynomial: BivariatePolynomial, x: number, options: NewtonOptions): NewtonResult {
  if (!Number.isFinite(x)) throw new Error("مقدار ثابت x معتبر نیست.");
  return runNewton(reduceAtX(polynomial, x), options);
}


import { runHorner } from "./horner";
import { formatPolynomial } from "./parser";

export function negativeRootTransform(coefficients: number[]) {
  const normalized = coefficients[0]! < 0 ? coefficients.map((value) => -value) : [...coefficients];
  const transformed = normalized.map((coefficient, index) => coefficient * (index % 2 === 0 ? 1 : -1));
  return { coefficients: transformed, expression: formatPolynomial(transformed, "x") };
}

export function findIntegerUpperBound(coefficients: number[], maximum = 1000) {
  const trials = [];
  for (let lambda = 1; lambda <= maximum; lambda++) {
    const result = runHorner(coefficients, lambda);
    trials.push(result);
    if (result.boundStatus === "confirmed") return { bound: lambda, trials };
  }
  throw new Error(`تا λ=${maximum} کران تأییدشده‌ای پیدا نشد.`);
}

export function calculateBounds(coefficients: number[]) {
  const upper = findIntegerUpperBound(coefficients);
  const q = negativeRootTransform(coefficients);
  const lowerMagnitude = findIntegerUpperBound(q.coefficients);
  return { upper, lowerMagnitude, q, lower: -lowerMagnitude.bound, interval: [-lowerMagnitude.bound, upper.bound] as [number, number] };
}


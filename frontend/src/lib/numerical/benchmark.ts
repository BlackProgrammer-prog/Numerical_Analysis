import { evaluatePolynomial, evaluatePolynomialWithPowers } from "./polynomial";

export interface PolynomialBenchmark {
  hornerMicroseconds: number;
  standardMicroseconds: number;
  iterations: number;
}

let benchmarkSink = 0;

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)]!;
}

function measureBatch(
  evaluator: (coefficients: number[], x: number) => number,
  coefficients: number[],
  x: number,
  iterations: number,
): number {
  let accumulator = 0;
  const started = performance.now();
  for (let index = 0; index < iterations; index++) {
    accumulator += evaluator(coefficients, x);
  }
  const elapsedMilliseconds = performance.now() - started;
  benchmarkSink = accumulator;
  return elapsedMilliseconds * 1000 / iterations;
}

export function benchmarkPolynomialEvaluation(
  coefficients: number[],
  x: number,
): PolynomialBenchmark {
  const iterations = Math.max(5_000, Math.floor(100_000 / coefficients.length));
  const rounds = 9;

  for (let index = 0; index < 100; index++) {
    benchmarkSink += evaluatePolynomial(coefficients, x);
    benchmarkSink += evaluatePolynomialWithPowers(coefficients, x);
  }

  const hornerSamples: number[] = [];
  const standardSamples: number[] = [];
  for (let round = 0; round < rounds; round++) {
    if (round % 2 === 0) {
      hornerSamples.push(measureBatch(evaluatePolynomial, coefficients, x, iterations));
      standardSamples.push(measureBatch(evaluatePolynomialWithPowers, coefficients, x, iterations));
    } else {
      standardSamples.push(measureBatch(evaluatePolynomialWithPowers, coefficients, x, iterations));
      hornerSamples.push(measureBatch(evaluatePolynomial, coefficients, x, iterations));
    }
  }

  return {
    hornerMicroseconds: median(hornerSamples),
    standardMicroseconds: median(standardSamples),
    iterations: iterations * rounds,
  };
}

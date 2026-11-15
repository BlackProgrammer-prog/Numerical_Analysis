export function evaluatePolynomial(coefficients: number[], x: number): number {
  return coefficients.reduce((value, coefficient) => value * x + coefficient);
}

export function derivativeCoefficients(coefficients: number[]): number[] {
  const degree = coefficients.length - 1;
  return coefficients.slice(0, -1).map((coefficient, index) => coefficient * (degree - index));
}

export function samplePolynomial(coefficients: number[], from: number, to: number, count = 161) {
  const width = to - from || 2;
  return Array.from({ length: count }, (_, index) => {
    const x = from + width * index / (count - 1);
    return { x, y: evaluatePolynomial(coefficients, x) };
  });
}


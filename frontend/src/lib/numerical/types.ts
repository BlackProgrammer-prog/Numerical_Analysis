export interface Polynomial {
  variable: string;
  coefficients: number[];
  degree: number;
  normalized: string;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  expression: string;
  kind: "info" | "multiply" | "add" | "check" | "success" | "warning";
}

export interface HornerResult {
  inputCoefficients: number[];
  normalizedCoefficients: number[];
  lambda: number;
  products: Array<number | null>;
  sums: number[];
  quotient: number[];
  remainder: number;
  value: number;
  leadingCoefficientNormalized: boolean;
  boundStatus: "confirmed" | "not-confirmed" | "not-applicable";
  steps: LearningStep[];
}

export interface NewtonIteration {
  iteration: number;
  current: number;
  value: number;
  derivative: number;
  next: number;
  error: number;
  residual: number;
  steps: LearningStep[];
}

export interface NewtonResult {
  root: number;
  converged: boolean;
  reason: "residual" | "difference" | "both" | "derivative" | "max-iterations" | "non-finite";
  message: string;
  iterations: NewtonIteration[];
}


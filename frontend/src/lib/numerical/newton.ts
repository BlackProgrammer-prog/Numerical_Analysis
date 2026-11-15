import { derivativeCoefficients, evaluatePolynomial } from "./polynomial";
import { formatPolynomial } from "./parser";
import type { LearningStep, NewtonIteration, NewtonResult } from "./types";

export interface NewtonOptions { initial: number; tolerance: number; maxIterations: number; derivativeEpsilon?: number }

export function runNewton(coefficients: number[], options: NewtonOptions): NewtonResult {
  const { tolerance, maxIterations } = options;
  const derivativeEpsilon = options.derivativeEpsilon ?? 1e-14;
  if (!(tolerance > 0) || !Number.isInteger(maxIterations) || maxIterations < 1) throw new Error("خطا باید مثبت و تعداد تکرارها عدد صحیح مثبت باشد.");
  const derivative = derivativeCoefficients(coefficients);
  const iterations: NewtonIteration[] = [];
  let current = options.initial;
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const value = evaluatePolynomial(coefficients, current);
    const slope = evaluatePolynomial(derivative, current);
    const base: LearningStep[] = [
      { id: `${iteration}-function`, title: "نمایش تابع", description: "تابع اصلی مسئله", expression: `f(x) = ${formatPolynomial(coefficients)}`, kind: "info" },
      { id: `${iteration}-derivative`, title: "مشتق تحلیلی", description: "مشتق چندجمله‌ای به‌صورت تحلیلی محاسبه شد.", expression: `f′(x) = ${formatPolynomial(derivative)}`, kind: "info" },
      { id: `${iteration}-substitute`, title: "جای‌گذاری حدس", description: `حدس تکرار ${iteration} در تابع و مشتق قرار می‌گیرد.`, expression: `x_${iteration} = ${current}`, kind: "info" },
      { id: `${iteration}-numerator`, title: "محاسبهٔ صورت", description: "مقدار تابع در حدس فعلی", expression: `f(${current}) = ${value}`, kind: "add" },
      { id: `${iteration}-denominator`, title: "محاسبهٔ مخرج", description: "مقدار مشتق در حدس فعلی", expression: `f′(${current}) = ${slope}`, kind: "multiply" },
    ];
    if (Math.abs(value) <= tolerance) return { root: current, converged: true, reason: "residual", message: "باقی‌ماندهٔ تابع از خطای مجاز کوچک‌تر است.", iterations };
    if (Math.abs(slope) <= derivativeEpsilon) return { root: current, converged: false, reason: "derivative", message: "مشتق صفر یا بسیار نزدیک صفر شد؛ تقسیم ایمن نیست.", iterations };
    const next = current - value / slope;
    const error = Math.abs(next - current);
    const residual = Number.isFinite(next) ? Math.abs(evaluatePolynomial(coefficients, next)) : Infinity;
    const differenceOkay = error <= tolerance;
    const residualOkay = residual <= tolerance;
    const steps = [...base,
      { id: `${iteration}-next`, title: "محاسبهٔ حدس جدید", description: "فرمول نیوتن–رافسون اجرا می‌شود.", expression: `x_${iteration + 1} = ${current} − (${value})/(${slope}) = ${next}`, kind: "add" as const },
      { id: `${iteration}-error`, title: "محاسبهٔ خطا", description: "اختلاف مطلق دو حدس پیاپی", expression: `|${next} − ${current}| = ${error}`, kind: "check" as const },
      { id: `${iteration}-decision`, title: "تصمیم ادامه یا توقف", description: differenceOkay && residualOkay ? "هم اختلاف حدس‌ها و هم باقی‌مانده قابل قبول‌اند؛ توقف." : "هنوز هر دو معیار برقرار نیستند؛ تکرار ادامه پیدا می‌کند.", expression: `error=${error}, |f(x)|=${residual}, ε=${tolerance}`, kind: differenceOkay && residualOkay ? "success" as const : "warning" as const },
    ];
    iterations.push({ iteration, current, value, derivative: slope, next, error, residual, steps });
    if (!Number.isFinite(next)) return { root: current, converged: false, reason: "non-finite", message: "محاسبه به مقدار نامتناهی رسید.", iterations };
    if (differenceOkay && residualOkay) return { root: next, converged: true, reason: "both", message: "هر دو معیار اختلاف حدس‌ها و باقی‌ماندهٔ تابع برقرار شدند.", iterations };
    current = next;
  }
  return { root: current, converged: false, reason: "max-iterations", message: "روش در حداکثر تکرار تعیین‌شده همگرا نشد.", iterations };
}


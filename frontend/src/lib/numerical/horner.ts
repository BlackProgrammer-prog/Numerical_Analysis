import type { HornerResult, LearningStep } from "./types";

export function runHorner(input: number[], lambda: number): HornerResult {
  if (input.length < 2 || input.some((value) => !Number.isFinite(value)) || !Number.isFinite(lambda)) throw new Error("ضرایب و λ باید اعداد متناهی باشند.");
  const first = input[0]!;
  const normalized = first < 0 ? input.map((value) => value === 0 ? 0 : -value) : [...input];
  const wasNormalized = first < 0;
  const products: Array<number | null> = [null];
  const sums: number[] = [normalized[0]!];
  const steps: LearningStep[] = [];
  if (wasNormalized) steps.push({ id: "normalize", title: "نرمال‌سازی", description: "چون ضریب اصلی منفی بود، کل چندجمله‌ای در ‎−1 ضرب شد.", expression: `[${input.join(", ")}] × (−1) = [${normalized.join(", ")}]`, kind: "info" });
  steps.push({ id: "drop", title: "پایین آوردن ضریب اول", description: "ضریب اول بدون تغییر به ردیف جمع منتقل می‌شود.", expression: `b₀ = ${normalized[0]!}`, kind: "info" });
  for (let index = 1; index < normalized.length; index++) {
    const product = sums[index - 1]! * lambda;
    const sum = normalized[index]! + product;
    products.push(product); sums.push(sum);
    steps.push({ id: `mul-${index}`, title: `ضرب مرحلهٔ ${index}`, description: "عدد قبلی ردیف آخر در λ ضرب می‌شود.", expression: `${sums[index - 1]!} × ${lambda} = ${product}`, kind: "multiply" });
    steps.push({ id: `add-${index}`, title: `جمع مرحلهٔ ${index}`, description: "حاصل‌ضرب با ضریب بعدی جمع می‌شود.", expression: `${normalized[index]} + (${product}) = ${sum}`, kind: "add" });
  }
  const applicable = lambda > 0 && normalized[0]! > 0;
  const confirmed = applicable && sums.every((value) => value >= 0);
  steps.push({
    id: "bound-check", title: "بررسی شرط کران", kind: confirmed ? "success" : "warning",
    description: !applicable ? "آزمون کران فقط برای λ مثبت و ضریب اصلی مثبت قابل استفاده است." : confirmed ? "تمام اعداد ردیف نهایی نامنفی‌اند؛ آزمون هورنر این λ را به‌عنوان کران بالا تأیید می‌کند." : "حداقل یک عدد منفی است؛ آزمون این λ را تأیید نکرد. این نتیجه رد قطعی کران نیست.",
    expression: `[${sums.join(", ")}]`,
  });
  return { inputCoefficients: [...input], normalizedCoefficients: normalized, lambda, products, sums, quotient: sums.slice(0, -1), remainder: sums.at(-1)!, value: wasNormalized ? -sums.at(-1)! : sums.at(-1)!, leadingCoefficientNormalized: wasNormalized, boundStatus: !applicable ? "not-applicable" : confirmed ? "confirmed" : "not-confirmed", steps };
}


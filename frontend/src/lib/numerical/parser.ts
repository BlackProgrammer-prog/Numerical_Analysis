import type { Polynomial } from "./types";

const NUMBER = "(?:\\d+(?:\\.\\d*)?|\\.\\d+)";

function normalizeInput(expression: string): string {
  return expression
    .replace(/[−–—]/g, "-")
    .replace(/²/g, "^2").replace(/³/g, "^3")
    .replace(/\s+/g, "")
    .replace(/\*/g, "")
    .replace(/^[A-Za-z]+\([A-Za-z]+\)=/, "");
}

function termsOf(expression: string): string[] {
  const input = normalizeInput(expression);
  if (!input) throw new Error("عبارت چندجمله‌ای خالی است.");
  if (/[^0-9A-Za-z.+\-^]/.test(input)) throw new Error("عبارت شامل نویسهٔ غیرمجاز است.");
  const terms = input.replace(/-/g, "+-").replace(/^\+/, "").split("+").filter(Boolean);
  if (!terms.length) throw new Error("چندجمله‌ای قابل تشخیص نیست.");
  return terms;
}

export function parsePolynomial(expression: string, expectedVariable?: string): Polynomial {
  const terms = termsOf(expression);
  const variables = new Set<string>();
  for (const term of terms) for (const match of term.matchAll(/[A-Za-z]/g)) variables.add(match[0].toLowerCase());
  if (variables.size > 1) throw new Error("در این بخش فقط یک متغیر مجاز است.");
  const variable = expectedVariable ?? [...variables][0] ?? "x";
  if (variables.size === 1 && !variables.has(variable.toLowerCase())) throw new Error(`متغیر باید ${variable} باشد.`);

  const byPower = new Map<number, number>();
  const pattern = new RegExp(`^([+-]?)(?:(${NUMBER}))?(${variable})?(?:\\^(\\d+))?$`, "i");
  for (const term of terms) {
    const match = term.match(pattern);
    if (!match || (!match[2] && !match[3])) throw new Error(`جملهٔ «${term}» معتبر نیست.`);
    const sign = match[1] === "-" ? -1 : 1;
    const coefficient = sign * (match[2] ? Number(match[2]) : 1);
    const power = match[3] ? Number(match[4] ?? 1) : 0;
    if (!Number.isSafeInteger(power) || power > 50) throw new Error("توان باید عدد صحیح بین صفر تا ۵۰ باشد.");
    byPower.set(power, (byPower.get(power) ?? 0) + coefficient);
  }
  const degree = Math.max(...byPower.keys());
  if (degree < 1) throw new Error("چندجمله‌ای باید حداقل درجهٔ یک داشته باشد.");
  const coefficients = Array.from({ length: degree + 1 }, (_, index) => byPower.get(degree - index) ?? 0);
  while (coefficients.length > 1 && coefficients[0] === 0) coefficients.shift();
  if (coefficients.length < 2) throw new Error("پس از ساده‌سازی، چندجمله‌ای درجهٔ مثبت ندارد.");
  return { variable, coefficients, degree: coefficients.length - 1, normalized: formatPolynomial(coefficients, variable) };
}

export function formatPolynomial(coefficients: number[], variable = "x"): string {
  const degree = coefficients.length - 1;
  const parts: string[] = [];
  coefficients.forEach((coefficient, index) => {
    if (coefficient === 0) return;
    const power = degree - index;
    const sign = coefficient < 0 ? "−" : "+";
    const absolute = Math.abs(coefficient);
    const magnitude = absolute === 1 && power > 0 ? "" : String(absolute);
    const variablePart = power === 0 ? "" : power === 1 ? variable : `${variable}^${power}`;
    parts.push(`${parts.length === 0 && sign === "+" ? "" : sign} ${magnitude}${variablePart}`.trim());
  });
  return parts.join(" ") || "0";
}

export interface BivariateTerm { coefficient: number; xPower: number; yPower: number }
export interface BivariatePolynomial { terms: BivariateTerm[]; normalized: string }

export function parseBivariatePolynomial(expression: string): BivariatePolynomial {
  const parsed: BivariateTerm[] = [];
  for (const raw of termsOf(expression)) {
    let term = raw;
    let sign = 1;
    if (term.startsWith("-")) { sign = -1; term = term.slice(1); }
    else if (term.startsWith("+")) term = term.slice(1);
    const coefficientMatch = term.match(new RegExp(`^${NUMBER}`));
    const coefficient = sign * (coefficientMatch ? Number(coefficientMatch[0]) : 1);
    term = term.slice(coefficientMatch?.[0].length ?? 0);
    let xPower = 0, yPower = 0;
    while (term) {
      const factor = term.match(/^([xy])(?:\^(\d+))?/i);
      if (!factor) throw new Error(`جملهٔ «${raw}» معتبر نیست؛ فقط x و y مجازند.`);
      const power = Number(factor[2] ?? 1);
      if (power > 20) throw new Error("توان متغیرها حداکثر ۲۰ است.");
      if (factor[1]!.toLowerCase() === "x") xPower += power; else yPower += power;
      term = term.slice(factor[0].length);
    }
    parsed.push({ coefficient, xPower, yPower });
  }
  const merged = new Map<string, BivariateTerm>();
  for (const term of parsed) {
    const key = `${term.xPower}:${term.yPower}`;
    const old = merged.get(key);
    merged.set(key, { ...term, coefficient: term.coefficient + (old?.coefficient ?? 0) });
  }
  const terms = [...merged.values()].filter((term) => term.coefficient !== 0);
  if (!terms.some((term) => term.yPower > 0)) throw new Error("تابع باید به متغیر y وابسته باشد.");
  return { terms, normalized: expression.replace(/\s+/g, "") };
}


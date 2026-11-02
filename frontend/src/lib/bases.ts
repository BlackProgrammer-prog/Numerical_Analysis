// Base list and labels used by the base selectors.

export type ConversionMethod = "standard" | "horner";

export interface BaseOption {
  value: number;
  name: string;
  persian?: string | undefined;
}

const NAMES: Record<number, { name: string; persian?: string }> = {
  2: { name: "Binary", persian: "باینری" },
  3: { name: "Ternary", persian: "سه‌تایی" },
  4: { name: "Quaternary", persian: "چهارتایی" },
  5: { name: "Quinary" },
  6: { name: "Senary" },
  7: { name: "Septenary" },
  8: { name: "Octal", persian: "اکتال" },
  9: { name: "Nonary" },
  10: { name: "Decimal", persian: "ده‌دهی" },
  11: { name: "Undecimal" },
  12: { name: "Duodecimal" },
  13: { name: "Tridecimal" },
  14: { name: "Tetradecimal" },
  15: { name: "Pentadecimal" },
  16: { name: "Hexadecimal", persian: "هگزادسیمال" },
  20: { name: "Vigesimal" },
  32: { name: "Duotrigesimal" },
  36: { name: "Hexatrigesimal" },
};

export function getBaseName(base: number): string {
  return NAMES[base]?.name ?? `Base ${base}`;
}

export const STANDARD_BASES: BaseOption[] = Array.from({ length: 35 }, (_, i) => {
  const value = i + 2;
  return { value, name: getBaseName(value), persian: NAMES[value]?.persian };
});

/** Returns a Persian error message, or null when the custom base is valid. */
export function validateCustomBase(raw: string): string | null {
  const v = raw.trim();
  if (v === "") return "لطفاً یک مبنا وارد کنید.";
  if (!/^\d+$/.test(v)) return "مبنا باید یک عدد صحیح باشد.";
  if (BigInt(v) < 2n) return "مبنا باید بزرگ‌تر یا مساوی ۲ باشد.";
  if (BigInt(v) > 36n) return "مبنا باید کوچک‌تر یا مساوی ۳۶ باشد.";
  return null;
}

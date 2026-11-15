import { AreaChart, Calculator, FunctionSquare, Gauge } from "lucide-react";

export type NumericalModuleId = "horner" | "bounds" | "newton" | "bivariate";

export const NUMERICAL_MODULES = [
  { id: "horner", label: "تقسیم هورنر", icon: Calculator },
  // { id: "bounds", label: "کران ریشه‌ها", icon: Gauge },
  { id: "newton", label: "نیوتن–رافسون", icon: AreaChart },
  { id: "bivariate", label: "معادلهٔ دو متغیره", icon: FunctionSquare },
] satisfies Array<{ id: NumericalModuleId; label: string; icon: typeof Calculator }>;

export const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none transition focus:border-ring";

export function formatNumber(value: number): string {
  return Number(value.toPrecision(10)).toString();
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "خطایی در محاسبه رخ داد.";
}

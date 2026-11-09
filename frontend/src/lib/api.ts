import type { ConversionMethod } from "./bases";

export interface ConversionRequest {
  number: string;
  sourceBase: number;
  targetBase: number;
  method: ConversionMethod;
  precision?: number;
}

export interface SolutionStep {
  title: string;
  description: string;
  expression: string;
}

export interface ConversionResponse extends ConversionRequest {
  result: string;
  precision: number;
  truncated: boolean;
  steps: SolutionStep[];
}

const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:8000").replace(/\/$/, "");

export async function convertNumber(payload: ConversionRequest): Promise<ConversionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error("ارتباط با سرور برقرار نشد. لطفاً اجرای بک‌اند و آدرس API را بررسی کنید.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : "ورودی نامعتبر است؛ عدد و مبناهای انتخاب‌شده را بررسی کنید.");
  }
  return response.json();
}

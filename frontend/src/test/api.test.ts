import { afterEach, describe, expect, it, vi } from "vitest";
import { convertNumber } from "@/lib/api";

const payload = { number: "-A.F", sourceBase: 16, targetBase: 2, method: "horner" as const };

afterEach(() => vi.unstubAllGlobals());

describe("conversion API client", () => {
  it("sends the selected algorithm and bases and returns the result", async () => {
    const data = { ...payload, result: "-1010.1111", precision: 20, truncated: false,
      steps: [{ title: "نتیجهٔ نهایی", description: "تبدیل انجام شد.", expression: "(-A.F)_16 → (-1010.1111)_2" }],
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(data)));
    vi.stubGlobal("fetch", fetchMock);

    await expect(convertNumber(payload)).resolves.toEqual(data);
    const [url, request] = fetchMock.mock.calls[0]!;
    expect(url).toMatch(/\/api\/convert$/);
    expect(request.method).toBe("POST");
    expect(request.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(request.body)).toEqual(payload);
  });

  it("surfaces invalid-digit errors from the backend", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ detail: "Digit '2' is not valid in base 2." }), { status: 400 },
    )));
    await expect(convertNumber(payload)).rejects.toThrow("Digit '2'");
  });

  it("handles schema validation errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ detail: [{ msg: "Invalid base" }] }), { status: 422 },
    )));
    await expect(convertNumber(payload)).rejects.toThrow("ورودی نامعتبر");
  });

  it("explains connection failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(convertNumber(payload)).rejects.toThrow("ارتباط با سرور برقرار نشد");
  });
});

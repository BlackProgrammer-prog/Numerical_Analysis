import { describe, expect, it } from "vitest";
import { STANDARD_BASES, validateCustomBase, validateExtraDigits } from "@/lib/bases";

describe("base 62 support", () => {
  it("offers every supported base including 37 and 62", () => {
    expect(STANDARD_BASES.map(({ value }) => value)).toEqual(
      Array.from({ length: 61 }, (_, index) => index + 2),
    );
  });

  it("accepts higher bases and rejects values outside the supported range", () => {
    for (const base of ["2", "36", "37", "62", "63", "1024"]) {
      expect(validateCustomBase(base)).toBeNull();
    }
    for (const base of ["1", "1025", "2.5", "999999999999999999999"]) {
      expect(validateCustomBase(base)).not.toBeNull();
    }
  });
});

it("validates extra symbols by Unicode code point and required base", () => {
  expect(validateExtraDigits("@#", 64)).toBeNull();
  expect(validateExtraDigits("😀", 63)).toBeNull();
  for (const extra of ["", "@", "@@", "A#", "@ ", "@.", "@+", "@-", "@\u200d"]) {
    expect(validateExtraDigits(extra, 64)).not.toBeNull();
  }
});

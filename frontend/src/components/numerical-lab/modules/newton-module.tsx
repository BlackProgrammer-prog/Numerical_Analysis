import { useState } from "react";
import { parsePolynomial, runNewton, type NewtonResult } from "@/lib/numerical";
import { getErrorMessage } from "../config";
import { NewtonForm, NewtonOutput } from "../newton-components";
import { ErrorMessage, ModuleIntro } from "../shared-components";

export function NewtonModule() {
  const [expression, setExpression] = useState("y^3+5y+1");
  const [initial, setInitial] = useState("-0.2");
  const [result, setResult] = useState<NewtonResult | null>(null);
  const [coefficients, setCoefficients] = useState<number[]>([]);
  const [error, setError] = useState("");

  function execute(tolerance: number, maxIterations: number) {
    try {
      const polynomial = parsePolynomial(expression, "y");
      setCoefficients(polynomial.coefficients);
      setResult(runNewton(polynomial.coefficients, { initial: Number(initial), tolerance, maxIterations }));
      setError("");
    } catch (caughtError) { setError(getErrorMessage(caughtError)); }
  }

  function selectExample(nextExpression: string, nextInitial: string) {
    setExpression(nextExpression);
    setInitial(nextInitial);
    setResult(null);
  }

  return (
    <div className="space-y-5">
      {/* <ModuleIntro
        title="روش نیوتن–رافسون"
        text="مشتق تحلیلی ساخته می‌شود و هم اختلاف حدس‌ها و هم باقی‌ماندهٔ تابع برای توقف بررسی می‌شوند."
      /> */}

      {/* <div className="flex gap-2">
        <button
          type="button"
          onClick={() => selectExample("y^3+5y+1", "-0.2")}
          className="rounded-full border px-3 py-1.5 text-xs"
        >
          مثال جزوه
        </button>
        <button
          type="button"
          onClick={() => selectExample("y^3-y+1", "-1.5")}
          className="rounded-full border px-3 py-1.5 text-xs"
        >
          تمرین آماده
        </button>
      </div> */}

      <NewtonForm
        expression={expression}
        initial={initial}
        onExpressionChange={setExpression}
        onInitialChange={setInitial}
        onRun={execute}
      />
      <ErrorMessage text={error} />
      {result && <NewtonOutput result={result} coefficients={coefficients} />}
    </div>
  );
}

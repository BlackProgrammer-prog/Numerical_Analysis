import { useState } from "react";
import { Play } from "lucide-react";
import {
  benchmarkPolynomialEvaluation,
  parsePolynomial,
  runHorner,
  type HornerResult,
  type PolynomialBenchmark,
} from "@/lib/numerical";
import { RuntimeComparison } from "@/components/runtime-comparison";
import { getErrorMessage, INPUT_CLASS } from "../config";
import { HornerBoard } from "../horner-components";
import { ErrorMessage, FormField, ModuleIntro, StepPlayer } from "../shared-components";

export function HornerModule() {
  const [expression, setExpression] = useState("x^3+2x-5");
  const [lambda, setLambda] = useState("1");
  const [result, setResult] = useState<HornerResult | null>(null);
  const [benchmark, setBenchmark] = useState<PolynomialBenchmark | null>(null);
  const [error, setError] = useState("");

  function execute() {
    try {
      const polynomial = parsePolynomial(expression, "x");
      const numericLambda = Number(lambda);
      setResult(runHorner(polynomial.coefficients, numericLambda));
      setBenchmark(benchmarkPolynomialEvaluation(polynomial.coefficients, numericLambda));
      setError("");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }

  return (
    <div className="space-y-5">
      {/* <ModuleIntro
        title="تقسیم مصنوعی هورنر"
        text="توان‌های غایب خودکار با ضریب صفر درج می‌شوند. سپس پایین‌آوردن، ضرب و جمع تا رسیدن به باقی‌مانده ادامه می‌یابد."
      /> */}

      <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_140px]">
        <FormField label="چندجمله‌ای" hint="مثال: x^3+2x-5">
          <input
            className={INPUT_CLASS}
            dir="ltr"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
          />
        </FormField>

        <FormField label="مقدار λ">
          <input
            className={INPUT_CLASS}
            dir="ltr"
            type="number"
            step="any"
            value={lambda}
            onChange={(event) => setLambda(event.target.value)}
          />
        </FormField>

        <button
          type="button"
          onClick={execute}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground sm:col-span-2"
        >
          <Play className="h-4 w-4" />
          اجرای هورنر
        </button>
      </div>

      <ErrorMessage text={error} />
      {result && (
        <>
          <HornerBoard result={result} />
          {benchmark && (
            <RuntimeComparison
              title="مقایسهٔ ارزیابی چندجمله‌ای"
              iterations={benchmark.iterations}
              methods={[
                { id: "horner", label: "روش هورنر", microseconds: benchmark.hornerMicroseconds },
                { id: "standard", label: "روش معمولی توان‌ها", microseconds: benchmark.standardMicroseconds },
              ]}
            />
          )}
          <StepPlayer key={`${expression}-${lambda}`} steps={result.steps} />
        </>
      )}
    </div>
  );
}

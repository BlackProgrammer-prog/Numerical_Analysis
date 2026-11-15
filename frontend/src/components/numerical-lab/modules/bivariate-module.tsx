import { useState } from "react";
import {
  derivativeCoefficients,
  formatPolynomial,
  parseBivariatePolynomial,
  reduceAtX,
  runBivariateNewton,
  type NewtonResult,
} from "@/lib/numerical";
import { getErrorMessage, INPUT_CLASS } from "../config";
import { NewtonForm, NewtonOutput } from "../newton-components";
import { ErrorMessage, FormField, ModuleIntro } from "../shared-components";

export function BivariateModule() {
  const [expression, setExpression] = useState("y^3+xy+1");
  const [fixedX, setFixedX] = useState("5");
  const [initial, setInitial] = useState("-0.2");
  const [result, setResult] = useState<NewtonResult | null>(null);
  const [coefficients, setCoefficients] = useState<number[]>([]);
  const [reducedExpression, setReducedExpression] = useState("");
  const [error, setError] = useState("");

  function execute(tolerance: number, maxIterations: number) {
    try {
      const polynomial = parseBivariatePolynomial(expression);
      const x = Number(fixedX);
      const reducedCoefficients = reduceAtX(polynomial, x);
      setCoefficients(reducedCoefficients);
      setReducedExpression(formatPolynomial(reducedCoefficients, "y"));
      setResult(runBivariateNewton(polynomial, x, {
        initial: Number(initial),
        tolerance,
        maxIterations,
      }));
      setError("");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }

  const fixedXField = (
    <FormField label="مقدار ثابت x">
      <input
        className={INPUT_CLASS}
        dir="ltr"
        type="number"
        step="any"
        value={fixedX}
        onChange={(event) => setFixedX(event.target.value)}
      />
    </FormField>
  );

  const derivativeExpression = formatPolynomial(
    derivativeCoefficients(coefficients),
    "y",
  );

  return (
    <div className="space-y-5">
      {/* <ModuleIntro
        title="نیوتن برای F(x,y)=0"
        text="x ثابت و مشتق جزئی نسبت به y محاسبه می‌شود. parser امن فقط چندجمله‌ای‌های x و y را می‌پذیرد."
      /> */}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFixedX("5")}
          className="rounded-full border px-3 py-1.5 text-xs"
        >
          x=5
        </button>
        <button
          type="button"
          onClick={() => setFixedX("-1")}
          className="rounded-full border px-3 py-1.5 text-xs"
        >
          x=−1
        </button>
      </div>

      <NewtonForm
        expression={expression}
        initial={initial}
        onExpressionChange={setExpression}
        onInitialChange={setInitial}
        onRun={execute}
        extraField={fixedXField}
      />
      <ErrorMessage text={error} />

      {reducedExpression && (
        <div className="rounded-xl border border-primary/30 bg-accent p-4">
          <p className="text-xs text-muted-foreground">پس از ثابت‌گرفتن x:</p>
          <p className="mt-1 font-mono" dir="ltr">
            F({fixedX}, y) = {reducedExpression}
          </p>
          <p className="font-mono text-sm" dir="ltr">
            Fᵧ = {derivativeExpression}
          </p>
        </div>
      )}

      {result && <NewtonOutput result={result} coefficients={coefficients} />}
    </div>
  );
}

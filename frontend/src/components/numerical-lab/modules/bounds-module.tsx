import { useState } from "react";
import { calculateBounds, parsePolynomial, runHorner, type HornerResult } from "@/lib/numerical";
import { formatNumber, getErrorMessage, INPUT_CLASS } from "../config";
import { HornerBoard, TrialList } from "../horner-components";
import { ErrorMessage, FormField, MetricCard, ModuleIntro } from "../shared-components";

type BoundsResult = ReturnType<typeof calculateBounds>;

export function BoundsModule() {
  const [expression, setExpression] = useState("x^3+2x-5");
  const [lambda, setLambda] = useState("1");
  const [bounds, setBounds] = useState<BoundsResult | null>(null);
  const [manualTrial, setManualTrial] = useState<HornerResult | null>(null);
  const [error, setError] = useState("");

  function coefficients() { return parsePolynomial(expression, "x").coefficients; }
  function findBounds() { try { setBounds(calculateBounds(coefficients())); setError(""); } catch (caughtError) { setError(getErrorMessage(caughtError)); } }
  function testLambda() { try { setManualTrial(runHorner(coefficients(), Number(lambda))); setError(""); } catch (caughtError) { setError(getErrorMessage(caughtError)); } }

  return <div className="space-y-5"><ModuleIntro title="کران بالا و پایین ریشه‌ها" text="برای کران پایین، q(x)=(-1)ⁿP(−x) ساخته و کران بالای q به کران پایین P تبدیل می‌شود." /><div className="rounded-xl border p-4"><FormField label="چندجمله‌ای"><input className={INPUT_CLASS} dir="ltr" value={expression} onChange={(event) => { setExpression(event.target.value); setBounds(null); }} /></FormField><div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr_1fr]"><input className={INPUT_CLASS} dir="ltr" type="number" step="any" value={lambda} onChange={(event) => setLambda(event.target.value)} /><button onClick={testLambda} className="h-11 rounded-lg border border-primary font-semibold text-primary">آزمون λ دلخواه</button><button onClick={findBounds} className="h-11 rounded-lg bg-primary font-semibold text-primary-foreground">یافتن بازهٔ صحیح</button></div></div><ErrorMessage text={error} />{manualTrial && <HornerBoard result={manualTrial} />}{bounds && <><div className="grid gap-3 sm:grid-cols-3"><MetricCard label="کران پایین" value={formatNumber(bounds.lower)} /><MetricCard label="کران بالا" value={formatNumber(bounds.upper.bound)} /><MetricCard label="بازهٔ نهایی" value={`[${bounds.lower}, ${bounds.upper.bound}]`} /></div><section className="rounded-xl border p-4"><h3 className="font-semibold">تبدیل کران پایین</h3><p className="mt-3 rounded-lg bg-secondary p-3 font-mono" dir="ltr">q(x) = (−1)ⁿP(−x) = {bounds.q.expression}</p><p className="mt-2 text-sm">کران بالای q برابر {bounds.lowerMagnitude.bound}؛ بنابراین کران پایین P برابر {bounds.lower} است.</p></section><div className="grid gap-4 lg:grid-cols-2"><TrialList title="آزمون‌های P" trials={bounds.upper.trials} /><TrialList title="آزمون‌های q" trials={bounds.lowerMagnitude.trials} /></div></>}</div>;
}

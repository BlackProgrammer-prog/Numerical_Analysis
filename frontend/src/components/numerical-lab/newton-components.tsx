import { useMemo, useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { samplePolynomial, type NewtonResult } from "@/lib/numerical";
import { formatNumber, INPUT_CLASS } from "./config";
import { FormField, StepPlayer } from "./shared-components";

interface NewtonFormProps {
  expression: string;
  initial: string;
  onExpressionChange: (value: string) => void;
  onInitialChange: (value: string) => void;
  onRun: (tolerance: number, maximum: number) => void;
  extraField?: ReactNode;
}

export function NewtonForm({ expression, initial, onExpressionChange, onInitialChange, onRun, extraField }: NewtonFormProps) {
  const [tolerance, setTolerance] = useState("0.000001");
  const [maximum, setMaximum] = useState("50");
  return (
    <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><FormField label="تابع چندجمله‌ای"><input className={INPUT_CLASS} dir="ltr" value={expression} onChange={(event) => onExpressionChange(event.target.value)} /></FormField></div>
      {extraField}
      <FormField label="حدس اولیه"><input className={INPUT_CLASS} dir="ltr" type="number" step="any" value={initial} onChange={(event) => onInitialChange(event.target.value)} /></FormField>
      <FormField label="خطای مجاز ε"><input className={INPUT_CLASS} dir="ltr" type="number" step="any" value={tolerance} onChange={(event) => setTolerance(event.target.value)} /></FormField>
      <FormField label="حداکثر تکرار"><input className={INPUT_CLASS} dir="ltr" type="number" value={maximum} onChange={(event) => setMaximum(event.target.value)} /></FormField>
      <button onClick={() => onRun(Number(tolerance), Number(maximum))} className="h-11 self-end rounded-lg bg-primary font-semibold text-primary-foreground">اجرای نیوتن–رافسون</button>
    </div>
  );
}

// function FunctionGraph({ coefficients, result }: { coefficients: number[]; result: NewtonResult }) {
//   const guesses = [
//     result.iterations[0]?.current,
//     ...result.iterations.map((iteration) => iteration.next),
//   ].filter((value): value is number => Number.isFinite(value));
//   const minimum = Math.min(...guesses, result.root) - 1;
//   const maximum = Math.max(...guesses, result.root) + 1;
//   const data = useMemo(
//     () => samplePolynomial(coefficients, minimum, maximum),
//     [coefficients, minimum, maximum],
//   );

//   return (
//     <section className="rounded-xl border p-4">
//       <h3 className="font-semibold">نمودار تابع و موقعیت حدس‌ها</h3>
//       <div className="mt-3 h-72" dir="ltr">
//         <ResponsiveContainer>
//           <LineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//             <XAxis
//               dataKey="x"
//               type="number"
//               domain={[minimum, maximum]}
//               tickFormatter={formatNumber}
//             />
//             <YAxis tickFormatter={formatNumber} />
//             <Tooltip />
//             <ReferenceLine y={0} stroke="currentColor" opacity={0.5} />
//             <Line
//               type="monotone"
//               dataKey="y"
//               stroke="var(--primary)"
//               dot={false}
//               strokeWidth={2}
//             />
//             {result.iterations.map((iteration) => (
//               <ReferenceDot
//                 key={iteration.iteration}
//                 x={iteration.current}
//                 y={iteration.value}
//                 r={5}
//                 fill="#6366f1"
//               />
//             ))}
//             <ReferenceDot x={result.root} y={0} r={7} fill="#10b981" />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </section>
//   );
// }

function IterationTable({ result }: { result: NewtonResult }) {
  return (
    <section className="overflow-hidden rounded-xl border">
      <h3 className="p-4 font-semibold">جدول کامل تکرارها</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-center text-sm" dir="ltr">
          <thead className="bg-secondary">
            <tr>
              <th className="p-3">n</th><th>xₙ</th><th>f(xₙ)</th>
              <th>f′(xₙ)</th><th>xₙ₊₁</th><th>|Δx|</th><th>|f(xₙ₊₁)|</th>
            </tr>
          </thead>
          <tbody>
            {result.iterations.map((iteration) => (
              <tr key={iteration.iteration} className="border-t font-mono">
                <td className="p-3">{iteration.iteration}</td>
                <td>{formatNumber(iteration.current)}</td>
                <td>{formatNumber(iteration.value)}</td>
                <td>{formatNumber(iteration.derivative)}</td>
                <td>{formatNumber(iteration.next)}</td>
                <td>{formatNumber(iteration.error)}</td>
                <td>{formatNumber(iteration.residual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function NewtonOutput({ result, coefficients }: { result: NewtonResult; coefficients: number[] }) {
  const learningSteps = result.iterations.flatMap((iteration) => iteration.steps);
  const resultTone = result.converged
    ? "border-emerald-500/40 bg-emerald-500/10"
    : "border-amber-500/40 bg-amber-500/10";

  return (
    <>
      <div className={`rounded-xl border p-4 ${resultTone}`}>
        <p className="font-semibold">{result.converged ? "✓ همگرایی موفق" : "عدم همگرایی"}</p>
        <p className="mt-1 text-sm">{result.message}</p>
        <p className="mt-2 font-mono text-xl" dir="ltr">root ≈ {formatNumber(result.root)}</p>
      </div>
      {/* <FunctionGraph coefficients={coefficients} result={result} /> */}
      <IterationTable result={result} />
      {learningSteps.length > 0 && (
        <StepPlayer
          key={`${result.root}-${learningSteps.length}`}
          steps={learningSteps}
        />
      )}
    </>
  );
}

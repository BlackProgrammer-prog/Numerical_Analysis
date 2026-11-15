import type { HornerResult } from "@/lib/numerical";
import { formatNumber } from "./config";

function HornerCell({ value, tone = "" }: { value: number | null; tone?: string }) {
  return <td className={`min-w-20 border-s border-border p-3 text-center font-mono ${tone}`}>{value === null ? "—" : formatNumber(value)}</td>;
}

function ResultCell({ label, value }: { label: string; value: string }) {
  return <div className="bg-card p-3"><span className="text-xs text-muted-foreground">{label}</span><p className="mt-1 font-mono" dir="ltr">{value}</p></div>;
}

export function HornerBoard({ result }: { result: HornerResult }) {
  const confirmed = result.boundStatus === "confirmed";
  return (
    <section className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-secondary/50 px-4 py-3"><h3 className="font-semibold">جدول سه‌ردیفهٔ هورنر</h3><p className="mt-1 text-xs text-muted-foreground">λ = {formatNumber(result.lambda)}؛ آخرین عدد ردیف جمع همان P(λ) است.</p></div>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-sm" dir="ltr"><tbody>
        <tr className="border-b"><th className="p-3" dir="rtl">ضرایب</th>{result.normalizedCoefficients.map((value, index) => <HornerCell key={index} value={value} />)}</tr>
        <tr className="border-b"><th className="p-3 text-primary" dir="rtl">حاصل‌ضرب‌ها</th>{result.products.map((value, index) => <HornerCell key={index} value={value} tone="text-primary" />)}</tr>
        <tr><th className="p-3" dir="rtl">جمع‌ها</th>{result.sums.map((value, index) => <HornerCell key={index} value={value} tone="bg-accent font-bold" />)}</tr>
      </tbody></table></div>
      <div className="grid gap-px border-t bg-border sm:grid-cols-3"><ResultCell label="خارج‌قسمت" value={`[${result.quotient.map(formatNumber).join(", ")}]`} /><ResultCell label="باقی‌مانده" value={formatNumber(result.remainder)} /><ResultCell label="مقدار P(λ)" value={formatNumber(result.value)} /></div>
      <div className={`border-t p-3 text-sm ${confirmed ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>{confirmed ? "✓ این λ توسط آزمون هورنر به‌عنوان کران بالا تأیید شد." : result.boundStatus === "not-confirmed" ? "این λ تأیید نشد؛ این نتیجه رد قطعی کران نیست." : "آزمون کران فقط برای λ مثبت قابل استفاده است."}</div>
    </section>
  );
}

export function TrialList({ title, trials }: { title: string; trials: HornerResult[] }) {
  return <section className="rounded-xl border p-4"><h3 className="font-semibold">{title}</h3><div className="mt-3 space-y-2">{trials.map((trial) => <div key={trial.lambda} className={`rounded-lg p-3 text-sm ${trial.boundStatus === "confirmed" ? "bg-emerald-500/10" : "bg-secondary"}`}><div className="flex justify-between"><strong>λ = {trial.lambda}</strong><span>{trial.boundStatus === "confirmed" ? "تأیید شد" : "تأیید نشد"}</span></div><p className="mt-1 font-mono text-xs" dir="ltr">[{trial.sums.map(formatNumber).join(", ")}]</p></div>)}</div></section>;
}

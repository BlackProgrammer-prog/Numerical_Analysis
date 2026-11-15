import { useState, type ReactNode } from "react";
import { BookOpen, ChevronLeft, RotateCcw } from "lucide-react";
import type { LearningStep } from "@/lib/numerical";

export function FormField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function ModuleIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-accent/60 p-4">
      <div className="flex gap-3">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm leading-7 text-muted-foreground">{text}</p></div>
      </div>
    </div>
  );
}

export function ErrorMessage({ text }: { text: string }) {
  return text ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{text}</p> : null;
}

export function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-secondary/50 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-mono text-xl font-bold" dir="ltr">{value}</p></div>;
}

function stepTone(kind: LearningStep["kind"]): string {
  if (kind === "success") return "border-emerald-500/40 bg-emerald-500/10";
  if (kind === "warning") return "border-amber-500/40 bg-amber-500/10";
  return "border-border bg-secondary/40";
}

export function StepPlayer({ steps }: { steps: LearningStep[] }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const visibleSteps = steps.slice(0, visibleCount);

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="font-semibold">حالت آموزشی قدم‌به‌قدم</h3><p className="mt-1 text-xs text-muted-foreground">هر کلیک فقط یک عملیات جدید را آشکار می‌کند.</p></div>
        <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs">{Math.min(visibleCount, steps.length)} / {steps.length}</span>
      </div>
      <div className="mt-4 space-y-2">
        {visibleSteps.map((step, index) => (
          <div key={step.id} className={`animate-in slide-in-from-top-2 rounded-lg border p-3 ${stepTone(step.kind)}`}>
            <div className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
              <div className="min-w-0"><p className="text-sm font-semibold">{step.title}</p><p className="mt-0.5 text-xs leading-6 text-muted-foreground">{step.description}</p><code className="mt-2 block overflow-x-auto rounded bg-background px-2 py-1.5 text-left text-xs" dir="ltr">{step.expression}</code></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={visibleCount >= steps.length} onClick={() => setVisibleCount((count) => Math.min(count + 1, steps.length))} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"><ChevronLeft className="h-4 w-4" />مرحلهٔ بعد</button>
        <button type="button" onClick={() => setVisibleCount(1)} className="grid h-10 w-10 place-items-center rounded-lg border border-border" aria-label="شروع مجدد"><RotateCcw className="h-4 w-4" /></button>
      </div>
    </section>
  );
}

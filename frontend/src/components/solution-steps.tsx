import type { SolutionStep } from "@/lib/api";

export function SolutionSteps({ steps, loading }: { steps: SolutionStep[]; loading: boolean }) {
  if (steps.length === 0) {
    return (
      <p role="status" className="text-sm leading-7 text-muted-foreground">
        {loading ? "در حال محاسبهٔ مراحل حل…" : "برای دیدن مراحل حل با عدد و مبناهای انتخابی، ابتدا تبدیل مبنا را انجام دهید."}
      </p>
    );
  }

  return (
    <div className="max-h-[32rem] overflow-y-auto pe-2" role="region" aria-label="مراحل محاسبه" tabIndex={0}>
      <ol className="space-y-4" dir="rtl">
        {steps.map((step, index) => (
          <li key={index} className="rounded-lg border border-border bg-secondary/30 p-3">
            <h3 className="text-sm font-semibold">
              <span className="me-2 text-primary">گام {(index + 1).toLocaleString("fa-IR")}</span>
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">{step.description}</p>
            {step.expression && (
              <pre dir="ltr" className="mt-2 whitespace-pre-wrap break-all rounded-md bg-background p-2 text-left font-mono text-sm leading-6">
                {step.expression}
              </pre>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

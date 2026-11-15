import { Gauge } from "lucide-react";

export interface RuntimeMethod {
  id: string;
  label: string;
  microseconds: number;
}

interface RuntimeComparisonProps {
  title?: string;
  methods: [RuntimeMethod, RuntimeMethod];
  iterations: number;
}

function formatTime(microseconds: number): string {
  if (microseconds < 1) return `${(microseconds * 1000).toFixed(1)} ns`;
  if (microseconds < 1000) return `${microseconds.toFixed(2)} µs`;
  return `${(microseconds / 1000).toFixed(3)} ms`;
}

export function RuntimeComparison({
  title = "مقایسهٔ زمان اجرا",
  methods,
  iterations,
}: RuntimeComparisonProps) {
  const [first, second] = methods;
  const faster = first.microseconds <= second.microseconds ? first : second;
  const slower = faster === first ? second : first;
  const speedup = slower.microseconds / Math.max(faster.microseconds, Number.EPSILON);
  const maxTime = Math.max(first.microseconds, second.microseconds, Number.EPSILON);

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2">
          <Gauge className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              میانهٔ زمان هر اجرا در {iterations.toLocaleString("fa-IR")} تکرار
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          {faster.label} سریع‌تر است
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {methods.map((method) => (
          <div key={method.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span>{method.label}</span>
              <span className="font-mono" dir="ltr">{formatTime(method.microseconds)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${method.id === faster.id ? "bg-emerald-500" : "bg-primary/60"}`}
                style={{ width: `${Math.max(3, method.microseconds / maxTime * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-xs leading-6 text-muted-foreground">
        در این اجرا، {faster.label} تقریباً {speedup.toFixed(2)} برابر سریع‌تر از {slower.label} بود. زمان‌ها به دستگاه، مرورگر و بار سیستم وابسته‌اند.
      </p>
    </section>
  );
}

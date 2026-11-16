import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { ArrowLeftRight, Info } from "lucide-react";
import {
  BaseSelector,
  CustomBaseDialog,
  Footer,
  Header,
  MethodSelector,
  ResultPanel,
  SolutionAccordion,
} from "@/components/calculator";
import { MAX_BASE, validateExtraDigits, type ConversionMethod } from "@/lib/bases";
import { convertNumber, type ConversionBenchmark, type SolutionStep } from "@/lib/api";
import { SolutionSteps } from "@/components/solution-steps";
import { PolynomialLab } from "@/components/polynomial-lab";
import { RuntimeComparison } from "@/components/runtime-comparison";
import { CustomDigitsDialog } from "@/components/custom-digits-dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Base Converter — Number Base Conversion Calculator" },
      { name: "description", content: "ماشین‌حساب تبدیل مبنا با روش معمول و قضیه هورنر؛ پروژه درس آنالیز ریاضی." },
      { property: "og:title", content: "Base Converter — Number Base Conversion Calculator" },
      { property: "og:description", content: "ماشین‌حساب تبدیل مبنا با روش معمول و قضیه هورنر." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Side = "source" | "target";

export function Index() {
  const [workspace, setWorkspace] = useState<"conversion" | "numerical">("conversion");
  const [method, setMethod] = useState<ConversionMethod>("standard");
  const [extraDigits, setExtraDigits] = useState("");
  const [digitsDialogOpen, setDigitsDialogOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [sourceBase, setSourceBase] = useState<string>("10");
  const [targetBase, setTargetBase] = useState<string>("2");
  const [dialogFor, setDialogFor] = useState<Side | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<SolutionStep[]>([]);
  const [benchmark, setBenchmark] = useState<ConversionBenchmark | null>(null);
  const revision = useRef(0);

  const invalidateResult = () => {
    revision.current += 1;
    setResult(null);
    setSteps([]);
    setBenchmark(null);
    setNotice(false);
    setError(null);
  };

  const closeDialog = useCallback(() => setDialogFor(null), []);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    invalidateResult();
    if (number.trim() === "") return setError("لطفاً عدد ورودی را وارد کنید.");
    const alphabetError = validateExtraDigits(extraDigits, Math.max(Number(sourceBase), Number(targetBase)));
    if (alphabetError) return setError(alphabetError);
    const requestRevision = revision.current;
    setLoading(true);
    try {
      const response = await convertNumber({
        number, sourceBase: Number(sourceBase), targetBase: Number(targetBase), method,
        ...(extraDigits ? { extraDigits } : {}),
      });
      if (revision.current !== requestRevision) return;
      setResult(response.result);
      setSteps(response.steps);
      setBenchmark(response.benchmark);
      setNotice(response.truncated);
    } catch (error) {
      if (revision.current === requestRevision) {
        setError(error instanceof Error ? error.message : "خطایی در محاسبه رخ داد.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6 sm:py-10">
        <Header />

        <main className="mt-8 flex-1">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary p-1">
              <button type="button" onClick={() => setWorkspace("conversion")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${workspace === "conversion" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>تبدیل مبنا</button>
              <button type="button" onClick={() => setWorkspace("numerical")} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${workspace === "numerical" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>تعیین بازه ریشه</button>
            </div>
            {workspace === "conversion" ? <>
            <MethodSelector value={method} onChange={(m) => { invalidateResult(); setMethod(m); }} />

            <form onSubmit={handleConvert} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="number" className="mb-1.5 block text-sm font-medium">عدد ورودی</label>
                <input
                  id="number"
                  type="text"
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                  value={number}
                  onChange={(e) => { invalidateResult(); setNumber(e.target.value); }}
                  placeholder="مثلاً 45"
                  aria-invalid={!!error}
                  aria-describedby={error ? "number-error" : undefined}
                  className="h-12 w-full rounded-lg border border-input bg-background px-3 font-mono text-base tracking-wide placeholder:text-end placeholder:font-sans placeholder:text-muted-foreground focus:border-ring"
                />
                {error && <p id="number-error" className="mt-1.5 text-sm text-destructive">{error}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <BaseSelector
                  id="source-base"
                  label="مبنای ورودی"
                  value={sourceBase}
                  onSelect={(b) => { invalidateResult(); setSourceBase(String(b)); }}
                  onCustom={() => setDialogFor("source")}
                />
                <BaseSelector
                  id="target-base"
                  label="مبنای خروجی"
                  value={targetBase}
                  onSelect={(b) => { invalidateResult(); setTargetBase(String(b)); }}
                  onCustom={() => setDialogFor("target")}
                />
              </div>

              {(Math.max(Number(sourceBase), Number(targetBase)) > MAX_BASE || extraDigits !== "") && (
                <div>
                  <button type="button" onClick={() => setDigitsDialogOpen(true)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium">تنظیم جدول کاراکترها</button>
                  <p className="mt-2 text-sm text-muted-foreground">کاراکترهای ارقام بالاتر از ۶۱ را در جدول تعیین کنید.</p>
                  <div className="mt-2 flex flex-wrap gap-2" dir="ltr">
                    {Array.from(extraDigits).map((symbol, index) => <span key={index} className="rounded border border-border px-2 font-mono text-sm">{62 + index} = {symbol}</span>)}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-90 active:scale-[0.99]"
              >
                <ArrowLeftRight className="h-4 w-4" />
                {loading ? "در حال محاسبه…" : "تبدیل مبنا"}
              </button>

              {notice && (
                <p role="status" className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
                  <Info className="h-4 w-4 shrink-0" />
                  نتیجه تا ۲۰ رقم اعشار قطع شده است و دقیق نیست.
                </p>
              )}
            </form>

            <div className="mt-6 space-y-3">
              <ResultPanel result={result} />
              {benchmark && (
                <RuntimeComparison
                  title="مقایسهٔ زمان تبدیل مبنا"
                  iterations={benchmark.iterations}
                  methods={[
                    {
                      id: "standard",
                      label: "روش معمولی",
                      microseconds: benchmark.standard.medianMicroseconds,
                    },
                    {
                      id: "horner",
                      label: "روش هورنر",
                      microseconds: benchmark.horner.medianMicroseconds,
                    },
                  ]}
                />
              )}
              <SolutionAccordion>
                <SolutionSteps steps={steps} loading={loading} />
              </SolutionAccordion>
            </div>
            </> : <PolynomialLab />}
          </div>
        </main>

        <Footer />
      </div>

      <CustomBaseDialog
        open={dialogFor !== null}
        onClose={closeDialog}
        onConfirm={(b) => {
          invalidateResult();
          if (dialogFor === "source") setSourceBase(b);
          if (dialogFor === "target") setTargetBase(b);
          if (Number(b) > MAX_BASE) setDigitsDialogOpen(true);
          setDialogFor(null);
        }}
      />
      {digitsDialogOpen && <CustomDigitsDialog
        requiredBase={Math.max(Number(sourceBase), Number(targetBase))}
        value={extraDigits}
        onClose={() => setDigitsDialogOpen(false)}
        onConfirm={(digits) => {
          invalidateResult();
          setExtraDigits(digits);
          setDigitsDialogOpen(false);
        }}
      />}
    </div>
  );
}

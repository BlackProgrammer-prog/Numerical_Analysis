import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Moon, Plus, Sigma, Sun, X } from "lucide-react";
import { MAX_BASE, STANDARD_BASES, getBaseName, validateCustomBase, type ConversionMethod } from "@/lib/bases";

/* ---------- Theme toggle ---------- */

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const label = dark ? "تغییر به حالت روشن" : "تغییر به حالت تیره";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}

/* ---------- Header ---------- */

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4" dir="ltr">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <Sigma className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight tracking-tight">Base Converter</h1>
          <p className="text-xs text-muted-foreground">Number Base Conversion Calculator</p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}

/* ---------- Method selector ---------- */

const METHODS: { id: ConversionMethod; fa: string; en: string }[] = [
  { id: "standard", fa: "روش معمول", en: "Standard Method" },
  { id: "horner", fa: "قضیه هورنر", en: "Horner's Method" },
];

export function MethodSelector({
  value,
  onChange,
}: {
  value: ConversionMethod;
  onChange: (m: ConversionMethod) => void;
}) {
  return (
    <div role="radiogroup" aria-label="روش تبدیل" className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary p-1">
      {METHODS.map((m) => {
        const active = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m.id)}
            className={`rounded-lg px-3 py-2.5 text-center transition-all ${
              active ? "bg-card text-accent-foreground shadow-soft ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="block text-sm font-semibold">{m.fa}</span>
            <span className="block text-[11px] opacity-75" dir="ltr">{m.en}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Base selector (dropdown) ---------- */

export function BaseSelector({
  id,
  label,
  value,
  onSelect,
  onCustom,
}: {
  id: string;
  label: string;
  value: number | string;
  onSelect: (base: number) => void;
  onCustom: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    // focus selected option
    const sel = listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    (sel ?? listRef.current?.querySelector<HTMLButtonElement>("button"))?.focus();
    sel?.scrollIntoView({ block: "nearest" });
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onListKey = (e: React.KeyboardEvent) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(i - 1, 0)]?.focus(); }
    if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  };

  const numeric = typeof value === "number" ? value : Number(value);
  const display = Number.isSafeInteger(numeric) ? getBaseName(numeric) : `Base ${value}`;

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-start transition-colors hover:border-ring/60"
        dir="ltr"
      >
        <span className="min-w-0 truncate text-sm">
          <span className="font-mono font-semibold">{value}</span>
          <span className="text-muted-foreground"> · {display}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-lg border border-border bg-popover shadow-pop">
          <ul ref={listRef} role="listbox" aria-label={label} onKeyDown={onListKey} className="max-h-64 overflow-y-auto p-1" dir="ltr">
            {STANDARD_BASES.map((b) => {
              const selected = String(b.value) === String(value);
              return (
                <li key={b.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => { onSelect(b.value); setOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-start text-sm outline-none transition-colors hover:bg-secondary focus-visible:bg-secondary ${
                      selected ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    <span className="w-6 font-mono font-semibold">{b.value}</span>
                    <span className="flex-1 truncate">
                      {b.name}
                      {b.persian && <span className="ms-1.5 text-xs text-muted-foreground">({b.persian})</span>}
                    </span>
                    {selected && <Check className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border p-1">
            <button
              type="button"
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              onClick={() => { setOpen(false); onCustom(); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
              dir="rtl"
            >
              <Plus className="h-4 w-4" />
              وارد کردن مبنای دلخواه
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Custom base dialog ---------- */

// Rules supported by both backend algorithms.
export const CONVERSION_RULES: ReactNode[] = [
  `مبنای ورودی و خروجی باید عدد صحیح بین ۲ تا ${MAX_BASE.toLocaleString("fa-IR")} باشند.`,
  "ارقام مجاز 0 تا 9، حروف A تا Z و a تا z هستند؛ در مبناهای بالاتر از ۳۶ حروف بزرگ و کوچک متفاوت‌اند و ارزش هر رقم باید از مبنای ورودی کمتر باشد.",
  "علامت مثبت یا منفی در ابتدای عدد و یک نقطه برای بخش اعشاری مجاز است.",
  "حداکثر طول ورودی ۵۱۲ نویسه است. نتیجه تا ۲۰ رقم اعشار نمایش داده می‌شود و در صورت قطع شدن، پیام نمایش داده خواهد شد.",
];

export function CustomBaseDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (base: string) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setInput("");
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCustomBase(input);
    if (err) return setError(err);
    onConfirm(input.trim().replace(/^0+/, ""));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-overlay p-4 animate-in fade-in" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-base-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-pop animate-in zoom-in-95"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute end-4 top-4 grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="custom-base-title" className="pe-8 text-lg font-semibold">هشدار: مبنای دلخواه</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          قبل از وارد کردن مبنای دلخواه، لطفاً ضوابط و قوانین تبدیل را مطالعه کنید.
        </p>

        <section className="mt-5 rounded-xl border border-border bg-secondary/60 p-4">
          <h3 className="text-sm font-semibold">ضوابط تبدیل</h3>
          {CONVERSION_RULES.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-7">
              {CONVERSION_RULES.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
        </section>

        <form onSubmit={submit} className="mt-5" noValidate>
          <label htmlFor="custom-base" className="mb-1.5 block text-sm font-medium">مبنای دلخواه</label>
          <input
            ref={inputRef}
            id="custom-base"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            placeholder="مبنای موردنظر را وارد کنید"
            aria-invalid={!!error}
            aria-describedby={error ? "custom-base-error" : undefined}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm placeholder:text-end placeholder:font-sans placeholder:text-muted-foreground focus:border-ring"
          />
          {error && <p id="custom-base-error" className="mt-1.5 text-sm text-destructive">{error}</p>}

          <div className="mt-5 flex gap-2">
            <button type="submit" className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              تأیید
            </button>
            <button type="button" onClick={onClose} className="h-10 flex-1 rounded-lg border border-border bg-card text-sm font-medium transition-colors hover:bg-secondary">
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Result panel ---------- */

export function ResultPanel({ result }: { result: string | null }) {
  return (
    <section aria-labelledby="result-title" className="rounded-xl border border-border bg-secondary/50 p-4">
      <h2 id="result-title" className="text-sm font-medium text-muted-foreground">نتیجه تبدیل</h2>
      {result !== null && (
        <output className="mt-2 block break-all font-mono text-2xl font-semibold text-foreground" dir="ltr">{result}</output>
      )}
    </section>
  );
}

/* ---------- Solution accordion ---------- */

export function SolutionAccordion({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-xl border border-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="solution-content"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary/60"
      >
        روش حل
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id="solution-content"
        hidden={!open}
        className="min-h-12 border-t border-border px-4 py-3"
      >
        {children}
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border pt-6 text-center text-sm leading-7 text-muted-foreground">
      <p>کاری از بچه‌های علوم کامپیوتر دانشگاه شاهد</p>
      <p>پروژه درس آنالیز ریاضی - پاییز 1405</p>
      <p><a href="https://github.com">لینک پروژه</a></p>
    </footer>
  );
}

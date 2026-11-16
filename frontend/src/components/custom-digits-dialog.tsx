import { useState } from "react";
import { MAX_BASE, validateExtraDigits } from "@/lib/bases";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function CustomDigitsDialog({ requiredBase, value, onClose, onConfirm }: {
  requiredBase: number;
  value: string;
  onClose: () => void;
  onConfirm: (digits: string) => void;
}) {
  const [symbols, setSymbols] = useState(() => {
    const existing = Array.from(value);
    return Array.from({ length: Math.max(requiredBase - MAX_BASE, existing.length) }, (_, i) => existing[i] ?? "");
  });
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (symbols.some((symbol) => Array.from(symbol).length !== 1)) {
      setError("برای هر ردیف دقیقاً یک کاراکتر وارد کنید.");
      return;
    }
    const digits = symbols.join("");
    const validationError = validateExtraDigits(digits, requiredBase);
    if (validationError) { setError(validationError); return; }
    onConfirm(digits);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent dir="rtl" className="max-h-[90vh] w-[calc(100%-2rem)] rounded-2xl border-border bg-card">
        <DialogTitle className="pe-6">جدول کاراکترهای دلخواه</DialogTitle>
        <DialogDescription className="leading-7">
          برای هر ارزش یک کاراکتر یکتا تعیین کنید. ارقام 0–9، A–Z و a–z ثابت هستند؛ فاصله و علامت‌های + - . مجاز نیستند.
        </DialogDescription>
        <form onSubmit={submit} className="min-h-0 space-y-4" noValidate>
          <div className="max-h-[50vh] overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">نگاشت ارزش رقم به کاراکتر دلخواه</caption>
              <thead className="sticky top-0 bg-secondary">
                <tr><th scope="col" className="px-4 py-3 text-start">ارزش رقم (مبنای ده)</th><th scope="col" className="px-4 py-3 text-start">کاراکتر دلخواه</th></tr>
              </thead>
              <tbody>
                {symbols.map((symbol, index) => (
                  <tr key={index} className="border-t border-border">
                    <th scope="row" className="px-4 py-2 text-start font-mono">{MAX_BASE + index}</th>
                    <td className="px-4 py-2">
                      <input aria-label={`کاراکتر رقم ${MAX_BASE + index}`} type="text" dir="ltr"
                        autoComplete="off" spellCheck={false} value={symbol}
                        aria-invalid={!!error} aria-describedby={error ? "digit-table-error" : undefined}
                        onChange={(event) => {
                          setSymbols((current) => current.map((item, i) => i === index ? event.target.value : item));
                          setError(null);
                        }}
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-center font-mono text-lg" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && <p id="digit-table-error" role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground">ذخیره کاراکترها</button>
            <button type="button" onClick={onClose} className="h-10 flex-1 rounded-lg border border-border text-sm">انصراف</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

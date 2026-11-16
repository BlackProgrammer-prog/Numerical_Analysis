"""Optional, JSON-safe explanations recorded by the calculation loops."""

from conversion_validation import DIGITS


def record(steps, title, description, expression=""):
    if steps is not None:
        steps.append({"title": title, "description": description, "expression": expression})


def integer_in_base(value, base, digits=DIGITS):
    if value == 0:
        return "0"
    result = []
    while value:
        value, remainder = divmod(value, base)
        result.append(digits[remainder])
    return "".join(reversed(result))


def fraction_step(steps, before, base, product, digit, remainder, digits=DIGITS):
    record(steps, "استخراج رقم اعشار",
           f"کسر باقی‌مانده را در {base} ضرب می‌کنیم؛ بخش صحیح، رقم بعدی «{digits[digit]}» است و بخش کسری برای مرحلهٔ بعد می‌ماند. همهٔ مقادیر این رابطه در مبنای ده هستند.",
           f"{before} × {base} = {product}; digit = {digit}; remainder = {remainder}")


def fraction_end(steps, remainder, precision, result):
    record(steps, "پایان بخش اعشاری",
           (f"به سقف {precision} رقم اعشار رسیدیم؛ کسر باقی‌مانده صفر نیست و نتیجه به سمت صفر قطع می‌شود."
            if remainder else "کسر باقی‌مانده صفر است؛ بخش اعشاری دقیق به دست آمد.")
           + " رقم‌های استخراج‌شده را به ترتیب از بالا به پایین می‌خوانیم.",
           f"fractional digits = {result or '(none)'}; remainder = {remainder}")

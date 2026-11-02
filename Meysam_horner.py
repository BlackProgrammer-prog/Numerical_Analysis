from fractions import Fraction
from conversion_validation import normalize_number, validate_base, validate_precision
from solution_steps import record, integer_in_base, fraction_step, fraction_end

digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def convert(number, x, y, precision=20, steps=None):

    validate_base(y)
    validate_precision(precision)
    number = normalize_number(number, x)
    original_number = number

    negative = False

    if number.startswith("-"):
        negative = True
        record(steps, "جدا کردن علامت", "قدر مطلق را تبدیل می‌کنیم و در پایان، علامت منفی را برای مقدار غیرصفر برمی‌گردانیم.")
        number = number[1:]
    elif number.startswith("+"):
        number = number[1:]

    parts = number.split(".")

    integer_part = parts[0] if parts[0] else "0"
    fraction_part = parts[1] if len(parts) == 2 else ""

    integer_digits = [digits.index(ch) for ch in integer_part]
    fraction_digits = [digits.index(ch) for ch in fraction_part]

    result = [0]
    record(steps, "شروع هورنر برای بخش صحیح",
           f"از صفر شروع می‌کنیم. رقم‌ها را از چپ به راست می‌خوانیم؛ در هر مرحله حاصل قبلی را در مبنای مبدأ ({x}) ضرب و ارزش رقم بعدی را اضافه می‌کنیم. محاسبه مستقیماً روی رقم‌های مبنای مقصد ({y}) انجام می‌شود.",
           "H = 0; H_next = H × source_base + digit")

    for digit in integer_digits:
        if steps is not None:
            before = "".join(digits[d] for d in reversed(result))

        carry = 0

        for i in range(len(result)):
            value = result[i] * x + carry
            result[i] = value % y
            carry = value // y

        while carry:
            result.append(carry % y)
            carry //= y

        carry = digit
        i = 0

        while carry:
            if i == len(result):
                result.append(0)

            value = result[i] + carry
            result[i] = value % y
            carry = value // y
            i += 1

        if steps is not None:
            after = "".join(digits[d] for d in reversed(result))
            record(steps, "ضرب و جمع هورنر",
                   f"رقم بعدی «{digits[digit]}» با ارزش ده‌دهی {digit} را وارد می‌کنیم. همهٔ عملوندهای رابطهٔ زیر در مبنای مقصد {y} نوشته شده‌اند؛ ضرب و جمع با انتقال رقم در همین مبنا انجام می‌شود.",
                   f"({before})_{y} × ({integer_in_base(x, y)})_{y} + ({integer_in_base(digit, y)})_{y} = ({after})_{y}")

    integer_result = ""

    for d in reversed(result):
        integer_result += digits[d]
    record(steps, "پایان هورنر بخش صحیح", "همهٔ رقم‌های صحیح خوانده شدند؛ مقدار انباشته‌شده، بخش صحیح در مبنای مقصد است.", f"({integer_result})_{y}")

    fraction = Fraction(0, 1)
    if fraction_digits:
        record(steps, "هورنر معکوس برای بخش اعشاری",
               "از صفر شروع می‌کنیم و رقم‌های اعشار را از راست به چپ می‌خوانیم؛ در هر مرحله رقم را اضافه و حاصل را بر مبنای مبدأ تقسیم می‌کنیم. کسرها در روابط این بخش در مبنای ده و دقیق هستند.",
               "F = 0; F_next = (F + digit) / source_base")

    for digit in reversed(fraction_digits):
        before = fraction
        fraction = (fraction + digit) / x
        record(steps, "گام هورنر معکوس", f"رقم «{digits[digit]}» با ارزش {digit} را اضافه و حاصل را بر {x} تقسیم می‌کنیم.", f"({before} + {digit}) / {x} = {fraction}")

    fraction_result = ""
    had_fraction = bool(fraction)

    for _ in range(precision):

        if fraction == 0:
            break

        before = fraction
        fraction *= y
        product = fraction

        digit = fraction.numerator // fraction.denominator

        fraction -= digit

        fraction_result += digits[digit]
        fraction_step(steps, before, y, product, digit, fraction)

    if had_fraction:
        fraction_end(steps, fraction, precision, fraction_result)

    answer = integer_result

    if fraction_result:
        answer += "." + fraction_result

    if negative and (any(integer_digits) or any(fraction_digits)):
        answer = "-" + answer

    record(steps, "نتیجهٔ نهایی", "بخش صحیح و اعشاری را کنار هم می‌گذاریم و علامت عدد را اعمال می‌کنیم.", f"({original_number})_{x} → ({answer})_{y}")

    return answer


def main():
    try:
        number = input("Enter number: ")
        x = int(input("Source base: "))
        y = int(input("Destination base: "))
        print("Result:", convert(number, x, y))
    except ValueError as error:
        print("Error:", error)


if __name__ == "__main__":
    main()

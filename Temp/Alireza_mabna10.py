from fractions import Fraction
from conversion_validation import (
    DIGITS,
    DIGIT_TO_VALUE,
    normalize_number,
    validate_base,
    validate_precision,
)
from solution_steps import record, fraction_step, fraction_end


def digit_to_value(digit):
    return DIGIT_TO_VALUE[digit]


def convert_to_decimal(number, source_base, steps=None):

    number = normalize_number(number, source_base)

    is_negative = number.startswith("-")

    if number.startswith(("-", "+")):
        number = number[1:]

    integer_part, _, fractional_part = number.partition(".")

    # convert ghesmate sahih
    decimal_number = 0

    for exponent, digit in enumerate(reversed(integer_part)):
        value = digit_to_value(digit)
        term = value * source_base ** exponent
        previous = decimal_number
        decimal_number += term
        record(steps, "ارزش مکانی رقم صحیح",
               f"رقم «{digit}» ارزش {value} دارد و در جایگاه توان {exponent} از مبنای {source_base} است. حاصل را به مجموع قبلی اضافه می‌کنیم؛ مقادیر رابطه در مبنای ده هستند.",
               f"{value} × {source_base}^{exponent} = {term}; {previous} + {term} = {decimal_number}")

    # convert ashari part
    place_value = Fraction(1, source_base)

    for position, digit in enumerate(fractional_part, 1):
        value = digit_to_value(digit)
        term = value * place_value
        previous = decimal_number
        decimal_number += term
        record(steps, "ارزش مکانی رقم اعشار",
               f"رقم «{digit}» ارزش {value} دارد؛ آن را بر مبنای {source_base} به توان {position} تقسیم و به مجموع اضافه می‌کنیم. مقادیر رابطه در مبنای ده هستند.",
               f"{value} / {source_base}^{position} = {term}; {previous} + {term} = {decimal_number}")
        place_value /= source_base

    decimal_number = Fraction(decimal_number)
    record(steps, "مقدار در مبنای ده", "مجموع ارزش مکانی رقم‌ها، قدرمطلق عدد را در مبنای ده می‌دهد.", str(decimal_number))

    if is_negative:
        decimal_number = -decimal_number

    return decimal_number


def convert_from_decimal(number, target_base, max_fraction_digits=20, steps=None):

    validate_base(target_base)
    validate_precision(max_fraction_digits)
    number = Fraction(number)

    is_negative = number < 0
    number = abs(number)

    integer_part = number.numerator // number.denominator
    fractional_part = number - integer_part

    if integer_part == 0:
        integer_result = "0"
        record(steps, "بخش صحیح صفر است", "رقم بخش صحیح در مبنای مقصد، صفر است.", "0")

    else:
        integer_result = ""

        while integer_part > 0:
            remainder = integer_part % target_base
            quotient = integer_part // target_base
            record(steps, "تقسیم صحیح متوالی",
                   f"عدد {integer_part} را بر {target_base} تقسیم می‌کنیم؛ خارج‌قسمت {quotient} و باقی‌مانده {remainder} است. رقم متناظر باقی‌مانده «{DIGITS[remainder]}» است. مرحلهٔ بعد را با خارج‌قسمت ادامه می‌دهیم. مقادیر تقسیم در مبنای ده هستند.",
                   f"{integer_part} = {target_base} × {quotient} + {remainder}")
            integer_result = DIGITS[remainder] + integer_result
            integer_part = quotient

        record(steps, "چیدن رقم‌های صحیح", "خارج‌قسمت صفر شد. باقی‌مانده‌ها را از پایین به بالا می‌خوانیم تا بخش صحیح در مبنای مقصد به دست آید.", f"({integer_result})_{target_base}")


    fractional_result = ""

    had_fraction = bool(fractional_part)
    for _ in range(max_fraction_digits):
        if fractional_part == 0:
            break

        before = fractional_part
        fractional_part *= target_base
        product = fractional_part

        digit_value = (
            fractional_part.numerator // fractional_part.denominator
        )

        fractional_result += DIGITS[digit_value]
        fractional_part -= digit_value
        fraction_step(steps, before, target_base, product, digit_value, fractional_part)

    if had_fraction:
        fraction_end(steps, fractional_part, max_fraction_digits, fractional_result)


    result = integer_result

    if fractional_result:
        result += "." + fractional_result

    if is_negative and number != 0:
        result = "-" + result

    return result


def convert_base(number, source_base, target_base, precision=20, steps=None):

    validate_base(target_base)
    validate_precision(precision)
    number = normalize_number(number, source_base)
    if number.startswith("-"):
        record(steps, "جدا کردن علامت", "ابتدا قدرمطلق عدد را تبدیل می‌کنیم و در پایان، علامت منفی را برای مقدار غیرصفر برمی‌گردانیم.")

    decimal_number = convert_to_decimal(number, source_base, steps)

    result = convert_from_decimal(decimal_number, target_base, precision, steps)
    record(steps, "نتیجهٔ نهایی", "بخش صحیح و اعشاری را کنار هم قرار می‌دهیم و علامت عدد را اعمال می‌کنیم.", f"({number})_{source_base} → ({result})_{target_base}")

    return result


def main():
    try:
        number = input("Number: ")
        source_base = int(input("Base: "))
        target_base = int(input("Final Base: "))

        result = convert_base(number, source_base, target_base)

        print("Answer:", result)

    except ValueError as error:
        print("error:", error)


if __name__ == "__main__":
    main()

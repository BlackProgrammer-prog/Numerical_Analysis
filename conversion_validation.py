"""Shared validation for the two independently implemented algorithms."""

DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
MAX_NUMBER_LENGTH = 512
MAX_PRECISION = 100


def validate_base(base):
    if type(base) is not int or not 2 <= base <= 36:
        raise ValueError("Base must be an integer between 2 and 36.")


def validate_precision(precision):
    if type(precision) is not int or not 0 <= precision <= MAX_PRECISION:
        raise ValueError(f"Precision must be an integer between 0 and {MAX_PRECISION}.")


def normalize_number(number, source_base):
    validate_base(source_base)
    if not isinstance(number, str):
        raise ValueError("Number must be a string.")
    if len(number) > MAX_NUMBER_LENGTH:
        raise ValueError(f"Number must contain at most {MAX_NUMBER_LENGTH} characters.")
    number = number.strip().upper()
    unsigned = number[1:] if number.startswith(("-", "+")) else number
    if not unsigned or unsigned == "." or unsigned.count(".") > 1:
        raise ValueError("Enter a valid number with at most one decimal point.")
    for digit in unsigned:
        if digit == ".":
            continue
        if digit not in DIGITS or DIGITS.index(digit) >= source_base:
            raise ValueError(f"Digit '{digit}' is not valid in base {source_base}.")
    return number

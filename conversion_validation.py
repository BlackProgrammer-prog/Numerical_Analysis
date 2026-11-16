"""Shared, JSON-backed digit mapping and validation for both conversion algorithms."""

import json
import unicodedata
from pathlib import Path


DIGIT_MAP_PATH = Path(__file__).resolve().with_name("digit_map.json")
MAX_NUMBER_LENGTH = 512
MAX_PRECISION = 100


def _load_digit_map():
    """Load a zero-based mapping: decimal digit value (as a string) -> symbol."""
    try:
        with DIGIT_MAP_PATH.open("r", encoding="utf-8") as file:
            raw_mapping = json.load(file)
    except FileNotFoundError as error:
        raise RuntimeError(
            f"Digit mapping file was not found: {DIGIT_MAP_PATH}"
        ) from error
    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"Digit mapping file contains invalid JSON: {DIGIT_MAP_PATH}"
        ) from error

    if not isinstance(raw_mapping, dict) or not raw_mapping:
        raise RuntimeError("The digit mapping JSON must be a non-empty object.")

    parsed_mapping = {}
    for raw_value, symbol in raw_mapping.items():
        if not isinstance(raw_value, str) or not raw_value.isdecimal():
            raise RuntimeError("Every digit mapping key must be a non-negative integer string.")

        value = int(raw_value)
        if str(value) != raw_value:
            raise RuntimeError("Digit mapping keys must use standard decimal notation (for example, '0', '1', '2').")

        if not isinstance(symbol, str) or len(symbol) != 1:
            raise RuntimeError("Every digit mapping value must be exactly one Unicode character.")

        if symbol.isspace() or symbol in {"+", "-", "."}:
            raise RuntimeError(
                "Digit symbols cannot be whitespace, '+', '-', or '.', because those are reserved by the number format."
            )

        if value in parsed_mapping:
            raise RuntimeError(f"Duplicate digit value in mapping: {value}.")
        parsed_mapping[value] = symbol

    expected_values = list(range(len(parsed_mapping)))
    if sorted(parsed_mapping) != expected_values:
        raise RuntimeError(
            "Digit mapping keys must be continuous and start at 0 (0, 1, 2, ...)."
        )

    symbols = list(parsed_mapping.values())
    if len(set(symbols)) != len(symbols):
        raise RuntimeError("Every digit symbol in the JSON mapping must be unique.")

    return {value: parsed_mapping[value] for value in expected_values}


VALUE_TO_DIGIT = _load_digit_map()
DIGITS = "".join(VALUE_TO_DIGIT.values())
DIGIT_TO_VALUE = {symbol: value for value, symbol in VALUE_TO_DIGIT.items()}
MAX_BASE = len(DIGITS)


MAX_SUPPORTED_BASE = 1024


def resolve_digits(extra_digits=""):
    if not isinstance(extra_digits, str):
        raise ValueError("Extra digits must be a string.")
    if len(DIGITS) + len(extra_digits) > MAX_SUPPORTED_BASE:
        raise ValueError(f"At most {MAX_SUPPORTED_BASE - len(DIGITS)} extra digits are allowed.")
    alphabet = DIGITS + extra_digits
    if len(set(alphabet)) != len(alphabet):
        raise ValueError("Digit symbols must be unique, including the default digits.")
    if any(ch.isspace() or ch in "+-." or unicodedata.category(ch).startswith("C") for ch in extra_digits):
        raise ValueError("Extra digits cannot contain whitespace, control characters, '+', '-' or '.'.")
    return alphabet


def validate_base(base, digits=DIGITS):
    if type(base) is not int or not 2 <= base <= len(digits):
        raise ValueError(f"Base must be an integer between 2 and {len(digits)}; define extra digits for higher bases.")


def validate_precision(precision):
    if type(precision) is not int or not 0 <= precision <= MAX_PRECISION:
        raise ValueError(f"Precision must be an integer between 0 and {MAX_PRECISION}.")


def normalize_number(number, source_base, digits=DIGITS):
    validate_base(source_base, digits)
    digit_to_value = {symbol: value for value, symbol in enumerate(digits)}
    if not isinstance(number, str):
        raise ValueError("Number must be a string.")
    if len(number) > MAX_NUMBER_LENGTH:
        raise ValueError(f"Number must contain at most {MAX_NUMBER_LENGTH} characters.")

    number = number.strip()

    # Preserve the previous case-insensitive behavior for bases up to 36.
    # From base 37 onward, uppercase and lowercase letters are distinct digits.
    if source_base <= 36:
        number = number.upper()

    unsigned = number[1:] if number.startswith(("-", "+")) else number
    if not unsigned or unsigned == "." or unsigned.count(".") > 1:
        raise ValueError("Enter a valid number with at most one decimal point.")

    for digit in unsigned:
        if digit == ".":
            continue
        digit_value = digit_to_value.get(digit)
        if digit_value is None or digit_value >= source_base:
            raise ValueError(f"Digit '{digit}' is not valid in base {source_base}.")

    return number

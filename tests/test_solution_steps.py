import pytest
from fastapi.testclient import TestClient

from Alireza_mabna10 import convert_base
from Meysam_horner import convert
from backend.main import app

client = TestClient(app)


def expressions(steps, title):
    return [step["expression"] for step in steps if step["title"] == title]


def test_standard_divisions_are_the_actual_input_sequence():
    steps = []
    assert convert_base("45", 10, 2, steps=steps) == "101101"
    assert expressions(steps, "تقسیم صحیح متوالی") == [
        "45 = 2 × 22 + 1", "22 = 2 × 11 + 0", "11 = 2 × 5 + 1",
        "5 = 2 × 2 + 1", "2 = 2 × 1 + 0", "1 = 2 × 0 + 1",
    ]
    assert expressions(steps, "چیدن رقم‌های صحیح") == ["(101101)_2"]


def test_standard_fractional_place_values_and_digit_extraction():
    steps = []
    assert convert_base("A.A", 16, 2, steps=steps) == "1010.101"
    assert expressions(steps, "ارزش مکانی رقم اعشار") == [
        "10 / 16^1 = 5/8; 10 + 5/8 = 85/8",
    ]
    assert expressions(steps, "استخراج رقم اعشار") == [
        "5/8 × 2 = 5/4; digit = 1; remainder = 1/4",
        "1/4 × 2 = 1/2; digit = 0; remainder = 1/2",
        "1/2 × 2 = 1; digit = 1; remainder = 0",
    ]


def test_horner_records_each_input_digit_in_the_target_base():
    steps = []
    assert convert("45", 10, 2, steps=steps) == "101101"
    assert expressions(steps, "ضرب و جمع هورنر") == [
        "(0)_2 × (1010)_2 + (100)_2 = (100)_2",
        "(100)_2 × (1010)_2 + (101)_2 = (101101)_2",
    ]
    assert not expressions(steps, "تقسیم صحیح متوالی")


def test_reverse_horner_reads_fractional_digits_right_to_left():
    steps = []
    assert convert("0.12", 3, 10, precision=4, steps=steps) == "0.5555"
    assert expressions(steps, "گام هورنر معکوس") == [
        "(0 + 2) / 3 = 2/3", "(2/3 + 1) / 3 = 5/9",
    ]
    assert "صفر نیست" in next(step["description"] for step in steps if step["title"] == "پایان بخش اعشاری")


@pytest.mark.parametrize("method", ["standard", "horner"])
@pytest.mark.parametrize("number,source,target,precision", [
    ("-a.f", 16, 2, 20), ("0", 10, 2, 20), ("-0", 10, 2, 20),
    (".5", 10, 2, 0), ("0.1", 10, 2, 3), ("1.25", 10, 10, 20),
])
def test_api_exposes_ordered_steps_and_the_same_final_result(method, number, source, target, precision):
    response = client.post("/api/convert", json={
        "number": number, "sourceBase": source, "targetBase": target,
        "precision": precision, "method": method,
    })
    assert response.status_code == 200
    body = response.json()
    steps = body["steps"]
    assert steps
    assert all(set(step) == {"title", "description", "expression"} for step in steps)
    assert steps[-1]["title"] == "نتیجهٔ نهایی"
    assert steps[-1]["expression"] == f"({number.upper()})_{source} → ({body['result']})_{target}"
    algorithm = convert_base if method == "standard" else convert
    assert body["result"] == algorithm(number, source, target, precision)

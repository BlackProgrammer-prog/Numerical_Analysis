from fractions import Fraction
from concurrent.futures import ThreadPoolExecutor

import pytest
from fastapi.testclient import TestClient

from Alireza_mabna10 import convert_base, convert_from_decimal, convert_to_decimal
from Meysam_horner import convert
from backend.main import app

client = TestClient(app)


@pytest.mark.parametrize("algorithm", [convert_base, convert])
@pytest.mark.parametrize("number,source,target,extra,expected", [
    ("!54", 70, 10, '!#%*&"}{', "304154"),
    ("63", 10, 64, "@#", "#"),
    ("-#.W", 64, 10, "@#", "-63.5"),
    ("1@", 63, 64, "@#", "1z"),
    ("62", 10, 63, "😀", "😀"),
    ("😀", 63, 10, "😀", "62"),
    ("0.984375", 10, 64, "@#", "0.#"),
])
def test_custom_conversions(algorithm, number, source, target, extra, expected):
    steps = []
    assert algorithm(number, source, target, steps=steps, extra_digits=extra) == expected
    assert expected in steps[-1]["expression"]


@pytest.mark.parametrize("method", ["standard", "horner"])
def test_custom_api(method):
    payload = dict(number="-63.5", sourceBase=10, targetBase=64,
                   extraDigits="@#", method=method)
    response = client.post("/api/convert", json=payload)
    assert response.status_code == 200
    assert response.json()["result"] == "-#.W"
    assert response.json()["extraDigits"] == "@#"
    assert response.json()["truncated"] is False
    assert response.json()["benchmark"]["iterations"] == 30


@pytest.mark.parametrize("extra", ["", "@", "@@", "a#", "@ ", "@.", "@+", "@-", "@\n", "@\u200d"])
def test_invalid_custom_alphabets(extra):
    response = client.post("/api/convert", json=dict(
        number="1", sourceBase=10, targetBase=64, extraDigits=extra))
    assert response.status_code == 422


def test_random_round_trips_and_precision():
    for base in (63, 64, 66):
        for numerator in (-12345, 0, 62, 99999):
            value = Fraction(numerator, base ** 2)
            number = convert_from_decimal(value, base, 2, extra_digits="@#$%")
            assert convert_to_decimal(number, base, extra_digits="@#$%") == value
            assert convert(number, base, 10, extra_digits="@#$%") == convert_base(number, base, 10, extra_digits="@#$%")


def test_request_alphabets_are_isolated():
    def run(symbol):
        return client.post("/api/convert", json=dict(
            number="62", sourceBase=10, targetBase=63, extraDigits=symbol)).json()["result"]
    with ThreadPoolExecutor() as executor:
        assert list(executor.map(run, ["@", "#", "😀"])) == ["@", "#", "😀"]
    assert client.post("/api/convert", json=dict(number="@", sourceBase=62, targetBase=10)).status_code == 400


def test_maximum_custom_base_and_invalid_digit_value():
    extra = "".join(chr(0x4E00 + i) for i in range(962))
    for method in ("standard", "horner"):
        response = client.post("/api/convert", json=dict(
            number="1023", sourceBase=10, targetBase=1024, extraDigits=extra, method=method))
        assert response.status_code == 200
        assert response.json()["result"] == extra[-1]
    assert client.post("/api/convert", json=dict(
        number="#", sourceBase=63, targetBase=10, extraDigits="@#")).status_code == 400
    assert client.post("/api/convert", json=dict(
        number="1", sourceBase=10, targetBase=1025, extraDigits=extra + "@$")).status_code == 422

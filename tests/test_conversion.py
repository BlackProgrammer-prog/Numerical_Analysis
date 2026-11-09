from fractions import Fraction
import random

import pytest
from fastapi.testclient import TestClient

from Alireza_mabna10 import convert_base, convert_from_decimal, convert_to_decimal
from Meysam_horner import convert
from backend.main import app

client = TestClient(app)


@pytest.mark.parametrize("algorithm", [convert_base, convert])
@pytest.mark.parametrize("number,source,target,expected", [
    ("45", 10, 2, "101101"), ("-a.f", 16, 2, "-1010.1111"),
    (".5", 10, 2, "0.1"), ("+10.", 10, 16, "A"),
    ("-0.0", 10, 2, "0"), ("Z", 36, 10, "35"),
    ("9007199254740993", 10, 16, "20000000000001"),
    ("a", 37, 10, "36"), ("A", 62, 10, "10"),
    ("z", 62, 10, "61"), ("61", 10, 62, "z"),
    ("-z.V", 62, 10, "-61.5"), ("61.5", 10, 62, "z.V"),
    ("z", 36, 10, "35"),
])
def test_known_conversions(algorithm, number, source, target, expected):
    assert algorithm(number, source, target) == expected


@pytest.mark.parametrize("algorithm", [convert_base, convert])
@pytest.mark.parametrize("number,source,target,precision", [
    ("", 10, 2, 20), (".", 10, 2, 20), ("+", 10, 2, 20),
    ("1.2.3", 10, 2, 20), ("2", 2, 10, 20), ("1 0", 10, 2, 20), ("b", 37, 10, 20),
    ("1", 1, 10, 20), ("1", 10, 63, 20), ("1", True, 10, 20),
    ("1", 10, 2, -1), ("1", 10, 2, 101), ("1" * 513, 10, 2, 20),
])
def test_invalid_input(algorithm, number, source, target, precision):
    with pytest.raises(ValueError):
        algorithm(number, source, target, precision)


def test_algorithms_agree_and_truncate_toward_zero():
    rng = random.Random(42)
    for _ in range(200):
        source, target = rng.randint(2, 62), rng.randint(2, 62)
        precision = rng.randint(0, 25)
        original = Fraction(rng.randint(-1000000, 1000000), source ** 4)
        number = convert_from_decimal(original, source, 4)
        expected = convert_base(number, source, target, precision)
        assert convert(number, source, target, precision) == expected
        actual = convert_to_decimal(expected, target)
        assert abs(original - actual) < Fraction(1, target ** precision)
        assert abs(actual) <= abs(original)


@pytest.mark.parametrize("method", ["standard", "horner"])
def test_api(method):
    response = client.post("/api/convert", json={
        "number": "-A.F", "sourceBase": 16, "targetBase": 2, "method": method,
    })
    assert response.status_code == 200
    assert response.json()["result"] == "-1010.1111"
    assert response.json()["truncated"] is False


@pytest.mark.parametrize("number,precision,truncated,result", [
    ("0.1", 4, True, "0.0001"), ("0.5", 1, False, "0.1"),
    ("-0.5", 0, True, "-0"), ("2", 0, False, "10"),
])
def test_api_precision(number, precision, truncated, result):
    response = client.post("/api/convert", json={
        "number": number, "sourceBase": 10, "targetBase": 2, "precision": precision,
    })
    assert response.status_code == 200
    assert response.json()["truncated"] is truncated
    assert response.json()["result"] == result


@pytest.mark.parametrize("overrides,status", [
    ({"number": "2", "sourceBase": 2}, 400), ({"number": "."}, 400),
    ({"sourceBase": 63}, 422), ({"sourceBase": True}, 422),
    ({"targetBase": 2.5}, 422), ({"number": 10}, 422),
    ({"method": "unknown"}, 422), ({"precision": -1}, 422),
    ({"number": "1" * 513}, 422), ({"extra": 1}, 422),
])
def test_api_validation(overrides, status):
    payload = {"number": "10", "sourceBase": 10, "targetBase": 2, **overrides}
    assert client.post("/api/convert", json=payload).status_code == status


def test_maximum_input_and_output_size():
    for method in ("standard", "horner"):
        response = client.post("/api/convert", json={
            "number": "Z" * 512, "sourceBase": 36, "targetBase": 2, "method": method,
        })
        assert response.status_code == 200
        assert int(response.json()["result"], 2) == int("Z" * 512, 36)


def test_docs_health_and_cors():
    assert client.get("/api/health").json() == {"status": "ok"}
    assert client.get("/docs").status_code == 200
    assert "/api/convert" in client.get("/openapi.json").json()["paths"]
    response = client.options("/api/convert", headers={
        "Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"

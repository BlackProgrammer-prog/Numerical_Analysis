import os
from statistics import median
from time import perf_counter_ns
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from Alireza_mabna10 import convert_base, convert_to_decimal
from Meysam_horner import convert
from conversion_validation import MAX_BASE, MAX_NUMBER_LENGTH, MAX_PRECISION


class ConversionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", json_schema_extra={
        "examples": [{"number": "-A.F", "sourceBase": 16,
                      "targetBase": 2, "method": "horner", "precision": 20}]
    })

    number: str = Field(min_length=1, max_length=MAX_NUMBER_LENGTH,
                        description="Signed number using 0-9, A-Z, a-z and an optional decimal point; case-sensitive above base 36.")
    sourceBase: int = Field(ge=2, le=MAX_BASE, strict=True)
    targetBase: int = Field(ge=2, le=MAX_BASE, strict=True)
    method: Literal["standard", "horner"] = "standard"
    precision: int = Field(default=20, ge=0, le=MAX_PRECISION, strict=True,
                           description="Maximum fractional output digits; truncates toward zero.")


class SolutionStep(BaseModel):
    title: str
    description: str
    expression: str


class MethodTiming(BaseModel):
    method: Literal["standard", "horner"]
    medianMicroseconds: float


class ConversionBenchmark(BaseModel):
    standard: MethodTiming
    horner: MethodTiming
    iterations: int
    fasterMethod: Literal["standard", "horner", "equal"]
    speedup: float


class ConversionResponse(ConversionRequest):
    result: str
    truncated: bool = Field(description="True when the precision limit discarded a nonzero remainder.")
    steps: list[SolutionStep] = Field(description="Ordered calculation steps for the selected method; numeric values are strings to preserve exactness.")
    benchmark: ConversionBenchmark


class ConversionError(BaseModel):
    detail: str


app = FastAPI(
    title="Number Base Converter API",
    description=f"Convert signed integers and fractions between bases 2–{MAX_BASE} using standard or Horner conversion.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080,http://127.0.0.1:8080"
    ).split(",") if origin.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/convert", response_model=ConversionResponse, tags=["Conversion"],
          responses={400: {"model": ConversionError, "description": "Invalid number or digit for the source base"}})
def convert_number(payload: ConversionRequest) -> ConversionResponse:
    algorithm = convert_base if payload.method == "standard" else convert
    steps = []
    try:
        result = algorithm(payload.number, payload.sourceBase, payload.targetBase, payload.precision, steps=steps)
        # A reduced fraction terminates within p digits iff its denominator divides base**p.
        exact_value = convert_to_decimal(payload.number, payload.sourceBase)
        truncated = pow(payload.targetBase, payload.precision) % exact_value.denominator != 0
        benchmark = benchmark_conversion(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return ConversionResponse(
        **payload.model_dump(), result=result, truncated=truncated,
        steps=steps, benchmark=benchmark,
    )


def benchmark_conversion(payload: ConversionRequest) -> ConversionBenchmark:
    algorithms = {"standard": convert_base, "horner": convert}
    timings: dict[str, float] = {}
    iterations = 30

    for name, algorithm in algorithms.items():
        algorithm(payload.number, payload.sourceBase, payload.targetBase, payload.precision)
        samples = []
        for _ in range(iterations):
            started = perf_counter_ns()
            algorithm(payload.number, payload.sourceBase, payload.targetBase, payload.precision)
            samples.append(perf_counter_ns() - started)
        timings[name] = median(samples) / 1_000

    standard_time = timings["standard"]
    horner_time = timings["horner"]
    if abs(standard_time - horner_time) <= min(standard_time, horner_time) * 0.01:
        faster_method = "equal"
    else:
        faster_method = "standard" if standard_time < horner_time else "horner"
    speedup = max(standard_time, horner_time) / max(min(standard_time, horner_time), 1e-9)

    return ConversionBenchmark(
        standard=MethodTiming(method="standard", medianMicroseconds=standard_time),
        horner=MethodTiming(method="horner", medianMicroseconds=horner_time),
        iterations=iterations,
        fasterMethod=faster_method,
        speedup=speedup,
    )

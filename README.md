# Base Converter (Numerical Analysis Project)

A simple number base conversion calculator that converts numbers between different bases, from **base 2 to base 36**.

This project is developed as part of a university **Mathematical Analysis** course and provides two methods for number base conversion.

## Features

- Convert numbers between bases **2 and 36**.
- Support for positive and negative numbers.
- Support for integer and fractional numbers.
- Support for digits `0-9` and letters `A-Z`.
- Two conversion methods:
  - **Standard Method:** Converts the input number to base 10 first, then converts it to the target base.
  - **Horner's Method:** Converts numbers directly between bases using Horner's method.
- Input validation for bases and digits.
- A web interface for entering numbers and selecting source and target bases.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI

## Installation & Usage

### Frontend

Install the dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Backend

Requires Python 3.10 or newer. Run these commands from the repository root
(PowerShell on Windows):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

On macOS/Linux, use `.venv/bin/python` instead of `.\.venv\Scripts\python.exe`.
Keep the backend running and start the frontend in a second terminal.

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI schema: http://localhost:8000/openapi.json
- Health check: `GET /api/health`
- Conversion: `POST /api/convert`

Example JSON request (also available in Swagger's **Try it out**):

```json
{
  "number": "-A.F",
  "sourceBase": 16,
  "targetBase": 2,
  "method": "horner",
  "precision": 20
}
```

Response (the `steps` array is omitted here for brevity):

```json
{
  "number": "-A.F",
  "sourceBase": 16,
  "targetBase": 2,
  "method": "horner",
  "precision": 20,
  "result": "-1010.1111",
  "truncated": false
}
```

`method` accepts `standard` (default) and `horner`. The standard algorithm in
`Alireza_mabna10.py` evaluates positional powers using exact rational arithmetic,
then converts to the target base. `Meysam_horner.py` uses Horner's recurrence
directly on target-base digits for integers, and reverse Horner evaluation with
exact fractions for the fractional part. Both files remain usable from the CLI
and can be imported without prompting for input.

`precision` is the maximum fractional output length (0–100, default 20).
Nonterminating or longer fractions are truncated toward zero, without rounding;
`truncated` reports whether a nonzero remainder was discarded. Input is limited
to 512 characters, accepts leading `+`/`-`, lowercase or uppercase A–Z, and a
single `.`. Invalid digits return HTTP 400 with `detail`; invalid request fields,
bases or precision return HTTP 422. Numbers must be JSON strings to preserve
large integers exactly.

Every successful response also contains an ordered `steps` array. Each step has
`title` and `description` in Persian, and an `expression` string for the exact
arithmetic. The frontend displays these in the **روش حل** accordion after a
conversion and clears them whenever the number, bases or method changes.

Steps are recorded inside the actual algorithms: positional terms and repeated
quotient/remainder divisions for the standard method; per-digit multiplication
and addition in the target base for Horner. Fractional steps show reverse Horner
evaluation where applicable, repeated multiplication, extracted digits and the
remaining exact fraction. The last step includes the signed result; precision
limits are explained when a nonzero fractional remainder is discarded.

Expressions with `(value)_base` explicitly label target-base digits. Other
intermediate integers and rational fractions are written in base ten. Numeric
expressions use strings to preserve exactness for large integers and fractions.
The CLI functions still return a string; Python callers can optionally pass a
list using `steps=my_steps` to collect the same explanations.

The frontend defaults to `http://localhost:8000`. To change it, copy
`frontend/.env.example` to `frontend/.env`, edit `VITE_API_URL` and restart Vite.
An empty `VITE_API_URL` uses the frontend's origin and requires a reverse proxy
that forwards `/api` to FastAPI.

CORS allows localhost and 127.0.0.1 on ports 5173, 3000 and 8080 by default.
For another frontend origin, set a comma-separated list before starting FastAPI:

```powershell
$env:CORS_ORIGINS = "http://localhost:5174,https://your-frontend.example"
```

### Tests

From the repository root:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
```

Frontend checks (inside `frontend`): `npx tsc --noEmit`, `npm test`, `npm run build`.

## Notes

- Bases must be between **2 and 36**.
- Fractional results may be limited to a fixed number of digits when the representation does not terminate in the target base.
- The frontend and backend must both be running for full application functionality.

## License

This project was developed for educational purposes as part of a university course.

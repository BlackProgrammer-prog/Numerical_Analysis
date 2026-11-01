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
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Backend

## Notes

- Bases must be between **2 and 36**.
- Fractional results may be limited to a fixed number of digits when the representation does not terminate in the target base.
- The frontend and backend must both be running for full application functionality.

## License

This project was developed for educational purposes as part of a university course.

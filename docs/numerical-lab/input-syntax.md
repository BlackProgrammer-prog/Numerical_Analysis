# Polynomial Input Syntax

The safe parser accepts decimal coefficients, `+` and `-` signs, variables, and non-negative integer powers written with `^`. Superscript 2 and 3 are also supported.

Examples:

- `x^3+2x-5`
- `P(x)=x³-2x+1`
- `y^3+5y+1`
- `y^3+xy+1` in the bivariate module

Missing powers receive zero coefficients automatically. Function calls, parentheses in arithmetic expressions, and executable JavaScript are rejected. The implementation never uses `eval`.

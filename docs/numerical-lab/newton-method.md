# Newton-Raphson Method

The solver differentiates coefficient arrays analytically and applies:

`x_next = x_current - f(x_current) / f'(x_current)`

Every iteration records the current guess, function value, derivative, next guess, absolute change, and next residual. Successful termination requires both the guess difference and function residual to satisfy the tolerance.

The solver reports near-zero derivatives, non-finite values, and exhaustion of the configured iteration limit. The bivariate version fixes `x`, reduces `F(x,y)` to a polynomial in `y`, and then uses the same guarded solver.

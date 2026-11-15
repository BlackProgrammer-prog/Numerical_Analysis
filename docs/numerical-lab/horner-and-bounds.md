# Horner Division and Root Bounds

Horner division displays the original coefficients, intermediate products, and final sums as three rows. The last sum is both the remainder and the evaluated polynomial value.

For a positive trial value and positive leading coefficient, an entirely non-negative final row confirms an upper bound for positive roots. A row containing a negative value means only that this test did not confirm the candidate; it is not a mathematical proof that the candidate is invalid.

For the lower bound, the laboratory constructs `q(x)=(-1)^n P(-x)`, finds a positive-root upper bound for `q`, and negates that value. For `x^3+2x-5`, the displayed interval is `[-1, 2]`.

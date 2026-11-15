# Numerical Laboratory Architecture

The numerical laboratory runs independently from the base-conversion API. Its calculation layer lives in `frontend/src/lib/numerical` and contains pure functions with no UI or network dependencies.

The parser converts expressions into coefficient arrays. Horner division, root bounds, Newton iteration, and bivariate reduction consume those arrays. React components only collect input, format numbers, and reveal the returned learning steps.

This separation keeps full JavaScript `Number` precision inside the algorithms and limits rounding to the presentation layer.

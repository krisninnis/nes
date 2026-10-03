# Evidence Authority and Test Truth

## Status

Supported lesson from NinFit engineering work. Not a universal theorem.

## Core lesson

A failing test is useful evidence only when the failure is causally connected to the missing or incorrect production capability being investigated.

A RED result can look legitimate while proving almost nothing if the test manufactures its own failure. Conversely, a GREEN result can be misleading when the test oracle is defective or vacuous.

## Observed failure modes

NinFit work exposed several distinct test-authority problems:

- **Artificial RED**: a test-local unconditional failure made every test fail regardless of production state.
- **Misclassified absence characterization**: a test demonstrated that a capability was absent but was described as if it were a behavioural RED authority.
- **Vacuous oracle**: a case-sensitivity check transformed an already-lowercase value to lowercase, producing the same value and invalidating the intended comparison.
- **Surface versus behaviour confusion**: proving that a type or method exists does not prove that its behaviour is correct.

## NES practice

Before freezing a RED gate, ask:

```text
What exact production fact causes this test to fail?
            |
            +-- missing/incorrect real capability --> candidate causal RED
            |
            +-- test-local fail/stub/trick --------> reject as authority
```

Where practical:

1. Couple the test to the actual production surface.
2. Run it independently more than once when determinism matters.
3. Inspect the real test result, not only the build exit code.
4. State exactly what the RED proves and what remains untested.
5. Freeze the test identity when later GREEN causality depends on the test remaining unchanged.
6. When a test oracle is found defective, preserve the historical record and create an explicit corrective gate rather than rewriting history.

## Important distinction

```text
surface test:    "does this capability exist?"
behaviour test:  "does this capability do the required thing?"
field evidence:  "does the integrated system behave correctly in reality?"
```

These are different strengths of evidence. Passing one must not be silently promoted into proof of another.

## Limits

A causal unit test still does not establish physical-device behaviour, production integration, performance, durability, or correctness outside its tested boundary.

## Reconsideration condition

Revise this lesson if future evidence shows a safer testing approach that provides the same causal authority without the staged surface/behaviour separation, or if a project context makes that separation actively misleading.

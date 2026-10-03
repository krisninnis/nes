# Pattern: Gated Causal Development

## Intent

Reduce uncertainty by making the smallest useful requirement executable, proving its current state, implementing only that requirement, and preserving the causal link between RED and GREEN.

## Pattern

```text
investigate uncertainty
        |
        v
state narrow requirement
        |
        v
freeze causal test authority
        |
       RED
        |
        v
minimal production change
        |
      GREEN
        |
        v
record evidence + residual uncertainty
        |
        v
next smallest gate
```

## Rules learned in practice

- Establish repository/worktree identity before changing state.
- Preserve unrelated dirty work.
- A RED must fail because of the real production boundary under investigation.
- Freeze the authority needed to demonstrate later RED-to-GREEN causality.
- Implement only what the frozen authority requires unless a broader change is separately justified.
- Do not treat a surface GREEN as behavioural proof.
- Keep predecessor authorities visible so a local advance does not silently regress an earlier boundary.
- Record negative capability: what the new implementation still deliberately does **not** do.
- Preserve failed approaches and corrected test authorities instead of rewriting the historical narrative.

## Why negative capability matters

A minimal implementation is easier to reason about when the evidence record says both:

```text
what changed
```

and:

```text
what definitely did not change
```

This limits accidental architectural claims. For example, creating a recovery-authorization type does not prove recovery is authorized, wired, durable, or safe.

## When to use

Use this pattern when:

- the defect is poorly understood;
- a safety or durability boundary matters;
- multiple layers can independently produce similar symptoms;
- regression cost is high;
- a future engineer will need to understand why a capability exists.

## When not to overuse it

Not every trivial edit requires a long sequence of surface gates. The unit of gating should be the **smallest useful hypothesis**, not the smallest syntactic token. If the staged process stops reducing meaningful uncertainty, regroup and investigate the architecture rather than generating ceremonial RED/GREEN steps.

## Reconsideration condition

Change the granularity when evidence shows that gates are proving only syntax while failing to reduce engineering uncertainty, or when a broader behavioural test can establish the required causal boundary more directly and safely.

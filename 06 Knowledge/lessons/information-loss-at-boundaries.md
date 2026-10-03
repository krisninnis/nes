# Information Loss at Boundaries

## Status

Supported lesson extracted from NinFit renderer-loss recovery investigation.

## Core lesson

Do not collapse materially different evidence states before the last component that needs to distinguish them.

The important example was Journey identity acquisition. A nullable identity appeared simple:

```text
ID     -> identity present
null   -> no identity
```

Investigation showed that `null` could represent different realities, particularly on the renderer side:

```text
missing data -----------\
corrupt/unsupported -----+--> null
other unusable state ---/
```

Once those states collapse to the same value, a downstream component cannot safely tell **authoritative absence** from **failure to establish the truth**.

## Safer evidence model

The investigation identified a minimum three-state vocabulary:

- `PRESENT` - acquisition succeeded and produced an exact identity.
- `ABSENT` - acquisition succeeded and authoritatively established no identity.
- `UNAVAILABLE` - acquisition did not establish trustworthy present/absent truth.

The key fail-closed invariant is:

> UNAVAILABLE must not silently become ABSENT when that distinction can affect a consequential decision.

## General pattern

```text
rich observation
      |
      v
lossy transformation
      |
      v
ambiguous value
      |
      v
downstream decision lacks information
```

Before accepting a lossy transformation, ask:

- Which distinctions are being discarded?
- Could any later safety, recovery, authorization, or correctness decision need them?
- Can failure/unavailability be represented separately from a valid negative result?

## Responsibility boundary

NinFit also demonstrated that **acquisition** and **comparison** are different responsibilities.

A comparison component can correctly compare two supplied identities while still being unsafe if an upstream caller has already converted acquisition failure into `null`.

Therefore evidence availability should normally be established before identity comparison rather than hidden inside the comparison result.

## Limits

Three states are not automatically sufficient for every domain. The correct vocabulary depends on the distinctions that later decisions genuinely require. Adding states without evidence can create unnecessary complexity just as collapsing states can destroy needed information.

## Reconsideration condition

Revise the model if a future acquisition contract proves that some currently distinct states are observationally equivalent for every downstream decision, or if new downstream requirements demonstrate that `UNAVAILABLE` itself must be separated into additional authoritative categories.

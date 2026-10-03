# ADR-001: Separate Acquisition, Comparison, and Authorization

## Status

Accepted as the current design direction from NinFit investigation. Behavioural integration is not yet complete and this decision remains revisable by evidence.

## Context

Renderer-loss recovery needs to determine whether a newly available renderer may safely reconnect to a native Journey that survived lifecycle disruption.

Investigation showed that three questions had been at risk of being conflated:

1. **Acquisition** - did we successfully establish each side's Journey identity truth?
2. **Comparison** - given trustworthy identity observations, do the identities match, conflict, or show absence?
3. **Authorization** - given the comparison and required evidence, may recovery proceed to downstream policy?

A nullable identity alone could not safely represent acquisition truth because renderer-side null could include unusable or corrupt state as well as authoritative absence.

## Decision

Keep these responsibilities distinct.

```text
native acquisition -----\
                         -> observation availability -> identity comparison
renderer acquisition ---/                              |
                                                        v
                                                authorization candidate
                                                        |
                                                        v
                                                downstream fuse/policy
                                                        |
                                                        v
                                                     recovery
```

The identity comparison component should compare supplied identities rather than acquire them.

Evidence availability should be established upstream. The minimum current vocabulary is `PRESENT`, `ABSENT`, and `UNAVAILABLE`.

Authorization must fail closed with respect to unavailable/unknown evidence: unavailable evidence must not be silently interpreted as authoritative absence and must not by itself authorize recovery.

Downstream fuse/process-owner policy remains separate from identity authorization unless future evidence demonstrates that the separation is wrong.

## Alternatives considered

### Extend the comparison result with query-failure categories

Rejected for now because it mixes acquisition failure with comparison responsibility and changes an established exact comparison vocabulary.

### Treat null as absence everywhere

Rejected because the renderer path does not currently preserve enough provenance for null to mean authoritative absence.

### Add a default or throwing authorization method merely to satisfy an API surface test

Rejected because either choice introduces production behaviour that had not been justified by evidence.

### Put all state into one recovery decision object immediately

Rejected for now because it would commit several unresolved semantics at once and weaken causal verification.

## Consequences

Positive:

- acquisition failure remains distinguishable from a valid negative observation;
- comparison logic can remain deterministic and narrow;
- authorization policy can be tested without hiding acquisition ambiguity;
- later field failures can be localized to a clearer responsibility boundary.

Costs:

- additional types and adapters are required;
- recovery implementation proceeds in more stages;
- integration tests remain necessary because locally correct boundaries can still be wired incorrectly.

## What this decision does not prove

It does not prove that renderer recovery works, that the three-state vocabulary is sufficient for every future case, or that the current fuse policy is correct.

## Reconsideration conditions

Revisit this ADR if:

- acquisition contracts become strong enough that absence and unavailability are provably equivalent for all downstream decisions;
- new recovery requirements require distinctions beyond PRESENT/ABSENT/UNAVAILABLE;
- integration evidence shows that the separated boundaries create ambiguity or unsafe gaps;
- a simpler architecture provides equal or stronger fail-closed guarantees with clearer evidence provenance.

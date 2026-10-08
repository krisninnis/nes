# Pattern: Evidence baton and baseline preservation

Status: Candidate reusable pattern supported by NinFit gate practice
Recorded: 2026-10-08

## Problem

Long investigations span multiple sessions, agents, branches, test suites and physical environments. A later worker can accidentally treat a handover summary as a verified test result, overwrite unrelated work, or silently promote a narrow GREEN into end-to-end proof.

## Practice

Before each consequential gate, record:

1. Exact repository, worktree, branch and expected HEAD; distinguish expected from observed identity.
2. Current dirty/untracked state and a strict mutation budget; never reset, clean, stash, restore or checkout unrelated work merely to establish a convenient baseline.
3. Predecessor report and DNA identifiers, source/test hashes where relevant, and the test authority that must remain unchanged.
4. One falsifiable objective and the **first-new-RED wins** stop condition.
5. Explicit allowed and forbidden changes, environment access, and external side effects.
6. What was actually run, what was not run, and the narrowest result classification.
7. The next unverified boundary and how to reproduce or resume it.

### Example baton

```text
BASELINE -> PREDECESSOR EVIDENCE -> ONE CAUSAL GATE
   |                 |                   |
identity         preserved         bounded change
   |                 |                   |
   +-----------------+-------------------+
                     |
            GREEN / RED / BLOCKED
                     |
             report + DNA + limits
                     |
              next gate inherits
```

## Lessons from NinFit

- A test may remain expected RED while adjacent contracts are GREEN; do not conceal or reclassify that RED.
- A compilation GREEN is not Android instrumentation GREEN, and neither is physical field proof.
- Infrastructure blockers such as a missing AVD are distinct from application defects.
- A stopped gate with zero mutations is valuable evidence of a respected safety boundary.
- Source counts, test counts and hashes are snapshots of particular gates, not eternal project constants.

## Limits

This is a documented practice, not proof that every NinFit handover was complete or that the NES dashboard automates it. Local `nes-evidence` reports are not all published in GitHub.

## Reconsideration

Simplify the baton when equivalent traceability and safety can be demonstrated with less overhead. Do not turn small gates into ceremonial paperwork that fails to reduce uncertainty.

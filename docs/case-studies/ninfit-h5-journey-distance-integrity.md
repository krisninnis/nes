# NinFit H5 — Journey Distance Integrity & Crash Consistency

Status: ACTIVE
Project: NinFit
Methodology: Ninnis Engineering System (NES)
Purpose: living case study and evidence index. Update at meaningful NES milestones, not after every command.

## Original field symptom

A real-device Journey session exposed unreliable behaviour around stopping/recovering a Journey and approximately 0.03 km of distance while stationary. H5 remained open rather than accepting a threshold-only fix.

## Investigation progression

The investigation established that GPS can wander while stationary and that displaced clusters can resemble real movement. Accuracy alone is insufficient to grant movement authority. NinFit therefore separated observed GPS displacement from authoritative Journey distance.

The architecture evolved into:

trusted GPS -> observed displacement -> provisional distance -> independent physical evidence -> corroboration -> COMMIT / EXCLUDE / DEFER -> durable authority -> Journey distance + exact receipt -> authority acknowledgement -> restart/replay preserving the same truth.

## Major engineering findings

- Raw trusted GPS does not directly own Journey distance.
- Provisional displacement remains unresolved until independent physical evidence applies.
- Physical evidence is identified durably and replay must be idempotent.
- EXCLUDE requires durable evidence of deliberate exclusion rather than merely marking evidence consumed.
- COMMIT requires a durable recovery baton until Journey records an exact interval receipt.
- Crash/restart ordering matters across Authority, consumed evidence, and Journey persistence.
- The target invariant is: every authoritative interval reaches Journey at least once, but affects Journey distance at most once.
- Successful normal COMMIT leaves the Journey receipt present and the Authority recovery baton absent.
- A production consumer can be correct while the product remains incomplete if no production source supplies the corroborating evidence it requires.

## Crash-consistency work

Injected failure windows were developed around:
1. COMMIT authority persistence before evidence consumption.
2. Authority COMMIT persisted before Journey snapshot.
3. Journey distance + receipt persisted before Authority acknowledgement.
4. EXCLUDE authority/tombstone persistence before evidence consumption.

The safe ordering established by the investigation is:

decision in memory -> persist Authority -> consume evidence -> for COMMIT persist Journey distance + exact receipt -> acknowledge Authority baton -> persist acknowledged Authority.

## Verification progression

The investigation used bounded NES gates, frozen file hashes, deterministic RED/GREEN regressions, fault injection, exact test targeting, and widening regression boundaries.

Notable milestones:
- Four focused crash contracts became green.
- A live COMMIT defect was exposed: normal uninterrupted COMMIT applied distance without durably completing the Journey receipt / Authority acknowledgement handshake.
- A bounded production repair added the exact Journey receipt and retired the exact Authority baton only after Journey persistence.
- Focused live/restart/crash regression reached 9/9 green.
- Original adjacent 10-file boundary reached 48/48 green after stale contracts were classified and repaired.
- Journey-wide discovery identified 108 Journey-named test files and 801 static test occurrences.
- A short Vitest filter executed a broader 110-file / 881-test boundary: 106 files passed, 4 failed; 873 tests passed, 6 failed, 2 skipped.
- Failures were classified rather than blindly patched.

## Missing production witness finding

Widening exposed a genuine-movement case where accepted trusted GPS points still produced 0 m. Read-only tracing showed the distance authority consumer existed but no demonstrated production sensor/activity producer supplied independent physical-motion evidence.

The physical evidence contract is intentionally small:
- kind: moving | stationary | unknown
- source: device_motion | step_detector | activity_recognition
- observedAt: independent observation time
- observationId: stable replay identity

The decision contract was proven:
- MOVING -> COMMIT
- STATIONARY -> EXCLUDE
- UNKNOWN -> DEFER

This decision is distance-only; it grants no Journey pause/resume or activity-time authority.

## Current H5 state

H5 remains OPEN.

Latest completed evidence gate: N178.324N45.
N45 proved the exact physical-evidence promotion mapping and the processor owning the durable transaction. No source, test, build, APK, or phone state changed during that read-only gate.

Next investigation area: determine the smallest trustworthy Android physical-motion producer/bridge capable of supporting walking, running and cycling without turning driving, phone handling, vibration, or GPS wander into exercise distance.

Do not weaken the GPS/authority policy merely to make distance non-zero.

## Remaining verification ladder

- Prove platform/native physical-witness capability.
- Define deterministic production-wiring RED contract.
- Implement the smallest justified physical witness bridge.
- Prove genuine movement and stationary invariants.
- Classify and resolve remaining Journey-wide failures individually.
- Run exact Journey boundary.
- Run full repository suite.
- TypeScript/build verification.
- Build and identify exact APK.
- Samsung Galaxy A14 field verification: stationary, walking, cycling, driving, long-duration and interruption/restart.
- Compare recorded truth with reference routes and competing fitness applications before making any market-leading accuracy claim.

## NES learning generated by H5

H5 is a primary NES case study because a seemingly small field symptom exposed state-machine, persistence, replay, crash-consistency, evidence-provenance and integration concerns.

Candidate reusable lessons include:
- Observe before changing.
- A passing command is not proof that the intended verification executed.
- A harness failure is not a product failure.
- Regression failures must be classified before production is changed.
- If architecture requires a second witness, production must actually bring that witness into the system.
- Persist the decision before consuming the evidence that produced it.
- Durable identity is essential for exactly-once effects across restart/replay.
- UNKNOWN is a valid engineering result and should fail closed.
- Widen verification progressively; do not confuse a nearby boundary with the exact requested boundary.

These are evidence-backed findings from this case study, not automatically universal NES principles. Promotion to a reusable or verified principle requires explicit review of applicability, limits and supporting evidence.

## Update protocol

This file is a living evidence summary. It should be updated at meaningful milestones rather than every shell command.

Update when one of these occurs:
- a gate changes status;
- a hypothesis is materially supported or disproved;
- a new defect/root cause is established;
- an invariant or architecture decision changes;
- a deterministic RED becomes GREEN;
- a regression boundary materially widens or closes;
- a build/APK/device candidate is promoted;
- a field test produces new evidence;
- H5 closes.

Each update should preserve: observation, evidence, conclusion, remaining uncertainty, next permitted action, and applicability/limits of any learning.

Routine retries, read-only commands that reveal nothing new, and formatting/harness noise should not create separate learning milestones.

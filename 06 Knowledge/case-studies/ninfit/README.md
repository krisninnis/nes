# NinFit Case Study

## Purpose

NinFit is the first large, sustained case study for the Ninnis Engineering System. It is useful not because every NinFit solution generalises, but because the project repeatedly exposed situations where observation, inference, test authority, durability, lifecycle behaviour, and physical reality diverged.

This case study records the durable engineering findings. Raw gate evidence remains a responsibility of the NinFit project and should not be replaced by this summary.

## Areas exercised

### GPS and motion evidence

NinFit exposed the danger of treating one sensor as complete truth. Genuine walking, GPS displacement, step-detector evidence, stationary detection, and resume authorization can disagree. The project therefore moved toward explicit evidence joining and fail-closed decisions rather than simply weakening thresholds when field behaviour was wrong.

### Physical verification

Host tests and source inspection could establish implementation properties, but physical-device runs revealed lifecycle and environmental conditions that those tests did not prove. Examples included Activity/WebView replacement, Android Location being disabled despite permission being granted, and real step-detector behaviour.

### Evidence retention across lifecycle changes

A field run became inconclusive because diagnostic evidence lived at the wrong lifecycle scope and disappeared when the Activity/WebView was replaced within the same process. Moving diagnostic retention to process scope allowed later physical verification of same-process continuity.

Reusable lesson: evidence instrumentation must survive the failure/lifecycle boundary it is intended to diagnose.

### Durable queue and replay

Large native GPS backlogs demonstrated that durability is not only about retaining raw observations. Replay, acknowledgement, processing rate, storage limits, and the durable commit boundary all interact.

A major observed failure mode involved replay mutating an in-memory Journey and rewriting a complete active-Journey snapshot to browser storage. At large history size, the snapshot could exceed storage quota. Processing then failed and acknowledgement was correctly withheld, leaving native evidence replayable. This distinguished **raw evidence durability** from **successful processed-state durability**.

### Finish latency and backlog scale

A Journey finish could appear frozen while thousands of pending native positions were drained. The visible symptom was therefore not sufficient to infer a deadlock. Backlog size and processing throughput had to be measured before classifying the failure.

### Test authority

NinFit produced several useful corrections:

- an artificial RED caused by a test-local unconditional failure was rejected;
- a supposed RED was later recognized as a GREEN characterization of absence;
- a case-sensitivity test contained a vacuous oracle and was repaired while preserving the historical record;
- surface existence and behavioural correctness were separated into different authorities.

See `../../lessons/evidence-authority-and-test-truth.md`.

### Renderer-loss recovery and identity continuity

The recovery investigation established a safety question:

```text
Android/native still owns a Journey
          |
renderer/WebView is lost or replaced
          |
new renderer appears
          |
should it reconnect to that Journey?
```

Recovery cannot safely be authorized merely because some Journey state exists. The work separated several responsibilities:

1. acquire native Journey identity truth;
2. acquire renderer Journey identity truth;
3. compare supplied identities;
4. decide whether recovery prerequisites are satisfied;
5. apply downstream safety/fuse policy;
6. execute recovery.

The identity comparison boundary currently distinguishes exact match, conflict, and identity absence combinations. Investigation then found that renderer-side `null` could represent both genuine absence and unusable/corrupt/unavailable state. This led to the explicit evidence-availability model described in `../../lessons/information-loss-at-boundaries.md`.

## Current renderer-recovery knowledge boundary, 3 October 2026

The latest locally reported NES gate sequence reached the following point:

```text
G3G31C  true recovery-authorization type RED
G3G31D  minimal authorization type GREEN
G3G31E  decision/API surface RED
G3G31F  AUTHORIZE / DEFER / REJECT vocabulary present;
         authorize(Resolution) still RED
G3G31G  architecture investigation
G3G31H  evidence-availability investigation
G3G31I  JourneyIdentityObservation type RED
G3G31J  minimal JourneyIdentityObservation type GREEN
G3G31K  Availability vocabulary RED FROZEN
```

G3G31K requires a nested availability vocabulary with exactly:

- `PRESENT`
- `ABSENT`
- `UNAVAILABLE`

At that boundary, the vocabulary was deliberately **not yet implemented**. Fields, identity storage, construction, accessors, invariants, acquisition mapping, conversion, authorization, and recovery wiring remained future work.

The next planned gate was G3G31L: implement only that frozen three-state vocabulary and prove the unchanged G3G31K authority GREEN.

### Proven versus not proven

At this point the project has **not** proved that renderer-loss recovery is fixed end-to-end. It has instead established a safer model for the evidence that a later recovery decision will consume.

That distinction is central to NES: architectural progress must not be reported as field-proven recovery until the integrated and physical evidence exists.

## General lessons extracted so far

- Do not tune thresholds merely because a field symptom is inconvenient; first determine which evidence path failed.
- Preserve raw evidence until downstream durable state is actually committed.
- Instrumentation must survive the lifecycle boundary under investigation.
- Permission granted does not imply the underlying provider/service is operational.
- Measure backlog and throughput before calling a long-running finish path a freeze or deadlock.
- Keep acquisition, comparison, authorization, policy, and execution responsibilities distinct when their failure semantics differ.
- Do not collapse `unavailable` into `absent` where the distinction affects a safety or recovery decision.
- A test result proves only the proposition its causal boundary actually exercises.

## Limits and provenance note

The NES GitHub repository and NinFit GitHub repository do not currently contain all of the local untracked `nes-evidence` records from the active NinFit worktree. The detailed G3G31 gate identities above therefore come from the active engineering handover rather than independently retrievable GitHub evidence. They should be linked to raw evidence once those records are deliberately published or otherwise made part of the durable project archive.

This file must not be treated as a substitute for those raw records.

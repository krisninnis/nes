# NES Roadmap 001
## Journey Flight Recorder & Analyzer

Version: 1.0
Status: Planning
Project: Ninnis Engineering System (NES)

---

# Vision

Build an engineering investigation framework that allows software to explain what happened rather than forcing engineers to guess.

Core Principle:

Observe before changing.
Collect evidence before concluding.
Understand the mechanism before fixing it.

---

# Phase 0 — Foundation

Goal:
Agree the engineering philosophy.

Principles

- Observe before changing behaviour.
- Facts before conclusions.
- Preserve behaviour during investigations.
- Privacy first.
- Every event tells part of the story.

Exit Criteria

- Engineering philosophy agreed.
- Investigation principles documented.

---

# Phase 1 — Architecture

Goal:
Design before implementation.

Tasks

- Create Journey Flight Recorder architecture.
- Define recorder responsibilities.
- Define analyzer responsibilities.
- Define component boundaries.
- Define privacy guarantees.
- Define event flow.

Exit Criteria

- Architecture document complete.

---

# Phase 2 — Event Schema

Goal:
Define exactly what information will be recorded.

Every event should answer:

- What happened?
- When?
- Which component?
- Current state?
- Context?
- Reason (if known)?

Initial Event Types

- Journey Started
- GPS Callback Received
- Replay Accepted
- Motion Session Processed
- Resume Evaluation
- Resume Trigger Fired
- Journey Auto Paused
- Journey Resumed
- Journey Ended

Exit Criteria

- Event schema frozen.

---

# Phase 3 — Flight Recorder

Goal:
Collect trustworthy evidence.

Tasks

- Event writer
- Event buffer
- Local JSON export
- Safe shutdown
- Recorder lifecycle

Rules

- Recorder must NEVER change Journey behaviour.
- Recorder only observes.

Exit Criteria

- Complete Journey can be recorded.

---

# Phase 4 — Instrumentation

Goal:
Observe every boundary.

Android

- GPS callback count
- Latest accuracy
- Latest speed
- Last callback time

Replay

- Locations received

Motion Session

- Locations processed

Resume Detector

- Evaluations
- Resume trigger count
- Last rejection reason

Journey

- Current state
- Distance
- Auto pause state

Exit Criteria

- Every hand-off observable.

---

# Phase 5 — Samsung Investigation

Goal:
Collect evidence.

Tasks

- Walk approximately 100 yards after Auto Pause.
- Export recorder file.
- Do NOT modify code.
- Answer:

Where did the baton stop?

Exit Criteria

- Root cause identified with evidence.

---

# Phase 6 — Root Cause Analysis

Goal:
Understand the mechanism.

Questions

- Android?
- Replay?
- Motion Session?
- Resume Detector?
- State Machine?
- Timing?
- Threshold?
- Bug?
- Rule?

Exit Criteria

- Root cause proven.

---

# Phase 7 — Smallest Justified Fix

Goal:
Fix ONLY the proven mechanism.

Rules

- No refactoring.
- No unrelated cleanup.
- No feature additions.

Exit Criteria

- Root cause removed.

---

# Phase 8 — Regression Testing

Goal:
Prove the fix.

Tests

- Samsung
- Pixel
- Emulator
- Walking
- Auto Pause
- Resume
- Edge cases

Exit Criteria

- Bug cannot regress.

---

# Phase 9 — NES Flight Analyzer

Goal:
Explain the evidence.

Analyzer Features

- Timeline
- Component Flow
- Boundary Analysis
- Trigger Analysis
- Suggested Investigation
- Event Filtering
- Search
- Replay Investigation

Input

journey-flight.json

Output

Human-readable investigation.

Rules

The analyzer never guesses.

It explains evidence.

---

# Phase 10 — Platform

Goal:
Generalise the investigation framework.

Future Recorders

- Journey Recorder
- Sleep Recorder
- Watch Sync Recorder
- Health Recorder
- AdminAvenger Recorder
- Safety Recorder

All share the same investigation framework.

---

# NES Core Principles

1. Observe before changing.

2. Facts before conclusions.

3. Preserve behaviour while investigating.

4. Build observability before fixing bugs.

5. Record facts at runtime.

6. Analyse facts afterwards.

7. Follow the baton.

8. Investigate hand-offs before components.

9. Never answer questions your evidence cannot answer.

10. Measure progress by uncertainty removed.

11. Build tools that make future investigations easier.

12. Every investigation should leave the project easier to investigate next time.

---

Mission Statement

The goal of NES is not merely to fix software.

The goal is to become engineers who solve problems through evidence, observation, careful reasoning and continuous learning.

Every investigation should improve both the software and the engineer.
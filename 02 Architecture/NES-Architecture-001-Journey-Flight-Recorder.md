# NES Architecture 001
# Journey Flight Recorder

Version: 1.0

Status: Draft

Project: Ninnis Engineering System (NES)

---

# Purpose

The Journey Flight Recorder exists to collect trustworthy engineering evidence during a Journey.

It does not diagnose problems.

It does not change Journey behaviour.

It only records facts.

Those facts are analysed later by the NES Flight Analyzer.

---

# Philosophy

The Flight Recorder follows the core NES principles.

• Observe before changing.

• Facts before conclusions.

• Preserve behaviour while investigating.

• Record evidence where it happens.

• Analyse evidence afterwards.

• Every investigation should leave the project easier to investigate.

---

# Mission

Transform Journey from a black box into a glass box.

Instead of asking:

"What happened?"

The software should be able to answer:

"This is exactly what happened."

---

# High Level Architecture

Android GPS

↓

Journey

↓

Flight Recorder

↓

JSON Evidence File

↓

NES Flight Analyzer

↓

Engineer

---

# Responsibilities

Journey

Responsible for:

• Walking
• Tracking
• Auto Pause
• Resume

Journey is NOT responsible for:

• Diagnostics
• Analysis
• JSON export

---

Flight Recorder

Responsible for:

• Recording events
• Recording timestamps
• Recording component state
• Recording decision reasons
• Recording evidence

Flight Recorder NEVER:

• Diagnoses bugs
• Changes behaviour
• Makes engineering decisions

---

JSON Evidence File

Responsible for:

• Storing facts

It should contain only factual information.

No assumptions.

No recommendations.

No guesses.

---

NES Flight Analyzer

Responsible for:

• Reading evidence
• Reconstructing events
• Building timelines
• Explaining information flow
• Highlighting missing hand-offs
• Assisting investigations

The Analyzer never changes the original evidence.

---

# Information Flow

Android

↓

GPS Callback

↓

Replay

↓

Motion Session

↓

Resume Detector

↓

Journey State

↓

User Interface

The Flight Recorder observes every boundary.

---

# Boundaries

Boundary 1

Android

↓

GPS Callback

Question:

Did Android hand over a new location?

---

Boundary 2

GPS Callback

↓

Replay

Question:

Did Replay receive the location?

---

Boundary 3

Replay

↓

Motion Session

Question:

Did Motion Session process it?

---

Boundary 4

Motion Session

↓

Resume Detector

Question:

Did Resume Detector evaluate it?

---

Boundary 5

Resume Detector

↓

Journey

Question:

Did Journey receive the Resume trigger?

---

Boundary 6

Journey

↓

User Interface

Question:

Did the user see the state change?

---

# Event Philosophy

Everything recorded is an Event.

Examples

Journey Started

GPS Callback Received

Replay Accepted

Motion Session Processed

Resume Evaluation

Resume Trigger Fired

Journey Auto Paused

Journey Resumed

Journey Ended

Events are facts.

Events are never opinions.

---

# Engineering Rules

Rule 1

Never record opinions.

Only record observations.

---

Rule 2

Never modify Journey behaviour.

The recorder is an observer.

---

Rule 3

Every event should answer:

What happened?

When?

Where?

Why (if known)?

---

Rule 4

Every hand-off should be observable.

No boundary should become invisible.

---

Rule 5

Protect privacy.

Never expose unnecessary user information.

---

# Future

Future Flight Recorders should follow exactly the same architecture.

Journey

Sleep

Watch Sync

Health

Nutrition

AdminAvenger

Safety

Every recorder should produce evidence in the same format.

---

# Success Criteria

A completed Journey should allow an engineer to answer:

Did Android continue producing GPS callbacks?

Did Replay receive them?

Did Motion Session process them?

Did Resume Detector evaluate them?

Did Resume Trigger fire?

Did Journey change state?

Where did the baton stop?

Every answer must come from evidence.

Never from assumptions.

---

# NES Definition

The purpose of the Journey Flight Recorder is not to fix bugs.

Its purpose is to reveal the truth about what happened during a Journey.

Once the truth is visible, engineering decisions become straightforward.

# NES Engineering Memory & Learning System

Status: Future NES capability / design requirement  
Origin case study: NinFit H5 Journey Distance Integrity investigation  
Recorded: 2026-09-18

## Purpose

NES should not only record whether engineering work passed or failed. It should preserve what was observed, what was learned, why a decision was justified, what remains uncertain, and how that knowledge changes future engineering work.

The goal is to turn real project work into durable engineering memory while also developing the engineer's judgement.

## Core learning loop

```text
Engineering work
      ↓
NES observes the evidence
      ↓
Gate / experiment recorded
      ↓
Result recorded
PASS / FAIL / BLOCKED / UNKNOWN
      ↓
Engineering Minute
├─ What did we learn?
├─ What did we disprove?
├─ What remains uncertain?
└─ Where might this learning apply?
      ↓
NES knowledge grows
      ↓
Next experiment uses that knowledge
      ↓
More evidence
      ↺
```

## Knowledge maturity

NES must not silently convert a single result into a universal rule.

Knowledge should mature through explicit evidence-backed stages:

1. Observation
2. Finding
3. Repeated finding
4. Candidate lesson
5. Verified engineering principle

Every promoted lesson or principle should retain:

- supporting evidence;
- originating project, session, investigation and gates;
- applicability;
- known limits;
- contradictory evidence;
- remaining uncertainty;
- promotion history.

UNKNOWN remains a valid state. Lack of evidence must never be converted into confidence.

## Engineering memory

NES should be able to answer not only "what changed?" but:

- Why did we believe the change was justified?
- Which evidence supported it?
- Which hypotheses were disproved?
- Which experiments failed because of the product versus the harness?
- Which uncertainties remain?
- Which previous lessons apply to the current problem?
- Has later evidence weakened or strengthened an earlier lesson?

This should create an auditable evidence chain from field symptom to engineering conclusion.

## Engineer development

NES should also measure whether engineering judgement improves over time.

Potential measures include:

- quality of hypotheses;
- experiments required to resolve an uncertainty;
- size and scope of experiments;
- changes made before evidence existed;
- regressions detected before release;
- rate of incorrect assumptions being converted into explicit UNKNOWNs;
- reusable lessons discovered;
- recurrence of previously understood defects;
- ability to identify the correct ownership/seam earlier.

These measures must be interpreted cautiously. They are learning signals, not simplistic performance scores.

## Example dashboard direction

```text
NES KNOWLEDGE

Projects analysed
Investigations
Experiments
Hypotheses disproved
Defects found before release
Reusable lessons
Candidate principles
Verified principles

Current project: NinFit
Investigation: H5 Journey Distance Integrity

Original symptom
└─ Journey/GPS field failure

Evidence chain
├─ GPS drift
├─ false movement
├─ provisional authority
├─ persistence ordering defect
├─ crash consistency defect
├─ replay/idempotency issue
├─ incomplete live COMMIT handshake
└─ missing production physical witness

Lessons produced
├─ project-specific
├─ reusable
└─ candidate NES principles
```

## First major case study: NinFit H5

The NinFit H5 investigation should become the first substantial real-world dataset used to design and validate this learning system.

It is valuable because the investigation was not constructed as a demonstration. It began with a real field failure and evolved through repeated observation, hypotheses, deterministic regressions, crash-window testing, stale-test classification, persistence ordering, replay/idempotency work, and discovery of a missing production evidence source.

One candidate reusable lesson already emerging is:

> When an architecture requires independent corroboration before granting authority, verification must prove that a production source actually supplies that corroboration. Proving the consumer and tests exist is insufficient.

This remains a candidate lesson until its applicability and limits are evaluated against further evidence.

## Evidence for NES itself

NES should eventually be evaluated as an engineering methodology, not assumed to be effective because it was designed with good intentions.

For each case study, capture evidence that can help answer:

- Did NES expose defects that would otherwise likely have remained hidden?
- Did it reduce uncertainty before production changes?
- Did it prevent unsafe or premature fixes?
- Did it improve regression quality?
- Did it improve recovery from failed hypotheses?
- Did it generate reusable engineering knowledge?
- Did the engineer's judgement become more disciplined and efficient?

NinFit can therefore test two things simultaneously:

1. Whether the software becomes demonstrably more reliable.
2. Whether NES measurably improves the process used to create that reliability.

## Implementation principle

Do not interrupt active investigations merely to build the learning system.

Finish the investigation with its evidence trail intact, then use that real trail to design the smallest useful NES learning increment.

The system should learn from engineering work without changing engineering truth.

## Relationship to existing NES principles

This capability extends the existing NES foundation:

- Observe before changing.
- Facts before conclusions.
- UNKNOWN is valid.
- Instrumentation must never change behaviour.
- Follow the baton.
- Measure progress by uncertainty removed.

The learning system must preserve those constraints rather than bypass them.

## Incremental implementation roadmap (added 2026-10-08)

The current NES dashboard already supports human-entered Engineering Minutes linked to historical terminal gate assessments, plus local event-history export. It does **not** automatically read Git repositories, collect raw gate evidence, verify provenance, retrieve lessons for agents, or run Android emulators. Preserve that distinction between implemented functionality and future design.

1. **Knowledge indexing, documentation-first:** maintain discoverable links among cases, ADRs, lessons, patterns and raw evidence pointers. Capture status, applicability, limits, contradictions and reconsideration conditions.
2. **Pre-gate retrieval, human reviewed:** surface relevant engineering DNA before planning the next bounded experiment. Require explicit relevance assessment; never let retrieved notes override current repository/runtime evidence.
3. **Provenance and archival:** define opt-in import from local evidence, with content hashes and redaction review. Keep source reports immutable; never silently copy personal GPS trails, credentials or private databases into public Git.
4. **Environment verification adapters:** after NinFit's disposable emulator gates provide real evidence, extract the smallest reusable isolation, identity, targeting, execution and cleanup contract. See ADR-002.
5. **Learning evaluation:** compare decisions, regressions caught, time-to-reproduce and uncertainty removed across real cases, with honest confounders. Do not reward gate count for its own sake.

### Engineering DNA record, proposed minimum fields

```text
record ID / type / maturity / date
source project / worktree / gate / commit
raw evidence locations + availability + hashes (where verified)
observation -> finding -> decision -> limits
frozen authority / actual commands / executed vs NOT RUN
environment identity / isolation constraints
contradictions / superseded-by / reconsideration trigger
reusable applicability / next unverified boundary
human reviewer and promotion rationale (if promoted)
```

This is a proposed schema, not a claim that NES currently persists all these fields. Never silently translate `BLOCKED`, `UNKNOWN`, `NOT RUN` or expected RED into PASS.

### Avoid process overhead without learning

Use the smallest gate that meaningfully reduces uncertainty. Periodically ask whether the next gate tests real behaviour or only adds paperwork. Promote reusable lessons only after evaluating their scope and contrary evidence.

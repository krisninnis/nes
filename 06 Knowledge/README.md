# NES Engineering Knowledge Base

This directory is the durable learning layer of the Ninnis Engineering System.

NES evidence records answer **what happened**. This knowledge base answers **what we learned, why it matters, where it applies, and what remains uncertain**.

The knowledge base does not replace raw evidence, gate records, test output, repository history, or Engineering Minutes. It distils reusable engineering knowledge from them while preserving the distinction between observation, inference, decision, and principle.

## Knowledge flow

```text
project observation
      |
      v
raw evidence / gate record
      |
      v
case-study finding
      |
      v
reusable lesson or pattern
      |
      v
future project tests whether it generalises
```

A lesson is not automatically a universal principle. A decision is not automatically permanent. Each entry should record its evidence basis, scope, limitations, and what could cause it to be revised.

## Structure

- `lessons/` - reusable engineering lessons extracted from project work.
- `decisions/` - significant engineering decisions and their reasoning, including alternatives and reconsideration conditions.
- `patterns/` - repeatable engineering practices that have earned support through use.
- `case-studies/` - project-specific findings from which broader lessons can be extracted.

## Entry discipline

Knowledge entries should distinguish:

1. **Observation** - what was actually seen, measured, run, or recorded.
2. **Finding** - the narrow conclusion supported by those observations.
3. **Lesson** - the potentially reusable engineering insight.
4. **Limit** - what the evidence does not establish.
5. **Reconsideration condition** - evidence that would weaken, supersede, or invalidate the lesson or decision.

When exact evidence records are available in the source project, link or identify them. Do not invent provenance that is not present in the repository.

## Current case studies

### NinFit

NinFit is the first substantial NES case study. It has exercised evidence-driven debugging across GPS, Android lifecycle behaviour, durable queues, replay, browser storage limits, physical-device verification, test authority, renderer recovery, identity continuity, and fail-closed recovery design.

See `case-studies/ninfit/README.md`.

## Retrieval before a new gate

Before proposing a new gate, inspect the relevant case study, decisions, lessons and patterns. Record which entries were considered, which apply, which do not, and whether any conflict with newer evidence. Do not treat retrieval as automatic authorisation. Preserve links to original evidence, and distinguish GitHub-published records from local-only reports.

Recommended minimum baton: repository/worktree identity, predecessor report and DNA, immutable test authority, mutation and device-access budget, executed/not-executed checks, first unexpected failure, classification, and next unverified boundary. See `patterns/evidence-baton-and-baseline-preservation.md`.

## Knowledge maturity and correction

Keep observations, supported findings, candidate lessons and verified principles distinct. If later evidence contradicts a lesson, add a dated correction or supersession link; do not erase the original rationale. A local report path is a provenance pointer, not independent proof that the report was reviewed or published. Do not automatically ingest secrets, private device databases, location trails or credentials into a public repository.

## Additional NinFit-derived entries

- `lessons/durable-evidence-versus-processed-state.md` - raw queue durability, processed commits, acknowledgement and replay.
- `patterns/evidence-baton-and-baseline-preservation.md` - safe handovers, frozen baselines and first-new-RED discipline.
- `patterns/verification-ladder-and-environment-isolation.md` - host versus Android versus physical proof.
- `decisions/ADR-002-reusable-isolated-test-environments.md` - reuse isolated emulator/test infrastructure rather than embedding an emulator in NES.

These are documentation and design knowledge, not claims that the current NES dashboard implements automatic retrieval or emulator orchestration.

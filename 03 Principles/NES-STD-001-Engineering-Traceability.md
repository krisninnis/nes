# NES-STD-001: Engineering Traceability, Code Documentation and Handover

**Status:** Proposed governing standard, pending owner review and adoption  
**Version:** 1.0, 2026-10-10  
**Scope:** All NES-governed projects, including Ningle Entertainment, Ninglecode, NingleFit and the NES Developer Test Centre.  
**Authority:** Human project owner. This proposal does not authorise implementation, change existing gates, or supersede frozen evidence.

## Purpose

Every material engineering change must leave a durable and understandable trail. A developer joining later must be able to reconstruct what was changed, why, which evidence supported it, what failed, what was not tested, and what can safely happen next.

This standard **supplements** [NES governing principles](../../NES_PRINCIPLES.md), the [engineering-memory roadmap](../../01%20Roadmaps/NES%20Engineering%20Memory%20and%20Learning%20System.md), and the [evidence-baton pattern](../../06%20Knowledge/patterns/evidence-baton-and-baseline-preservation.md). It does not treat proposal, observation, conclusion and authorisation as interchangeable.

## 1. Mandatory engineering footprints

For each authorised gate or bounded work item, retain, where applicable:

- Work ID, objective, scope, authorisation, permitted/forbidden operations and stop conditions.
- Starting repository/worktree identity, branch, HEAD or unborn-HEAD state, dirty/untracked paths, frozen baselines and relevant hashes.
- Environment and tool versions needed to reproduce the work, without credentials or private data.
- Observations, hypotheses, alternatives, decisions, rationale and references to predecessor evidence.
- Material commands/actions actually run, timestamps where available, outputs, exit status and unexpected failures. Mark intended but unexecuted steps **NOT RUN**.
- Tests and checks with exact environment, expected and actual outcomes, skipped cases and proof limitations.
- Source, interface, dependency, configuration and behavioural changes, with known risks and compatibility implications.
- Artifact provenance, identifiers, SHA-256, byte sizes and manifest references when required by the gate.
- Open risks, blockers, recovery steps, next unverified boundary and successor-gate recommendation.

Distinguish facts from assumptions. An exit code 0 does not by itself prove that a review met its completion criteria. Compilation, host tests, simulator testing and physical-device testing establish different levels of confidence.

## 2. Source-code documentation

Code must be understandable to a competent developer unfamiliar with its author.

- Document the purpose and contract of public APIs, significant classes, interfaces, modules and non-obvious functions.
- Explain *why* surprising logic exists, including invariants, security decisions, concurrency and lifecycle ordering, compatibility workarounds and fail-closed behaviour.
- Explain shared-core contracts and platform-adapter responsibilities for multi-platform software.
- Keep comments current when code changes; link to gate IDs or decisions where the rationale is not self-evident.
- Prefer expressive names and focused tests over comments that merely paraphrase syntax.
- Document relevant setup, build, verification, dependencies, known limitations and recovery steps for future maintainers.
- Never include passwords, tokens, personal data, private playlist URLs or secrets in comments and example snippets.

Review documentation quality alongside functional correctness. Comments that are stale or misleading are defects.

## 3. Git provenance and safe changes

- Use descriptive commits identifying the relevant NES work item or gate.
- Review the exact diff and staged paths before commit; stage only authorised files.
- Preserve pre-existing dirty and untracked work. Never silently reset, clean, stash, amend, rebase or force-push.
- Preserve an unborn HEAD as an explicit state; do not invent or silently create a baseline commit.
- Commit and publish only within approved change boundaries. Prefer review branches or pull requests when appropriate.
- Record the resulting commit SHA and remote destination after verification.
- Git records file history but does not independently prove historical authenticity or the truth of evidence claims.

## 4. Evidence preservation

- Use existing gate-scoped evidence paths and manifest conventions; do not relocate earlier evidence just to fit this standard.
- Retain original reports and failures. Corrections are additional, linked records, never silent historical rewrites.
- Frozen artifacts, manifests and gate authority require separately authorised reconciliation before alteration.
- Clearly distinguish local hash consistency from independently established provenance.
- Keep **PASS/GREEN**, **FAIL/RED**, **BLOCKED**, **UNKNOWN**, **UNVERIFIED** and **NOT RUN** distinct according to controlling gate contracts.
- Keep evidence locatable without relying solely on chat transcripts or one developer's workstation.
- Do not automatically copy sensitive raw evidence into this public NES repository.

## 5. Security and privacy

Redact secrets and unnecessary personal information before logging, committing, exporting or sharing. Avoid leaks through exception text, diagnostics, screenshots, CI artifacts or generated manifests. If exposure is suspected, STOP and follow the applicable incident process without reproducing the secret in the report.

## 6. Multi-platform evidence

Record the tested platform, OS/runtime version, adapter, device or simulator identity and configuration. Do not claim support for an untested platform based on another platform's build. The shared NES Developer Test Centre must isolate evidence by project and target; a reusable test adapter is not permission to access valuable physical devices.

## 7. Developer handover

Every completed, stopped or blocked gate should leave a concise baton:

1. Exact current state and verified achievements.
2. Changes and touched paths.
3. Failures, blocked items, limits and unrun checks.
4. Reproduction or verification instructions.
5. Protected evidence and operational restrictions.
6. Next unverified boundary and whether owner authorisation is required.

Handover summaries are navigation aids, not substitutes for raw evidence.

## 8. Definition of done and adoption

Applicable completion criteria include reviewed code, accurate comments, reproducible validation, recorded actual outcomes, preserved evidence and a usable handover. Missing proof must not be labelled success.

Adoption in each project requires an explicit approved change. Project agent instructions such as `AGENTS.md` should link to this standard without overwriting stricter project rules. Changes to this standard require a versioned, reviewed amendment, rationale and explicit owner approval.

**This document is a governance proposal; its presence in Git is not evidence that all repositories already comply or that an implementation gate was authorised.**

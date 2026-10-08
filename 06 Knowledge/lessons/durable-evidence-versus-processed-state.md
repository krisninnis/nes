# Durable raw evidence is not durable processed state

Status: Supported NinFit case-study lesson, generalisation pending
Recorded: 2026-10-08

## Observation

NinFit captured native GPS observations while its browser-side Journey processing could fail when rewriting a growing full-history snapshot to `localStorage`. A `QuotaExceededError` could prevent the processed-state commit; native queue acknowledgement was withheld, preserving replayable raw observations. Thousands of pending positions also caused long Finish latency without establishing a deadlock.

## Lesson

Separate and verify:

```text
sensor occurrence
      |
      v
raw durable queue
      |
      v
processing / transformation
      |
      v
processed durable commit
      |
      v
acknowledgement of raw input
```

The acknowledgement boundary must not outrun the durable processed commit. A surviving raw queue does not imply that the visible Journey is current, complete, or efficiently recoverable. Similarly, a slow drain is not automatically a deadlock.

## Verification questions

- Is the original occurrence/provenance preserved, rather than replaced by replay or callback time?
- Can the processed-state write fail atomically and leave raw input replayable?
- Is replay idempotent or otherwise safe against duplicate application?
- Are queue capacity, drain rate, storage quota, and Finish latency measured at realistic history sizes?
- Is a backlog/blocked state observable without granting unsafe live-motion authority?
- Does an observed recovery or completion have physical/runtime evidence, not just a host test?

## Boundaries and limits

The exact NinFit storage architecture and failure mechanism are project-specific. This lesson does not assert that any particular future store is crash-safe, that replay transport is GREEN, or that Android runtime instrumentation has passed. See the NinFit case study and the original local gate evidence for provenance.

## Reconsideration

Revise if a different transactional architecture establishes a stronger atomic boundary or if field evidence contradicts the current failure model.

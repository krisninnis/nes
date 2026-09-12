# Dashboard architecture — v1

## Smallest coherent application

- **React + TypeScript + Vite** provides a lightweight, standalone browser dashboard.
- `src/domain/model.ts` defines strongly typed domain records and a discriminated event union.
- `src/domain/engine.ts` validates and replays events into the current read model. It contains no browser or presentation dependencies.
- `src/domain/storage.ts` loads and saves a versioned event array in browser-local storage. It refuses to silently overwrite malformed or unsupported history.
- `src/domain/seed.ts` provides one illustrative Android signing case only for an empty browser history.
- `src/ui/App.tsx` presents the read model and records explicit human-entered events. No action runs a test, changes a repository, or sends data to a service.

## Event and evidence model

Every change is a new event with a unique ID and timestamp. Replay reconstructs the current Project, Session, Gate, Evidence, Claim, Decision, Engineering Minute, Repository State, Verification, and Constraint views. A gate or claim assessment may supersede a status, but the earlier event remains exportable and visible in History. Evidence records themselves are not edited in place.

`minute.recorded` carries only the source `gate.transitioned` event ID and three human reflections: `learning`, `applicabilityAndLimits`, and `remainingUncertainty`. Its ordinary event ID and timestamp identify the Minute. Replay requires an earlier source of kind `gate.transitioned` with `PASS`, `FAIL`, or `BLOCKED` status, a resolvable gate/session/project, and nonblank reflections. The Minute does not duplicate project, session, gate, status, conclusion, or evidence IDs. The UI derives the exact historical source and evidence count from the event log and compares it with the latest gate assessment. A later reassessment leaves the Minute and its source untouched; it may only change the current gate state and cause a historical-source warning.

The domain rejects duplicate event/record IDs, missing relationships, cross-project evidence links, invalid gate transitions, a `PASS` gate without evidence, and a `PROVEN` claim without evidence. This is structural validation, not automatic adjudication of evidence quality. A human must decide whether the observation actually supports the conclusion. The domain has no APK-specific branches; the Android case is ordinary seed events.

The browser write path validates the new whole history before saving it. If loading or writing fails, the UI reports the error instead of claiming a successful record. Existing corrupt data is not reset automatically. The `nes.events.v1` envelope remains unchanged: earlier v1 histories replay with zero Minutes. An older binary that lacks this event kind may reject a newer history on downgrade; failing closed is safer than discarding an unrecognized record.

## Deliberate limits

- `localStorage` is convenient but not durable or tamper-proof; export JSON regularly. No import/recovery UI yet.
- Single browser/profile only. No sync, identity, permission model, or collaboration.
- Evidence is text/metadata and references, not attached binary files or independently verified source artefacts.
- Repository SHA, branch, and CI details are entered by a human. NES does not inspect or validate a remote repository.
- No NinFit, AdminAvenger, GitHub, cloud, AI automation, telemetry, or upload integration.
- The seeded Android example is illustrative and asserts no real-world APK signing acceptance.
- A Minute preserves a human interpretation, not authenticated evidence or a certified engineering lesson. NES cannot judge whether the source conclusion is correct, the learning follows, the learning transfers, or a principle should be promoted. Zero-reference `FAIL` and `BLOCKED` assessments retain their original structural meaning; a lack of cited evidence is displayed, not silently repaired.

Future versions should be driven by approved requirements and actual engineering use, not by assuming that every possible workflow belongs in v1.

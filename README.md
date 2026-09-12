# Ninnis Engineering System (NES)

NES is an evidence-driven engineering workspace. It helps an engineer record the state they found, test explicit hypotheses, preserve observations, and distinguish proof from inference. It does not make engineering decisions or execute actions on the engineer's behalf.

This repository contains the v1 local dashboard and the pre-existing NES methodology documents. The dashboard is a standalone React/TypeScript application. It has no backend, accounts, GitHub connection, AI decision-maker, upload path, analytics, or telemetry.

## Run locally

Requires Node.js and npm. From the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The app works without network access after dependencies are installed. It uses system fonts and does not fetch remote assets at runtime.

## Validate

```sh
npm test
npm run typecheck
npm run build
```

`npm test` runs the domain and storage invariant tests once. The production build is written to `dist/` and is ignored by Git.

## What v1 records

Projects, engineering sessions, hypothesis gates, evidence, claims, human decisions, Engineering Minutes, repository observations, verification runs, constraints, and an append-only event history. New assessments change the *current view* by adding events; earlier observations and assessments remain in History and in exported JSON.

An **Engineering Minute** is a human-recorded lesson tied to one exact historical `PASS`, `FAIL`, or `BLOCKED` gate assessment. In **Engineering Minutes**, select an assessment, inspect its conclusion and evidence count, and explicitly record the learning, its applicability and limits, and what remains uncertain. An `ACTIVE` assessment is not eligible. A later reassessment does not change the Minute's source; the UI warns when its source is no longer the latest assessment and shows the current gate state. A zero-evidence `FAIL` or `BLOCKED` source remains possible and is shown as **0 evidence references**, not as independently established disproval or proof of the blockage. Minutes are neither evidence, new gate conclusions, nor automatically promoted principles.

The first launch displays one clearly marked **illustrative** Android APK signing investigation. It is a demonstration of the workflow, not a live repository or APK check. In particular, the APK certificate claim is unproven. The example is only seeded when the browser has no NES history. It becomes local history on the first recorded change.

Data is stored in this browser's `localStorage` under `nes.events.v1`. Use **Export history** for a JSON backup. Browser storage can be erased by profile cleanup, private browsing, quota limits, or a device failure. NES does not yet provide import, sync, authentication, multi-user collaboration, attachments, or a tamper-proof audit log. Do not enter secrets or private material unless storing them in this browser is appropriate.

## Engineering rules

- A gate cannot transition to `PASS` without linked evidence.
- A claim cannot be `PROVEN` without linked evidence.
- Referenced evidence must exist and belong to the same project.
- Invalid gate transitions are rejected.
- A later `FAIL` can supersede a current gate result but cannot delete an earlier `PASS` event or its evidence.
- A Minute requires an earlier terminal gate assessment and three nonempty human-entered reflection fields. It stores a reference to that assessment rather than copies of its project, gate, conclusion, or evidence links.
- An invalid or unsupported local history fails closed: the app shows a recovery warning and does not silently reset it.

Existing `nes.events.v1` histories without Minutes still load unchanged. The storage envelope is not bumped, but an older NES binary that does not recognize `minute.recorded` may fail closed on a newer history instead of silently dropping the event.

These checks support careful recording; they do **not** establish that user-entered evidence is authentic, supports the source conclusion, or is sufficient to prove a real-world claim. NES cannot certify the conclusion, decide whether a lesson logically follows or transfers elsewhere, or decide whether it deserves to become a principle. The human engineer remains responsible for those judgements.

See [NES_PRINCIPLES.md](NES_PRINCIPLES.md) for the governing rules and [dashboard architecture](ARCHITECTURE.md) for implementation decisions. The original NES methodology remains in `00-README.md`, `02 Architecture/`, and `03 Principles/`.

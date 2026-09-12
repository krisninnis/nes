import type { EngineeringEvent } from "./model";

const at = "2026-09-12T09:00:00.000Z";
const projectId = "demo-android-signing";
const sessionId = "demo-review-session";
const evidenceId = "demo-parser-evidence";

const event = <T extends EngineeringEvent>(value: T): T => value;

// Demonstration data only. It does not assert that NES observed a real APK,
// remote branch, certificate fingerprint, or CI result.
export const illustrativeEvents: EngineeringEvent[] = [
  event({
    id: "demo-event-01", at, kind: "project.created",
    value: {
      id: projectId,
      name: "Android APK signing investigation",
      description: "Illustrative example · not a live repository or verified APK.",
      repository: "Example Android repository (location not recorded)",
      status: "ACTIVE",
      illustrative: true,
    },
  }),
  event({
    id: "demo-event-02", at, kind: "session.created",
    value: {
      id: sessionId, projectId,
      objective: "Prove that an acceptance APK carries a stable pinned review signing identity.",
      startingState: "Parser-fix commit has been inspected; exact remote head and APK certificate are not yet proven here.",
      constraints: "Preserve evidence and verify one hypothesis at a time.",
      prohibitedActions: "Do not change the signing key, alter unrelated Journey runtime behaviour, or merge.",
      startedAt: at, status: "ACTIVE",
    },
  }),
  event({
    id: "demo-event-03", at, kind: "evidence.created",
    value: {
      id: evidenceId, projectId,
      type: "Commit inspection",
      description: "Illustrative review records a narrowly scoped, fail-closed certificate parser repair.",
      raw: "Commit 65b2fc693ea4db69c164e0340d2943519a38c183 was inspected. It introduces deterministic certificate readings and cross-checking.",
      source: "Illustrative engineering review note supplied with the NES brief",
      observedAt: at,
      repositorySha: "65b2fc693ea4db69c164e0340d2943519a38c183",
      branch: "Not recorded",
      commandOrCi: "Commit inspection; no exact-head CI result recorded",
    },
  }),
  event({
    id: "demo-event-04", at, kind: "gate.created",
    value: {
      id: "demo-h1", sessionId, identifier: "H1",
      question: "Is the certificate parser repair narrowly scoped and fail-closed?",
      rationale: "Parser trust must be established before an APK identity conclusion.",
      requiredEvidence: "Inspect the exact parser-fix commit and its cross-checking behaviour.",
      status: "NOT_STARTED", conclusion: "", evidenceIds: [], nextPermittedAction: "Inspect commit.",
    },
  }),
  event({
    id: "demo-event-05", at, kind: "gate.transitioned",
    gateId: "demo-h1", status: "ACTIVE", conclusion: "", evidenceIds: [],
    nextPermittedAction: "Review deterministic certificate readings.",
  }),
  event({
    id: "demo-event-06", at, kind: "gate.transitioned",
    gateId: "demo-h1", status: "PASS",
    conclusion: "Illustrative review concluded that this parser repair is narrowly scoped and fail-closed; APK identity remains unproven.",
    evidenceIds: [evidenceId], nextPermittedAction: "Establish exact remote branch SHA.",
  }),
  event({
    id: "demo-event-07", at, kind: "gate.created",
    value: {
      id: "demo-h2", sessionId, identifier: "H2",
      question: "Does the exact parser-fix commit exist on the remote branch?",
      rationale: "A local inspection cannot establish remote branch identity.",
      requiredEvidence: "Read-only remote branch SHA matching the exact parser-fix commit.",
      status: "NOT_STARTED", conclusion: "", evidenceIds: [],
      nextPermittedAction: "Establish remote branch SHA without modifying local state.",
    },
  }),
  event({
    id: "demo-event-08", at, kind: "gate.transitioned",
    gateId: "demo-h2", status: "ACTIVE", conclusion: "", evidenceIds: [],
    nextPermittedAction: "Establish remote branch SHA without modifying local state.",
  }),
  event({
    id: "demo-event-09", at, kind: "claim.created",
    value: {
      id: "demo-claim-apk", projectId,
      statement: "The acceptance APK certificate matches the pinned review fingerprint.",
      status: "UNPROVEN", evidenceIds: [],
      limitations: "Requires an exact-head CI run and certificate comparison. Do not infer this from parser inspection.",
    },
  }),
  ...[
    ["signing-key", "Do not change the signing key.", "Identity would be altered."],
    ["journey-runtime", "Do not modify unrelated Journey runtime behaviour.", "Keep the investigation scoped."],
    ["merge", "Do not merge.", "Acceptance proof is incomplete."],
    ["dirty-worktrees", "Protect unrelated dirty worktrees.", "Preserve existing user work."],
  ].map(([suffix, description, reason], index): EngineeringEvent => ({
    id: `demo-event-${10 + index}`, at, kind: "constraint.created",
    value: { id: `demo-constraint-${suffix}`, projectId, description, reason, active: true },
  })),
];

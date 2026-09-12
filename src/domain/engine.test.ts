import { describe, expect, it } from "vitest";
import { appendEvent, DomainError, replayEvents } from "./engine";
import { illustrativeEvents } from "./seed";
import type { EngineeringEvent } from "./model";

const at = "2026-09-12T10:00:00.000Z";
let number = 0;
const event = <T extends EngineeringEvent>(value: Omit<T, "id" | "at">): T => ({
  ...value, id: `test-event-${++number}`, at,
}) as T;

describe("evidence-driven gate transitions", () => {
  it("requires real same-project evidence before PASS", () => {
    const transition = event<Extract<EngineeringEvent, { kind: "gate.transitioned" }>>({
      kind: "gate.transitioned", gateId: "demo-h2", status: "PASS",
      conclusion: "Remote identity established.", evidenceIds: [], nextPermittedAction: "Continue.",
    });
    expect(() => appendEvent(illustrativeEvents, transition)).toThrowError(
      "A PASS gate requires supporting evidence.",
    );
    expect(replayEvents(illustrativeEvents).gates.find((gate) => gate.id === "demo-h2")?.status).toBe("ACTIVE");
  });

  it("rejects invalid jumps and duplicate status transitions", () => {
    const next = event<Extract<EngineeringEvent, { kind: "gate.transitioned" }>>({
      kind: "gate.transitioned", gateId: "demo-h2", status: "NOT_STARTED",
      conclusion: "", evidenceIds: [], nextPermittedAction: "",
    });
    expect(() => appendEvent(illustrativeEvents, next)).toThrow(DomainError);
  });

  it("keeps one active gate per engineering session", () => {
    const created = event<Extract<EngineeringEvent, { kind: "gate.created" }>>({
      kind: "gate.created",
      value: {
        id: "demo-h3", sessionId: "demo-review-session", identifier: "H3",
        question: "Can the APK certificate be proven?", rationale: "Exact identity matters.",
        requiredEvidence: "Exact-head CI certificate output.", status: "NOT_STARTED",
        conclusion: "", evidenceIds: [], nextPermittedAction: "Wait for H2.",
      },
    });
    const activate = event<Extract<EngineeringEvent, { kind: "gate.transitioned" }>>({
      kind: "gate.transitioned", gateId: "demo-h3", status: "ACTIVE",
      conclusion: "", evidenceIds: [], nextPermittedAction: "Run exact-head CI.",
    });
    expect(() => appendEvent(appendEvent(illustrativeEvents, created), activate)).toThrowError(
      "Finish or block the current active gate before activating another in this session.",
    );
  });

  it("keeps an earlier PASS and its evidence after a later FAIL supersedes it", () => {
    const failed = event<Extract<EngineeringEvent, { kind: "gate.transitioned" }>>({
      kind: "gate.transitioned", gateId: "demo-h1", status: "FAIL",
      conclusion: "Later contradictory observation supersedes the previous assessment.",
      evidenceIds: ["demo-parser-evidence"], nextPermittedAction: "Investigate contradiction.",
    });
    const next = appendEvent(illustrativeEvents, failed);
    expect(replayEvents(next).gates.find((gate) => gate.id === "demo-h1")?.status).toBe("FAIL");
    expect(next.some((item) => item.kind === "gate.transitioned" && item.gateId === "demo-h1" && item.status === "PASS")).toBe(true);
    expect(next.some((item) => item.kind === "evidence.created" && item.value.id === "demo-parser-evidence")).toBe(true);
  });
});

describe("claim and evidence integrity", () => {
  it("does not promote an unproven APK claim without supporting evidence", () => {
    const proven = event<Extract<EngineeringEvent, { kind: "claim.assessed" }>>({
      kind: "claim.assessed", claimId: "demo-claim-apk", status: "PROVEN",
      evidenceIds: [], limitations: "",
    });
    expect(() => appendEvent(illustrativeEvents, proven)).toThrowError(
      "A PROVEN claim requires supporting evidence.",
    );
    expect(replayEvents(illustrativeEvents).claims[0].status).toBe("UNPROVEN");
  });

  it("rejects fabricated or cross-project evidence references", () => {
    const proven = event<Extract<EngineeringEvent, { kind: "claim.assessed" }>>({
      kind: "claim.assessed", claimId: "demo-claim-apk", status: "PROVEN",
      evidenceIds: ["missing-evidence"], limitations: "",
    });
    expect(() => appendEvent(illustrativeEvents, proven)).toThrowError(
      "Evidence must exist in the same project.",
    );
  });

  it("retains earlier claim assessments when later evidence disproves them", () => {
    const proven = event<Extract<EngineeringEvent, { kind: "claim.assessed" }>>({
      kind: "claim.assessed", claimId: "demo-claim-apk", status: "PROVEN",
      evidenceIds: ["demo-parser-evidence"], limitations: "Illustrative only.",
    });
    const disproven = event<Extract<EngineeringEvent, { kind: "claim.assessed" }>>({
      kind: "claim.assessed", claimId: "demo-claim-apk", status: "DISPROVEN",
      evidenceIds: ["demo-parser-evidence"], limitations: "Later assessment.",
    });
    const next = appendEvent(appendEvent(illustrativeEvents, proven), disproven);
    expect(replayEvents(next).claims[0].status).toBe("DISPROVEN");
    expect(next.some((item) => item.kind === "claim.assessed" && item.status === "PROVEN")).toBe(true);
    expect(next.some((item) => item.kind === "claim.assessed" && item.status === "DISPROVEN")).toBe(true);
  });

  it("rejects evidence from a different project when passing a gate", () => {
    const projectA = event<Extract<EngineeringEvent, { kind: "project.created" }>>({
      kind: "project.created",
      value: {
        id: "project-a",
        name: "Project A",
        description: "",
        repository: "",
        status: "ACTIVE",
        illustrative: false,
      },
    });

    const projectB = event<Extract<EngineeringEvent, { kind: "project.created" }>>({
      kind: "project.created",
      value: {
        id: "project-b",
        name: "Project B",
        description: "",
        repository: "",
        status: "ACTIVE",
        illustrative: false,
      },
    });

    const sessionA = event<Extract<EngineeringEvent, { kind: "session.created" }>>({
      kind: "session.created",
      value: {
        id: "session-a",
        projectId: "project-a",
        objective: "Verify project evidence isolation.",
        startingState: "",
        constraints: "",
        prohibitedActions: "",
        startedAt: at,
        status: "ACTIVE",
      },
    });

    const gateA = event<Extract<EngineeringEvent, { kind: "gate.created" }>>({
      kind: "gate.created",
      value: {
        id: "gate-a",
        sessionId: "session-a",
        identifier: "H1",
        question: "Can this gate use evidence from another project?",
        rationale: "Evidence must remain project-scoped.",
        requiredEvidence: "Evidence belonging to Project A.",
        status: "NOT_STARTED",
        conclusion: "",
        evidenceIds: [],
        nextPermittedAction: "Activate gate.",
      },
    });

    const evidenceB = event<Extract<EngineeringEvent, { kind: "evidence.created" }>>({
      kind: "evidence.created",
      value: {
        id: "evidence-b",
        projectId: "project-b",
        type: "test",
        description: "Evidence belonging to Project B.",
        raw: "foreign evidence",
        source: "test",
        observedAt: at,
        repositorySha: "",
        branch: "",
        commandOrCi: "",
      },
    });

    const activate = event<Extract<EngineeringEvent, { kind: "gate.transitioned" }>>({
      kind: "gate.transitioned",
      gateId: "gate-a",
      status: "ACTIVE",
      conclusion: "",
      evidenceIds: [],
      nextPermittedAction: "Verify evidence.",
    });

    const pass = event<Extract<EngineeringEvent, { kind: "gate.transitioned" }>>({
      kind: "gate.transitioned",
      gateId: "gate-a",
      status: "PASS",
      conclusion: "Gate passed.",
      evidenceIds: ["evidence-b"],
      nextPermittedAction: "Continue.",
    });

    const history = [
      projectA,
      projectB,
      sessionA,
      gateA,
      evidenceB,
      activate,
    ];

    expect(() => appendEvent(history, pass)).toThrow(/project/i);
  });});

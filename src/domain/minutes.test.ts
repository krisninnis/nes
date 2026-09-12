import { describe, expect, it } from "vitest";
import { appendEvent, replayEvents } from "./engine";
import { illustrativeEvents } from "./seed";
import type { EngineeringEvent, GateStatus } from "./model";

type AssessmentEvent = Extract<EngineeringEvent, { kind: "gate.transitioned" }>;
type MinuteEvent = Extract<EngineeringEvent, { kind: "minute.recorded" }>;
type EvidenceEvent = Extract<EngineeringEvent, { kind: "evidence.created" }>;

const at = "2026-09-12T11:00:00.000Z";
let sequence = 0;
const id = (): string => `minute-test-${++sequence}`;

const minute = (sourceAssessmentEventId: string): MinuteEvent => ({
  id: id(), at, kind: "minute.recorded", sourceAssessmentEventId,
  learning: "The chosen verification path has a boundary worth remembering.",
  applicabilityAndLimits: "Apply only to similar verification paths; this is not a universal rule.",
  remainingUncertainty: "The underlying APK identity has not been established here.",
});

const h2Assessment = (status: GateStatus, evidenceIds: string[] = []): AssessmentEvent => ({
  id: id(), at, kind: "gate.transitioned", gateId: "demo-h2", status,
  conclusion: status === "ACTIVE" ? "" : "The test path has the recorded outcome.",
  evidenceIds, nextPermittedAction: "Review the result.",
});

const evidence = (description: string): EvidenceEvent => {
  const evidenceId = id();
  return {
    id: id(), at, kind: "evidence.created",
    value: {
      id: evidenceId, projectId: "demo-android-signing", type: "Test observation",
      description, raw: description, source: "Test fixture", observedAt: at,
      repositorySha: "", branch: "", commandOrCi: "",
    },
  };
};

describe("Engineering Minutes", () => {
  it("records a Minute against an exact supported PASS event without copying source facts", () => {
    const recorded = minute("demo-event-06");
    const history = appendEvent(illustrativeEvents, recorded);
    expect(replayEvents(history).minutes).toEqual([{
      id: recorded.id, at: recorded.at, sourceAssessmentEventId: "demo-event-06",
      learning: recorded.learning, applicabilityAndLimits: recorded.applicabilityAndLimits,
      remainingUncertainty: recorded.remainingUncertainty,
    }]);
    const source = history.find((item) => item.id === recorded.sourceAssessmentEventId);
    expect(source?.kind).toBe("gate.transitioned");
    if (source?.kind === "gate.transitioned") expect(source.evidenceIds).toEqual(["demo-parser-evidence"]);
  });

  it.each(["FAIL", "BLOCKED"] as const)("allows %s with cited evidence", (status) => {
    const observed = evidence(`Observation supporting the ${status} assessment.`);
    const source = h2Assessment(status, [observed.value.id]);
    const history = appendEvent(appendEvent(appendEvent(illustrativeEvents, observed), source), minute(source.id));
    expect(replayEvents(history).minutes[0].sourceAssessmentEventId).toBe(source.id);
    expect(source.evidenceIds).toHaveLength(1);
  });

  it.each(["BLOCKED", "FAIL"] as const)("allows an honest zero-evidence %s Minute without inventing proof", (status) => {
    const source = h2Assessment(status);
    const history = appendEvent(appendEvent(illustrativeEvents, source), minute(source.id));
    const view = replayEvents(history);
    expect(view.minutes[0].sourceAssessmentEventId).toBe(source.id);
    expect(source.evidenceIds).toEqual([]);
    expect(view.gates.find((gate) => gate.id === "demo-h2")?.status).toBe(status);
    expect(view.claims.find((claim) => claim.id === "demo-claim-apk")?.status).toBe("UNPROVEN");
  });

  it("rejects an ACTIVE source assessment", () => {
    expect(() => appendEvent(illustrativeEvents, minute("demo-event-08"))).toThrow(
      "An Engineering Minute requires a PASS, FAIL, or BLOCKED assessment.",
    );
  });

  it("rejects a missing or future source assessment", () => {
    expect(() => appendEvent(illustrativeEvents, minute("missing"))).toThrow(
      "Source assessment must exist earlier in history.",
    );
    const future = h2Assessment("BLOCKED");
    expect(() => replayEvents([...illustrativeEvents, minute(future.id), future])).toThrow(
      "Source assessment must exist earlier in history.",
    );
  });

  it("rejects a source event that is not a gate assessment", () => {
    expect(() => appendEvent(illustrativeEvents, minute("demo-event-03"))).toThrow(
      "An Engineering Minute must reference a gate assessment event.",
    );
  });

  it.each(["learning", "applicabilityAndLimits", "remainingUncertainty"] as const)(
    "rejects empty %s", (field) => {
      expect(() => appendEvent(illustrativeEvents, { ...minute("demo-event-06"), [field]: "  " })).toThrow();
    },
  );

  it("retains a Minute and its exact PASS source after the gate is reassessed FAIL", () => {
    const recorded = minute("demo-event-06");
    const later: AssessmentEvent = {
      id: id(), at, kind: "gate.transitioned", gateId: "demo-h1", status: "FAIL",
      conclusion: "Later evidence changes the current conclusion.",
      evidenceIds: ["demo-parser-evidence"], nextPermittedAction: "Investigate the contradiction.",
    };
    const history = appendEvent(appendEvent(illustrativeEvents, recorded), later);
    expect(replayEvents(history).gates.find((gate) => gate.id === "demo-h1")?.status).toBe("FAIL");
    expect(replayEvents(history).minutes[0]).toMatchObject({
      id: recorded.id, sourceAssessmentEventId: "demo-event-06", learning: recorded.learning,
    });
    expect(history.find((item) => item.id === "demo-event-06")).toMatchObject({
      kind: "gate.transitioned", status: "PASS", evidenceIds: ["demo-parser-evidence"],
    });
  });

  it("does not weaken event uniqueness or existing gate validation", () => {
    expect(() => appendEvent(illustrativeEvents, { ...minute("demo-event-06"), id: "demo-event-06" })).toThrow(
      "Event IDs and timestamps must exist and event IDs must be unique.",
    );
    const invalidPass = h2Assessment("PASS");
    expect(() => replayEvents([...illustrativeEvents, invalidPass, minute(invalidPass.id)])).toThrow(
      "A PASS gate requires supporting evidence.",
    );
  });
});

import { describe, expect, it } from "vitest";
import { loadLocalHistory, saveLocalHistory } from "./storage";
import { illustrativeEvents } from "./seed";
import { replayEvents } from "./engine";

describe("local history", () => {
  it("starts with clearly illustrative data and does not persist it until a user action", () => {
    let writes = 0;
    const result = loadLocalHistory({ getItem: () => null });
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.isIllustrative).toBe(true);
      expect(result.events).toEqual(illustrativeEvents);
    }
    expect(writes).toBe(0);
    saveLocalHistory({ setItem: () => { writes += 1; } }, illustrativeEvents);
    expect(writes).toBe(1);
  });

  it("fails closed on malformed storage rather than overwriting evidence", () => {
    const result = loadLocalHistory({ getItem: () => '{broken' });
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.message).toContain("No records were overwritten");
  });

  it("replays an existing v1 history with no Minutes and does not migrate or discard events", () => {
    const raw = JSON.stringify({ schemaVersion: 1, events: illustrativeEvents });
    const result = loadLocalHistory({ getItem: () => raw });
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.events).toEqual(illustrativeEvents);
      expect(replayEvents(result.events).minutes).toEqual([]);
      expect(result.isIllustrative).toBe(false);
    }
  });

  it("round-trips a Minute in the existing v1 envelope", () => {
    const minute = { id: "minute-storage", at: "2026-09-12T12:00:00.000Z", kind: "minute.recorded" as const,
      sourceAssessmentEventId: "demo-event-06", learning: "Check the artifact, not the filename",
      applicabilityAndLimits: "This demonstration only", remainingUncertainty: "The real APK remains uninspected" };
    let raw = "";
    const history = [...illustrativeEvents, minute];
    saveLocalHistory({ setItem: (key, value) => {
      expect(key).toBe("nes.events.v1");
      raw = value;
    } }, history);
    expect(JSON.parse(raw).schemaVersion).toBe(1);
    const result = loadLocalHistory({ getItem: () => raw });
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.events).toEqual(history);
      expect(replayEvents(result.events).minutes).toMatchObject([{ sourceAssessmentEventId: "demo-event-06" }]);
    }
  });
});

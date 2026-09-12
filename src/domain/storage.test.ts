import { describe, expect, it } from "vitest";
import { loadLocalHistory, saveLocalHistory } from "./storage";
import { illustrativeEvents } from "./seed";

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
});

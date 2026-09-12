import { replayEvents } from "./engine";
import { illustrativeEvents } from "./seed";
import type { EngineeringEvent } from "./model";

const STORAGE_KEY = "nes.events.v1";

export type LoadResult =
  | { status: "ready"; events: EngineeringEvent[]; isIllustrative: boolean }
  | { status: "error"; message: string };

export const loadLocalHistory = (storage: Pick<Storage, "getItem">): LoadResult => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      replayEvents(illustrativeEvents);
      return { status: "ready", events: illustrativeEvents, isIllustrative: true };
    }
    const document: unknown = JSON.parse(raw);
    if (
      !document || typeof document !== "object" ||
      !("schemaVersion" in document) || document.schemaVersion !== 1 ||
      !("events" in document) || !Array.isArray(document.events)
    ) {
      throw new Error("The saved history has an unknown structure or version.");
    }
    const events = document.events as EngineeringEvent[];
    replayEvents(events);
    return { status: "ready", events, isIllustrative: false };
  } catch (error) {
    return {
      status: "error",
      message: `Saved local history could not be read safely. No records were overwritten. ${error instanceof Error ? error.message : "Unknown error."}`,
    };
  }
};

export const saveLocalHistory = (
  storage: Pick<Storage, "setItem">,
  events: EngineeringEvent[],
): void => {
  replayEvents(events);
  storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, events }));
};

export const serializeHistory = (events: EngineeringEvent[]): string =>
  JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), events }, null, 2);

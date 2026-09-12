import type {
  ClaimStatus,
  EngineeringEvent,
  EngineeringView,
  EventDraft,
  GateStatus,
  Id,
} from "./model";
import { emptyView } from "./model";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

const requireText = (value: string, label: string): void => {
  if (!value.trim()) throw new DomainError(`${label} is required.`);
};

const uniqueId = (view: EngineeringView, id: Id): void => {
  const allIds = [
    ...view.projects, ...view.sessions, ...view.gates, ...view.evidence,
    ...view.claims, ...view.decisions, ...view.repositoryStates,
    ...view.verificationRuns, ...view.constraints,
  ].map((record) => record.id);
  if (allIds.includes(id)) throw new DomainError(`Record ${id} already exists.`);
};

const projectExists = (view: EngineeringView, projectId: Id): void => {
  if (!view.projects.some((project) => project.id === projectId)) {
    throw new DomainError("Choose an existing project.");
  }
};

const evidenceForProject = (view: EngineeringView, projectId: Id, evidenceIds: Id[]): void => {
  if (new Set(evidenceIds).size !== evidenceIds.length) {
    throw new DomainError("Evidence references must be unique.");
  }
  for (const id of evidenceIds) {
    const evidence = view.evidence.find((item) => item.id === id);
    if (!evidence || evidence.projectId !== projectId) {
      throw new DomainError("Evidence must exist in the same project.");
    }
  }
};

const assertGateAssessment = (
  view: EngineeringView,
  projectId: Id,
  status: GateStatus,
  evidenceIds: Id[],
  conclusion: string,
): void => {
  evidenceForProject(view, projectId, evidenceIds);
  if (status === "PASS" && evidenceIds.length === 0) {
    throw new DomainError("A PASS gate requires supporting evidence.");
  }
  if (["PASS", "FAIL", "BLOCKED"].includes(status)) requireText(conclusion, "Conclusion");
};

const assertClaimAssessment = (
  view: EngineeringView,
  projectId: Id,
  status: ClaimStatus,
  evidenceIds: Id[],
): void => {
  evidenceForProject(view, projectId, evidenceIds);
  if (status === "PROVEN" && evidenceIds.length === 0) {
    throw new DomainError("A PROVEN claim requires supporting evidence.");
  }
};

const allowedGateTransitions: Record<GateStatus, GateStatus[]> = {
  NOT_STARTED: ["ACTIVE", "BLOCKED"],
  ACTIVE: ["PASS", "FAIL", "BLOCKED"],
  PASS: ["ACTIVE", "FAIL", "BLOCKED"],
  FAIL: ["ACTIVE", "BLOCKED"],
  BLOCKED: ["ACTIVE", "FAIL"],
};

// Replay makes the current view a projection of an append-only record.
// Earlier observations and assessments remain in the event list even when a
// later event changes the current status.
export const replayEvents = (events: EngineeringEvent[]): EngineeringView => {
  const view = emptyView();
  const eventIds = new Set<string>();

  for (const event of events) {
    if (!event.id || !event.at || eventIds.has(event.id)) {
      throw new DomainError("Event IDs and timestamps must exist and event IDs must be unique.");
    }
    eventIds.add(event.id);

    switch (event.kind) {
      case "project.created":
        uniqueId(view, event.value.id);
        requireText(event.value.name, "Project name");
        view.projects.push({ ...event.value });
        break;
      case "session.created":
        uniqueId(view, event.value.id);
        projectExists(view, event.value.projectId);
        requireText(event.value.objective, "Session objective");
        view.sessions.push({ ...event.value });
        break;
      case "gate.created": {
        uniqueId(view, event.value.id);
        const session = view.sessions.find((item) => item.id === event.value.sessionId);
        if (!session) throw new DomainError("Choose an existing session.");
        requireText(event.value.identifier, "Gate identifier");
        requireText(event.value.question, "Gate question");
        requireText(event.value.requiredEvidence, "Required gate evidence");
        if (view.gates.some((gate) => gate.sessionId === session.id && gate.identifier === event.value.identifier)) {
          throw new DomainError("Gate identifiers must be unique within a session.");
        }
        if (event.value.status !== "NOT_STARTED") {
          throw new DomainError("A new gate starts as NOT_STARTED; record a transition separately.");
        }
        view.gates.push({ ...event.value, evidenceIds: [] });
        break;
      }
      case "gate.transitioned": {
        const gate = view.gates.find((item) => item.id === event.gateId);
        if (!gate) throw new DomainError("Gate does not exist.");
        const session = view.sessions.find((item) => item.id === gate.sessionId);
        if (!session) throw new DomainError("Gate session does not exist.");
        if (!allowedGateTransitions[gate.status].includes(event.status)) {
          throw new DomainError(`Cannot move a gate from ${gate.status} to ${event.status}.`);
        }
        if (event.status === "ACTIVE" && view.gates.some((item) =>
          item.sessionId === gate.sessionId && item.id !== gate.id && item.status === "ACTIVE")) {
          throw new DomainError("Finish or block the current active gate before activating another in this session.");
        }
        assertGateAssessment(view, session.projectId, event.status, event.evidenceIds, event.conclusion);
        Object.assign(gate, {
          status: event.status,
          conclusion: event.conclusion,
          evidenceIds: [...event.evidenceIds],
          nextPermittedAction: event.nextPermittedAction,
        });
        break;
      }
      case "evidence.created":
        uniqueId(view, event.value.id);
        projectExists(view, event.value.projectId);
        requireText(event.value.description, "Evidence description");
        requireText(event.value.source, "Evidence source");
        view.evidence.push({ ...event.value });
        break;
      case "claim.created":
        uniqueId(view, event.value.id);
        projectExists(view, event.value.projectId);
        requireText(event.value.statement, "Claim statement");
        assertClaimAssessment(view, event.value.projectId, event.value.status, event.value.evidenceIds);
        view.claims.push({ ...event.value, evidenceIds: [...event.value.evidenceIds] });
        break;
      case "claim.assessed": {
        const claim = view.claims.find((item) => item.id === event.claimId);
        if (!claim) throw new DomainError("Claim does not exist.");
        if (claim.status === event.status && claim.limitations === event.limitations &&
          JSON.stringify(claim.evidenceIds) === JSON.stringify(event.evidenceIds)) {
          throw new DomainError("Record a changed assessment, not a duplicate.");
        }
        assertClaimAssessment(view, claim.projectId, event.status, event.evidenceIds);
        Object.assign(claim, {
          status: event.status,
          evidenceIds: [...event.evidenceIds],
          limitations: event.limitations,
        });
        break;
      }
      case "decision.created":
        uniqueId(view, event.value.id);
        projectExists(view, event.value.projectId);
        requireText(event.value.decision, "Decision");
        requireText(event.value.rationale, "Decision rationale");
        evidenceForProject(view, event.value.projectId, event.value.evidenceIds);
        view.decisions.push({ ...event.value, evidenceIds: [...event.value.evidenceIds] });
        break;
      case "repository.observed":
        uniqueId(view, event.value.id);
        projectExists(view, event.value.projectId);
        requireText(event.value.repository, "Repository");
        view.repositoryStates.push({ ...event.value, changedFiles: [...event.value.changedFiles] });
        break;
      case "verification.recorded":
        uniqueId(view, event.value.id);
        projectExists(view, event.value.projectId);
        requireText(event.value.command, "Verification command");
        evidenceForProject(view, event.value.projectId, event.value.evidenceIds);
        view.verificationRuns.push({ ...event.value, evidenceIds: [...event.value.evidenceIds] });
        break;
      case "constraint.created":
        uniqueId(view, event.value.id);
        projectExists(view, event.value.projectId);
        requireText(event.value.description, "Constraint");
        view.constraints.push({ ...event.value });
        break;
      case "constraint.set_active": {
        const constraint = view.constraints.find((item) => item.id === event.constraintId);
        if (!constraint) throw new DomainError("Constraint does not exist.");
        if (constraint.active === event.active) throw new DomainError("Constraint already has that state.");
        requireText(event.reason, "Reason for constraint change");
        constraint.active = event.active;
        break;
      }
      default:
        throw new DomainError("Unknown event kind; local history was not changed.");
    }
  }

  return view;
};

export const appendEvent = (events: EngineeringEvent[], event: EngineeringEvent): EngineeringEvent[] => {
  const next = [...events, event];
  replayEvents(next);
  return next;
};

export const makeEvent = (draft: EventDraft): EngineeringEvent => ({
  ...draft,
  id: crypto.randomUUID(),
  at: new Date().toISOString(),
}) as EngineeringEvent;

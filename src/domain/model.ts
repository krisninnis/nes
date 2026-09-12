export type Id = string;
export type IsoTimestamp = string;

export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETE";
export type SessionStatus = "ACTIVE" | "PAUSED" | "COMPLETE";
export type GateStatus = "NOT_STARTED" | "ACTIVE" | "PASS" | "FAIL" | "BLOCKED";
export type ClaimStatus = "PROVEN" | "PARTIALLY_PROVEN" | "UNPROVEN" | "DISPROVEN";
export type VerificationResult = "PASS" | "FAIL" | "BLOCKED" | "IN_PROGRESS";

export interface Project {
  id: Id;
  name: string;
  description: string;
  repository: string;
  status: ProjectStatus;
  illustrative: boolean;
}

export interface EngineeringSession {
  id: Id;
  projectId: Id;
  objective: string;
  startingState: string;
  constraints: string;
  prohibitedActions: string;
  startedAt: IsoTimestamp;
  status: SessionStatus;
}

export interface Gate {
  id: Id;
  sessionId: Id;
  identifier: string;
  question: string;
  rationale: string;
  requiredEvidence: string;
  status: GateStatus;
  conclusion: string;
  evidenceIds: Id[];
  nextPermittedAction: string;
}

export interface Evidence {
  id: Id;
  projectId: Id;
  type: string;
  description: string;
  raw: string;
  source: string;
  observedAt: IsoTimestamp;
  repositorySha: string;
  branch: string;
  commandOrCi: string;
}

export interface Claim {
  id: Id;
  projectId: Id;
  statement: string;
  status: ClaimStatus;
  evidenceIds: Id[];
  limitations: string;
}

export interface Decision {
  id: Id;
  projectId: Id;
  decision: string;
  evidenceIds: Id[];
  rationale: string;
  alternativesRejected: string;
  decidedAt: IsoTimestamp;
}

export interface RepositoryState {
  id: Id;
  projectId: Id;
  repository: string;
  branch: string;
  headSha: string;
  remoteSha: string;
  cleanliness: "CLEAN" | "DIRTY" | "UNKNOWN";
  changedFiles: string[];
  observedAt: IsoTimestamp;
}

export interface VerificationRun {
  id: Id;
  projectId: Id;
  command: string;
  codeSha: string;
  result: VerificationResult;
  checksPassed: string;
  checksFailed: string;
  evidenceIds: Id[];
  ranAt: IsoTimestamp;
}

export interface Constraint {
  id: Id;
  projectId: Id;
  description: string;
  reason: string;
  active: boolean;
}

type EventMeta = { id: Id; at: IsoTimestamp };

export type EngineeringEvent = EventMeta & (
  | { kind: "project.created"; value: Project }
  | { kind: "session.created"; value: EngineeringSession }
  | { kind: "gate.created"; value: Gate }
  | { kind: "gate.transitioned"; gateId: Id; status: GateStatus; conclusion: string; evidenceIds: Id[]; nextPermittedAction: string }
  | { kind: "evidence.created"; value: Evidence }
  | { kind: "claim.created"; value: Claim }
  | { kind: "claim.assessed"; claimId: Id; status: ClaimStatus; evidenceIds: Id[]; limitations: string }
  | { kind: "decision.created"; value: Decision }
  | { kind: "repository.observed"; value: RepositoryState }
  | { kind: "verification.recorded"; value: VerificationRun }
  | { kind: "constraint.created"; value: Constraint }
  | { kind: "constraint.set_active"; constraintId: Id; active: boolean; reason: string }
);

export type EventDraft = EngineeringEvent extends infer Event
  ? Event extends EngineeringEvent
    ? Omit<Event, "id" | "at">
    : never
  : never;

export interface EngineeringView {
  projects: Project[];
  sessions: EngineeringSession[];
  gates: Gate[];
  evidence: Evidence[];
  claims: Claim[];
  decisions: Decision[];
  repositoryStates: RepositoryState[];
  verificationRuns: VerificationRun[];
  constraints: Constraint[];
}

export const emptyView = (): EngineeringView => ({
  projects: [],
  sessions: [],
  gates: [],
  evidence: [],
  claims: [],
  decisions: [],
  repositoryStates: [],
  verificationRuns: [],
  constraints: [],
});

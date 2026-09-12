import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { appendEvent, makeEvent, replayEvents } from "../domain/engine";
import { loadLocalHistory, saveLocalHistory, serializeHistory } from "../domain/storage";
import type {
  ClaimStatus, Constraint, EngineeringEvent, EngineeringSession,
  EngineeringMinute, EventDraft, Evidence, Gate, GateStatus, Id, Project,
} from "../domain/model";

type GateAssessmentEvent = Extract<EngineeringEvent, { kind: "gate.transitioned" }>;

type Section =
  | "Overview" | "Projects" | "Sessions" | "Gates" | "Evidence"
  | "Claims" | "Decisions" | "Engineering Minutes" | "Verification" | "Repository"
  | "Constraints" | "History" | "NES Principles";

const navigation: { label: Section; marker: string }[] = [
  { label: "Overview", marker: "◈" },
  { label: "Projects", marker: "▦" },
  { label: "Sessions", marker: "◷" },
  { label: "Gates", marker: "◇" },
  { label: "Evidence", marker: "◫" },
  { label: "Claims", marker: "◎" },
  { label: "Decisions", marker: "⌁" },
  { label: "Engineering Minutes", marker: "✎" },
  { label: "Verification", marker: "✓" },
  { label: "Repository", marker: "⌘" },
  { label: "Constraints", marker: "⊘" },
  { label: "History", marker: "≡" },
  { label: "NES Principles", marker: "✧" },
];

const gateStatuses: GateStatus[] = ["NOT_STARTED", "ACTIVE", "PASS", "FAIL", "BLOCKED"];
const claimStatuses: ClaimStatus[] = ["UNPROVEN", "PARTIALLY_PROVEN", "PROVEN", "DISPROVEN"];
const read = (data: FormData, key: string): string => String(data.get(key) ?? "").trim();
const lines = (value: string): string[] => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const now = (): string => new Date().toISOString();
const freshId = (): Id => crypto.randomUUID();
const showDate = (value: string): string => value ? new Date(value).toLocaleString() : "Not recorded";

function Badge({ value }: { value: string }) {
  return <span className={`badge badge-${value.toLowerCase().replaceAll("_", "-")}`}>{value.replaceAll("_", " ")}</span>;
}

function Field({ label, name, required = false, placeholder = "", defaultValue = "", type = "text" }: {
  label: string; name: string; required?: boolean; placeholder?: string; defaultValue?: string; type?: string;
}) {
  return <label className="field"><span>{label}</span><input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} /></label>;
}

function Area({ label, name, required = false, placeholder = "", rows = 3, defaultValue = "" }: {
  label: string; name: string; required?: boolean; placeholder?: string; rows?: number; defaultValue?: string;
}) {
  return <label className="field"><span>{label}</span><textarea name={name} required={required} placeholder={placeholder} rows={rows} defaultValue={defaultValue} /></label>;
}

function SelectField({ label, name, options, defaultValue }: {
  label: string; name: string; options: string[]; defaultValue?: string;
}) {
  return <label className="field"><span>{label}</span><select name={name} defaultValue={defaultValue}>{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>;
}

function EvidencePicker({ evidence, selected = [] }: { evidence: Evidence[]; selected?: Id[] }) {
  return <fieldset className="evidence-picker"><legend>Supporting evidence</legend>
    {evidence.length ? evidence.map((item) => <label key={item.id}>
      <input type="checkbox" name="evidenceIds" value={item.id} defaultChecked={selected.includes(item.id)} />
      <span>{item.description}<small>{item.source}</small></span>
    </label>) : <p className="muted small">No evidence recorded yet. Add evidence before marking a gate PASS or a claim PROVEN.</p>}
  </fieldset>;
}

function Composer({ title, children, onSubmit, submitLabel = "Record entry" }: {
  title: string; children: ReactNode; onSubmit: (data: FormData) => void; submitLabel?: string;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
    // The app keeps the form visible on validation failure. Successful entries
    // are visible immediately in the record list above it.
  };
  return <form className="composer panel" onSubmit={submit}>
    <div className="composer-heading"><span className="eyebrow">NEW RECORD</span><h3>{title}</h3></div>
    {children}
    <button className="button button-primary" type="submit">{submitLabel}<span aria-hidden="true">↗</span></button>
  </form>;
}

function Empty({ text }: { text: string }) {
  return <div className="empty-state"><span className="empty-glyph">○</span><p>{text}</p></div>;
}

function Panel({ eyebrow, title, children, className = "" }: {
  eyebrow?: string; title?: string; children: ReactNode; className?: string;
}) {
  return <section className={`panel ${className}`}>{eyebrow && <span className="eyebrow">{eyebrow}</span>}{title && <h3>{title}</h3>}{children}</section>;
}

const initialHistory = (() => {
  try { return loadLocalHistory(window.localStorage); }
  catch { return { status: "error" as const, message: "Browser-local storage is unavailable. No evidence can be saved safely in this browser." }; }
})();

export function App() {
  const [events, setEvents] = useState<EngineeringEvent[]>(initialHistory.status === "ready" ? initialHistory.events : []);
  const [section, setSection] = useState<Section>("Overview");
  const [selectedProjectId, setSelectedProjectId] = useState<Id>(initialHistory.status === "ready" ? replayEvents(initialHistory.events).projects[0]?.id ?? "" : "");
  const [selectedAssessmentEventId, setSelectedAssessmentEventId] = useState<Id>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialHistory.status === "error" ? initialHistory.message : "");
  const view = useMemo(() => replayEvents(events), [events]);
  const project = view.projects.find((item) => item.id === selectedProjectId) ?? view.projects[0];
  const projectId = project?.id ?? "";
  const sessions = view.sessions.filter((item) => item.projectId === projectId);
  const gates = view.gates.filter((item) => sessions.some((session) => session.id === item.sessionId));
  const evidence = view.evidence.filter((item) => item.projectId === projectId);
  const claims = view.claims.filter((item) => item.projectId === projectId);
  const decisions = view.decisions.filter((item) => item.projectId === projectId);
  const constraints = view.constraints.filter((item) => item.projectId === projectId);
  const repositoryStates = view.repositoryStates.filter((item) => item.projectId === projectId);
  const verificationRuns = view.verificationRuns.filter((item) => item.projectId === projectId);
  const activeSession = [...sessions].reverse().find((item) => item.status === "ACTIVE") ?? sessions.at(-1);
  const activeGate = gates.find((item) => item.sessionId === activeSession?.id && item.status === "ACTIVE");
  const lastPassingGate = [...gates].reverse().find((item) => item.status === "PASS");
  const latestRepositoryState = repositoryStates.at(-1);
  const assessmentEvents = events.filter((item): item is GateAssessmentEvent => item.kind === "gate.transitioned");
  const eligibleAssessments = assessmentEvents.filter((item) =>
    ["PASS", "FAIL", "BLOCKED"].includes(item.status) && gates.some((gate) => gate.id === item.gateId));
  const selectedAssessment = eligibleAssessments.find((item) => item.id === selectedAssessmentEventId);
  const selectedAssessmentGate = gates.find((gate) => gate.id === selectedAssessment?.gateId);
  const minuteEntries = view.minutes.flatMap((minute) => {
    const source = eligibleAssessments.find((item) => item.id === minute.sourceAssessmentEventId);
    const gate = gates.find((item) => item.id === source?.gateId);
    return source && gate ? [{ minute, source, gate }] : [];
  });

  const commit = (draft: EventDraft): boolean => {
    try {
      const next = appendEvent(events, makeEvent(draft));
      saveLocalHistory(window.localStorage, next);
      setEvents(next);
      setMessage("Recorded locally. The earlier history remains intact.");
      setError("");
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The record could not be saved.");
      setMessage("");
      return false;
    }
  };

  const exportHistory = () => {
    const blob = new Blob([serializeHistory(events)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nes-evidence-history-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (initialHistory.status === "error") {
    return <main className="fatal"><div className="brand-mark">N</div><h1>Local history needs attention</h1><p>{initialHistory.message}</p><p>NES has not replaced or reset your existing browser data. Preserve a copy of the browser profile before attempting recovery.</p></main>;
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">N</div><div><strong>NES</strong><span>ENGINEERING SYSTEM</span></div></div>
      <div className="sidebar-divider" />
      <span className="nav-heading">WORKSPACE</span>
      <nav aria-label="Main navigation">{navigation.map(({ label, marker }) =>
        <button key={label} className={`nav-item ${section === label ? "selected" : ""}`} onClick={() => setSection(label)}>
          <span className="nav-marker">{marker}</span>{label}
        </button>)}</nav>
      <div className="sidebar-footer"><span className="live-dot" /> LOCAL FIRST · V1<br /><small>No integrations. Humans decide.</small></div>
    </aside>

    <div className="workspace">
      <header className="topbar">
        <div className="breadcrumbs">NINNIS ENGINEERING SYSTEM <span>/</span> {section.toUpperCase()}</div>
        <div className="topbar-actions">
          <label className="project-switch"><span>PROJECT</span><select aria-label="Active project" value={projectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
            {view.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          <button className="button button-outline export" onClick={exportHistory}>↓ Export history</button>
        </div>
      </header>

      <main className="content">
        <div className="page-heading">
          <div><span className="eyebrow">EVIDENCE BEFORE CONCLUSION</span><h1>{section}</h1>
            <p>{section === "Overview" ? "An honest operating picture of what is known, what is not, and what may happen next." : sectionIntro[section]}</p>
          </div>
          {project?.illustrative && <span className="demo-tag">ILLUSTRATIVE DATA</span>}
        </div>

        {error && <div className="notice notice-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
        {message && <div className="notice notice-success" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss notice">×</button></div>}

        {section === "Overview" && <Overview project={project} activeSession={activeSession} activeGate={activeGate} gates={gates} lastPassingGate={lastPassingGate} constraints={constraints} claims={claims} evidence={evidence} repositoryState={latestRepositoryState} onNavigate={setSection} />}

        {section === "Projects" && <div className="section-stack">
          <div className="record-grid">{view.projects.map((item) => <Panel key={item.id} eyebrow={item.illustrative ? "ILLUSTRATIVE PROJECT" : "PROJECT"} title={item.name}>
            <p>{item.description}</p><p className="record-meta">{item.repository || "Repository not recorded"}</p><Badge value={item.status} />
            <button className="text-button" onClick={() => { setSelectedProjectId(item.id); setSection("Overview"); }}>Open project →</button>
          </Panel>)}</div>
          <Composer title="Create project" onSubmit={(data) => {
            const id = freshId();
            if (commit({ kind: "project.created", value: { id, name: read(data, "name"), description: read(data, "description"), repository: read(data, "repository"), status: "ACTIVE", illustrative: false } })) setSelectedProjectId(id);
          }}>
            <Field label="Project name" name="name" required placeholder="e.g. Acceptance APK signing" />
            <Area label="Description" name="description" placeholder="Purpose and boundaries" />
            <Field label="Repository or location (optional)" name="repository" placeholder="Exact path or URL if known" />
          </Composer>
        </div>}

        {section === "Sessions" && <div className="section-stack">
          {sessions.length ? sessions.map((item) => <Panel key={item.id} eyebrow={`STARTED ${showDate(item.startedAt)}`} title={item.objective}>
            <Badge value={item.status} /><div className="detail-grid"><Detail label="Starting state" value={item.startingState} /><Detail label="Constraints" value={item.constraints} /><Detail label="Prohibited actions" value={item.prohibitedActions} /></div>
          </Panel>) : <Empty text="No engineering session for this project yet." />}
          {project && <Composer title="Start engineering session" onSubmit={(data) => commit({ kind: "session.created", value: {
            id: freshId(), projectId, objective: read(data, "objective"), startingState: read(data, "startingState"),
            constraints: read(data, "constraints"), prohibitedActions: read(data, "prohibitedActions"), startedAt: now(), status: "ACTIVE",
          } })}>
            <Field label="Objective" name="objective" required placeholder="What are we trying to prove?" />
            <Area label="Starting state" name="startingState" required placeholder="Observed facts, exact identity, and unknowns" />
            <Area label="Constraints" name="constraints" placeholder="What must remain true?" />
            <Area label="Prohibited actions" name="prohibitedActions" placeholder="What are we not allowed to change?" />
          </Composer>}
        </div>}

        {section === "Gates" && <div className="section-stack">
          {gates.length ? gates.map((gate) => {
            const gateEvidence = gate.evidenceIds.map((id) => evidence.find((item) => item.id === id)).filter((item): item is Evidence => Boolean(item));
            return <Panel key={gate.id} eyebrow={`HYPOTHESIS / ${sessions.find((item) => item.id === gate.sessionId)?.objective.slice(0, 50) ?? "SESSION"}`} title={`${gate.identifier} · ${gate.question}`} className="gate-panel">
              <div className="gate-top"><Badge value={gate.status} /><span className="gate-id">{gate.identifier}</span></div>
              <div className="detail-grid"><Detail label="Rationale" value={gate.rationale} /><Detail label="Required evidence" value={gate.requiredEvidence} /><Detail label="Current conclusion" value={gate.conclusion} /><Detail label="Next permitted action" value={gate.nextPermittedAction} /></div>
              <EvidenceRefs items={gateEvidence} />
              <details className="inline-action"><summary>Record a new gate assessment</summary>
                <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); commit({ kind: "gate.transitioned", gateId: gate.id, status: read(data, "status") as GateStatus, conclusion: read(data, "conclusion"), evidenceIds: data.getAll("evidenceIds").map(String), nextPermittedAction: read(data, "nextPermittedAction") }); }}>
                  <SelectField label="New status" name="status" options={gateStatuses} defaultValue={gate.status === "NOT_STARTED" ? "ACTIVE" : gate.status === "ACTIVE" ? "PASS" : "ACTIVE"} />
                  <Area label="Conclusion / reason" name="conclusion" placeholder="Separate what was observed from what you conclude" />
                  <EvidencePicker evidence={evidence} selected={gate.evidenceIds} />
                  <Area label="Next permitted action" name="nextPermittedAction" defaultValue={gate.nextPermittedAction} />
                  <button className="button button-primary" type="submit">Record assessment</button>
                </form>
              </details>
            </Panel>;
          }) : <Empty text="No hypothesis has been recorded for this project." />}
          {sessions.length > 0 && <Composer title="Define next gate" onSubmit={(data) => commit({ kind: "gate.created", value: {
            id: freshId(), sessionId: read(data, "sessionId"), identifier: read(data, "identifier"), question: read(data, "question"),
            rationale: read(data, "rationale"), requiredEvidence: read(data, "requiredEvidence"),
            status: "NOT_STARTED", conclusion: "", evidenceIds: [], nextPermittedAction: read(data, "nextPermittedAction"),
          } })}>
            <label className="field"><span>Session</span><select name="sessionId">{sessions.map((item) => <option value={item.id} key={item.id}>{item.objective}</option>)}</select></label>
            <Field label="Identifier" name="identifier" required placeholder="H3" />
            <Field label="Question being tested" name="question" required placeholder="Can we prove...?" />
            <Area label="Rationale" name="rationale" />
            <Area label="Required evidence" name="requiredEvidence" required placeholder="Exact result needed for PASS" />
            <Area label="Next permitted action" name="nextPermittedAction" placeholder="Smallest useful test" />
          </Composer>}
        </div>}

        {section === "Evidence" && <div className="section-stack">
          {evidence.length ? [...evidence].reverse().map((item) => <Panel key={item.id} eyebrow={`${item.type.toUpperCase()} / ${showDate(item.observedAt)}`} title={item.description}>
            <p className="quote">{item.raw || "No raw quotation recorded."}</p>
            <div className="detail-grid"><Detail label="Source" value={item.source} /><Detail label="Repository SHA" value={item.repositorySha} /><Detail label="Branch" value={item.branch} /><Detail label="Command / CI" value={item.commandOrCi} /></div>
          </Panel>) : <Empty text="No evidence recorded. A gate cannot PASS and a claim cannot be PROVEN without it." />}
          {project && <Composer title="Record observation" onSubmit={(data) => commit({ kind: "evidence.created", value: {
            id: freshId(), projectId, type: read(data, "type"), description: read(data, "description"), raw: read(data, "raw"),
            source: read(data, "source"), observedAt: now(), repositorySha: read(data, "repositorySha"),
            branch: read(data, "branch"), commandOrCi: read(data, "commandOrCi"),
          } })}>
            <Field label="Evidence type" name="type" required placeholder="Command output, CI run, recording..." />
            <Field label="Description" name="description" required placeholder="What was actually observed?" />
            <Area label="Raw or quoted evidence" name="raw" rows={5} placeholder="Preserve exact output where appropriate" />
            <Field label="Source" name="source" required placeholder="Where did this come from?" />
            <div className="form-grid"><Field label="Exact repository SHA" name="repositorySha" /><Field label="Branch" name="branch" /></div>
            <Field label="Command / test / CI identifier" name="commandOrCi" />
          </Composer>}
        </div>}

        {section === "Claims" && <div className="section-stack">
          {claims.length ? claims.map((claim) => <Panel key={claim.id} eyebrow="ENGINEERING CLAIM" title={claim.statement}>
            <Badge value={claim.status} /><div className="detail-grid"><Detail label="Limitations" value={claim.limitations} /></div>
            <EvidenceRefs items={claim.evidenceIds.map((id) => evidence.find((item) => item.id === id)).filter((item): item is Evidence => Boolean(item))} />
            <details className="inline-action"><summary>Record a new claim assessment</summary><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); commit({ kind: "claim.assessed", claimId: claim.id, status: read(data, "status") as ClaimStatus, evidenceIds: data.getAll("evidenceIds").map(String), limitations: read(data, "limitations") }); }}>
              <SelectField label="Assessment" name="status" options={claimStatuses} defaultValue={claim.status} />
              <EvidencePicker evidence={evidence} selected={claim.evidenceIds} />
              <Area label="Limitations / what remains unproven" name="limitations" defaultValue={claim.limitations} />
              <button className="button button-primary" type="submit">Record assessment</button>
            </form></details>
          </Panel>) : <Empty text="No claims recorded. Keep assertions separate from observations." />}
          {project && <Composer title="State a claim" onSubmit={(data) => commit({ kind: "claim.created", value: {
            id: freshId(), projectId, statement: read(data, "statement"), status: read(data, "status") as ClaimStatus,
            evidenceIds: data.getAll("evidenceIds").map(String), limitations: read(data, "limitations"),
          } })}>
            <Field label="Claim statement" name="statement" required placeholder="What are we asserting?" />
            <SelectField label="Current proof status" name="status" options={claimStatuses} defaultValue="UNPROVEN" />
            <EvidencePicker evidence={evidence} />
            <Area label="Limitations" name="limitations" required placeholder="What does this evidence not establish?" />
          </Composer>}
        </div>}

        {section === "Decisions" && <div className="section-stack">
          {decisions.length ? [...decisions].reverse().map((item) => <Panel key={item.id} eyebrow={`DECISION / ${showDate(item.decidedAt)}`} title={item.decision}>
            <div className="detail-grid"><Detail label="Rationale" value={item.rationale} /><Detail label="Alternatives rejected" value={item.alternativesRejected} /></div>
            <EvidenceRefs items={item.evidenceIds.map((id) => evidence.find((entry) => entry.id === id)).filter((entry): entry is Evidence => Boolean(entry))} />
          </Panel>) : <Empty text="No decisions recorded. Human judgement should remain auditable." />}
          {project && <Composer title="Record human decision" onSubmit={(data) => commit({ kind: "decision.created", value: {
            id: freshId(), projectId, decision: read(data, "decision"), rationale: read(data, "rationale"),
            alternativesRejected: read(data, "alternativesRejected"), evidenceIds: data.getAll("evidenceIds").map(String), decidedAt: now(),
          } })}>
            <Field label="Decision" name="decision" required />
            <Area label="Rationale" name="rationale" required />
            <Area label="Alternatives rejected" name="alternativesRejected" />
            <EvidencePicker evidence={evidence} />
          </Composer>}
        </div>}

        {section === "Engineering Minutes" && <div className="section-stack">
          <Panel eyebrow="EVIDENCE → ASSESSMENT → LEARNING" title="A historical reflection, not a new proof claim">
            <p>Each Minute is recorded by a human against one exact PASS, FAIL, or BLOCKED gate assessment. NES preserves the original reason and evidence count; it cannot decide whether the lesson follows or transfers elsewhere.</p>
          </Panel>
          {minuteEntries.length ? [...minuteEntries].reverse().map(({ minute, source, gate }) =>
            <MinuteRecord key={minute.id} minute={minute} source={source} gate={gate}
              latest={[...assessmentEvents].reverse().find((item) => item.gateId === gate.id)} evidence={evidence} />)
            : <Empty text="No Engineering Minutes recorded for this project. A Minute is a human reflection on a historical assessment, not evidence or a principle." />}
          {eligibleAssessments.length > 0 && <Composer title="Record Engineering Minute" submitLabel="Record Minute" onSubmit={(data) => {
            if (commit({ kind: "minute.recorded", sourceAssessmentEventId: read(data, "sourceAssessmentEventId"),
              learning: read(data, "learning"), applicabilityAndLimits: read(data, "applicabilityAndLimits"),
              remainingUncertainty: read(data, "remainingUncertainty") })) setSelectedAssessmentEventId("");
          }}>
            <label className="field"><span>Historical gate assessment</span>
              <select name="sourceAssessmentEventId" required value={selectedAssessment?.id ?? ""} onChange={(event) => setSelectedAssessmentEventId(event.target.value)}>
                <option value="">Choose a PASS, FAIL, or BLOCKED assessment</option>
                {eligibleAssessments.map((item) => <option key={item.id} value={item.id}>
                  {gates.find((gate) => gate.id === item.gateId)?.identifier} · {item.status} · {showDate(item.at)} · {item.evidenceIds.length} evidence references
                </option>)}
              </select>
            </label>
            {selectedAssessment && selectedAssessmentGate && <div className="minute-source">
              <span className="eyebrow">SOURCE ASSESSMENT · {selectedAssessment.id}</span>
              <h4>{selectedAssessmentGate.identifier} · {selectedAssessmentGate.question}</h4>
              <Badge value={selectedAssessment.status} />
              <p>{selectedAssessment.conclusion}</p>
              <p className="minute-count">{selectedAssessment.evidenceIds.length} evidence references</p>
              {selectedAssessment.evidenceIds.length === 0 && <p className="minute-caution">No evidence was cited. The assessment reason is a human record, not independent proof of the hypothesis or the blockage.</p>}
            </div>}
            <Area label="What did you learn from this assessment?" name="learning" required placeholder="Keep the lesson tied to the recorded assessment, not a reconstructed memory." />
            <Area label="Where may it apply, and what are its limits?" name="applicabilityAndLimits" required placeholder="Project-specific is a valid scope; do not claim a universal rule." />
            <Area label="What remains uncertain?" name="remainingUncertainty" required placeholder="State what this assessment did not establish." />
          </Composer>}
        </div>}

        {section === "Verification" && <div className="section-stack">
          {verificationRuns.length ? [...verificationRuns].reverse().map((item) => <Panel key={item.id} eyebrow={`RUN / ${showDate(item.ranAt)}`} title={item.command}>
            <Badge value={item.result} /><div className="detail-grid"><Detail label="Exact code SHA" value={item.codeSha} /><Detail label="Passed" value={item.checksPassed} /><Detail label="Failed" value={item.checksFailed} /></div>
            <EvidenceRefs items={item.evidenceIds.map((id) => evidence.find((entry) => entry.id === id)).filter((entry): entry is Evidence => Boolean(entry))} />
          </Panel>) : <Empty text="No verification run recorded. Never infer a pass from an unrun command." />}
          {project && <Composer title="Record verification run" onSubmit={(data) => commit({ kind: "verification.recorded", value: {
            id: freshId(), projectId, command: read(data, "command"), codeSha: read(data, "codeSha"),
            result: read(data, "result") as "PASS" | "FAIL" | "BLOCKED" | "IN_PROGRESS",
            checksPassed: read(data, "checksPassed"), checksFailed: read(data, "checksFailed"),
            evidenceIds: data.getAll("evidenceIds").map(String), ranAt: now(),
          } })}>
            <Field label="Command or workflow" name="command" required />
            <Field label="Exact code SHA" name="codeSha" placeholder="Leave blank if not known; do not guess" />
            <SelectField label="Observed result" name="result" options={["IN_PROGRESS", "PASS", "FAIL", "BLOCKED"]} />
            <div className="form-grid"><Area label="Checks passed" name="checksPassed" /><Area label="Checks failed" name="checksFailed" /></div>
            <EvidencePicker evidence={evidence} />
          </Composer>}
        </div>}

        {section === "Repository" && <div className="section-stack">
          {repositoryStates.length ? [...repositoryStates].reverse().map((item) => <Panel key={item.id} eyebrow={`OBSERVED / ${showDate(item.observedAt)}`} title={item.repository}>
            <Badge value={item.cleanliness} /><div className="detail-grid"><Detail label="Branch" value={item.branch} /><Detail label="Exact HEAD" value={item.headSha} /><Detail label="Remote SHA" value={item.remoteSha} /><Detail label="Changed files" value={item.changedFiles.join("\n")} /></div>
          </Panel>) : <Empty text="Repository identity has not been observed for this project." />}
          {project && <Composer title="Record repository state" onSubmit={(data) => commit({ kind: "repository.observed", value: {
            id: freshId(), projectId, repository: read(data, "repository"), branch: read(data, "branch"),
            headSha: read(data, "headSha"), remoteSha: read(data, "remoteSha"),
            cleanliness: read(data, "cleanliness") as "CLEAN" | "DIRTY" | "UNKNOWN",
            changedFiles: lines(read(data, "changedFiles")), observedAt: now(),
          } })}>
            <Field label="Repository or location" name="repository" required defaultValue={project.repository} />
            <Field label="Branch" name="branch" placeholder="Exact observed branch" />
            <div className="form-grid"><Field label="Exact HEAD SHA" name="headSha" /><Field label="Remote SHA (if known)" name="remoteSha" /></div>
            <SelectField label="Worktree" name="cleanliness" options={["UNKNOWN", "CLEAN", "DIRTY"]} />
            <Area label="Changed files · one per line" name="changedFiles" />
          </Composer>}
        </div>}

        {section === "Constraints" && <div className="section-stack">
          {constraints.length ? constraints.map((item) => <Panel key={item.id} eyebrow={item.active ? "ACTIVE STOP CONDITION" : "INACTIVE CONSTRAINT"} title={item.description}>
            <p>{item.reason}</p><Badge value={item.active ? "ACTIVE" : "INACTIVE"} />
            <details className="inline-action"><summary>{item.active ? "Deactivate" : "Reactivate"} with reason</summary><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); commit({ kind: "constraint.set_active", constraintId: item.id, active: !item.active, reason: read(data, "reason") }); }}>
              <Area label="Reason for change" name="reason" required />
              <button className="button button-primary" type="submit">Record constraint change</button>
            </form></details>
          </Panel>) : <Empty text="No explicit constraints recorded for this project." />}
          {project && <Composer title="Add stop condition / constraint" onSubmit={(data) => commit({ kind: "constraint.created", value: {
            id: freshId(), projectId, description: read(data, "description"), reason: read(data, "reason"), active: true,
          } })}>
            <Field label="Prohibited action or stop condition" name="description" required />
            <Area label="Reason" name="reason" required />
          </Composer>}
        </div>}

        {section === "History" && <div className="section-stack">
          <Panel eyebrow="APPEND-ONLY LOCAL RECORD" title={`${events.length} events preserved`}>
            <p>New assessments supersede current status; they do not remove prior evidence, conclusions, or decisions. Export JSON regularly for a durable copy.</p>
          </Panel>
          {[...events].reverse().map((item, index) => <details className="history-event panel" key={item.id}>
            <summary><span className="history-index">{String(events.length - index).padStart(3, "0")}</span><strong>{item.kind.replaceAll(".", " / ").toUpperCase()}</strong><time>{showDate(item.at)}</time></summary>
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </details>)}
        </div>}

        {section === "NES Principles" && <Principles />}
      </main>
    </div>
  </div>;
}

const sectionIntro: Record<Section, string> = {
  Overview: "",
  Projects: "Keep each investigation anchored to a specific project and location.",
  Sessions: "State the objective, initial truth, constraints, and prohibited actions before work begins.",
  Gates: "Test one explicit hypothesis at a time; record evidence before declaring PASS.",
  Evidence: "Preserve observations, sources, exact identities, and quotations without silently rewriting them.",
  Claims: "Separate what is asserted from what evidence actually proves.",
  Decisions: "Record human choices, rationale, rejected alternatives, and the evidence considered.",
  "Engineering Minutes": "Preserve what the engineer learned from an exact historical gate assessment, with limits and uncertainty.",
  Verification: "Bind test and workflow results to exact code identity wherever known.",
  Repository: "Capture branch, HEAD, remote identity, and dirty state as observed facts.",
  Constraints: "Make stop conditions visible before the next action is taken.",
  History: "An inspectable local record of observations and changing understanding.",
  "NES Principles": "The rules that govern engineering judgement in this system.",
};

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail"><span>{label}</span><p>{value || "Not recorded"}</p></div>;
}

function EvidenceRefs({ items }: { items: Evidence[] }) {
  return <div className="evidence-refs"><span className="eyebrow">EVIDENCE REFERENCES</span>
    {items.length ? items.map((item) => <span key={item.id} className="evidence-ref">◫ {item.description}</span>) : <span className="muted small">None recorded</span>}
  </div>;
}

function MinuteRecord({ minute, source, gate, latest, evidence }: {
  minute: EngineeringMinute; source: GateAssessmentEvent; gate: Gate;
  latest?: GateAssessmentEvent; evidence: Evidence[];
}) {
  const reassessed = latest?.id !== source.id;
  return <Panel eyebrow={`HUMAN-RECORDED MINUTE / ${showDate(minute.at)}`} title={minute.learning}>
    <div className="gate-top"><Badge value={source.status} /><span className="gate-id">{gate.identifier} · {gate.question}</span></div>
    {reassessed && <p className="minute-caution" role="status">Historical assessment: this gate has since been reassessed. Current gate state: {gate.status}. This Minute remains attached to its original source, not the current conclusion.</p>}
    <div className="detail-grid">
      <Detail label="Historical source conclusion" value={source.conclusion} />
      <Detail label="Applicability and limits" value={minute.applicabilityAndLimits} />
      <Detail label="Remaining uncertainty" value={minute.remainingUncertainty} />
      <Detail label="Source assessment event" value={`${source.id} · ${showDate(source.at)}`} />
    </div>
    <p className="minute-count">{source.evidenceIds.length} evidence references</p>
    {source.evidenceIds.length === 0 && <p className="minute-caution">No evidence was cited by this assessment. Its recorded reason is not independent proof that the hypothesis is false or that the blockage is objectively established.</p>}
    <EvidenceRefs items={source.evidenceIds.map((id) => evidence.find((item) => item.id === id)).filter((item): item is Evidence => Boolean(item))} />
    <p className="muted small">NES records this reflection; it does not authenticate evidence, certify the lesson, or promote it to a principle.</p>
  </Panel>;
}

function Overview({ project, activeSession, activeGate, gates, lastPassingGate, constraints, claims, evidence, repositoryState, onNavigate }: {
  project?: Project; activeSession?: EngineeringSession; activeGate?: Gate; gates: Gate[]; lastPassingGate?: Gate;
  constraints: Constraint[]; claims: { id: string; statement: string; status: ClaimStatus }[];
  evidence: Evidence[]; repositoryState?: { headSha: string; branch: string; cleanliness: string };
  onNavigate: (section: Section) => void;
}) {
  const activeConstraints = constraints.filter((item) => item.active);
  const proven = claims.filter((item) => item.status === "PROVEN");
  const unproven = claims.filter((item) => item.status === "UNPROVEN" || item.status === "PARTIALLY_PROVEN");
  const blockers = [
    ...activeConstraints,
    ...gates.filter((item) => item.status === "BLOCKED"),
  ];
  return <div className="overview">
    <section className="hero panel">
      <div><span className="eyebrow">CURRENT ENGINEERING POSITION</span><h2>{project?.name ?? "No active project"}</h2>
        <p>{activeSession?.objective ?? "Create a project and engineering session to begin."}</p>
        <div className="hero-tags">{project?.illustrative && <span>ILLUSTRATIVE CASE</span>}<span>{repositoryState?.branch || "BRANCH UNKNOWN"}</span><span>{repositoryState?.headSha ? `HEAD ${repositoryState.headSha.slice(0, 12)}` : "HEAD UNRECORDED"}</span></div>
      </div>
      <div className="hero-symbol" aria-hidden="true"><span>H</span><i>→</i><span>E</span><i>→</i><span>C</span></div>
    </section>

    <div className="question-grid">
      <Panel eyebrow="01 / HYPOTHESIS" title="What are we trying to prove?" className="question-card accent-cyan">
        <p>{activeGate ? <><strong>{activeGate.identifier}</strong> · {activeGate.question}</> : "No active gate. Define the next hypothesis."}</p>
        {activeGate && <Badge value={activeGate.status} />}
        <button className="text-button" onClick={() => onNavigate("Gates")}>View gates →</button>
      </Panel>
      <Panel eyebrow="02 / OBSERVATION" title="What do we actually know?" className="question-card accent-green">
        <p>{lastPassingGate ? <><strong>{lastPassingGate.identifier} passed.</strong> {lastPassingGate.conclusion}</> : "No currently passing gate has been recorded."}</p>
        {lastPassingGate && <EvidenceRefs items={lastPassingGate.evidenceIds.map((id) => evidence.find((item) => item.id === id)).filter((item): item is Evidence => Boolean(item))} />}
        {proven.length > 0 && <ul className="compact-list">{proven.slice(0, 3).map((item) => <li key={item.id}>{item.statement}</li>)}</ul>}
        <span className="quiet-count">{evidence.length} evidence record{evidence.length === 1 ? "" : "s"}</span>
        <button className="text-button" onClick={() => onNavigate("Evidence")}>Inspect evidence →</button>
      </Panel>
      <Panel eyebrow="03 / UNCERTAINTY" title="What remains unproven?" className="question-card accent-amber">
        {unproven.length ? <ul className="compact-list">{unproven.slice(0, 3).map((item) => <li key={item.id}>{item.statement}</li>)}</ul> : <p>No unproven claim is recorded. This is not proof of completeness.</p>}
        <button className="text-button" onClick={() => onNavigate("Claims")}>Review claims →</button>
      </Panel>
    </div>

    <div className="overview-lower">
      <Panel eyebrow="NEXT PERMITTED ACTION" title={activeGate?.nextPermittedAction || "Not yet specified"} className="next-action">
        <p>{activeGate ? `From ${activeGate.identifier}. Advance only when its required evidence is established.` : "Define an active gate and its smallest useful test."}</p>
        <button className="button button-primary" onClick={() => onNavigate("Gates")}>Open active gate <span>↗</span></button>
      </Panel>
      <Panel eyebrow="BOUNDARIES" title="What are we not allowed to change?" className="constraints-panel">
        {activeConstraints.length ? <ul className="constraint-list">{activeConstraints.map((item) => <li key={item.id}><span>⊘</span>{item.description}</li>)}</ul> : <p className="muted">No active constraints recorded. Check the session before proceeding.</p>}
        {gates.filter((item) => item.status === "BLOCKED").map((item) => <p key={item.id}><strong>{item.identifier} blocked:</strong> {item.conclusion}</p>)}
        <button className="text-button" onClick={() => onNavigate("Constraints")}>View constraints →</button>
      </Panel>
    </div>

    <div className="metric-row">
      <button onClick={() => onNavigate("Gates")}><strong>{lastPassingGate?.identifier ?? "—"}</strong><span>LAST CURRENT PASS GATE</span></button>
      <button onClick={() => onNavigate("Claims")}><strong>{proven.length}</strong><span>PROVEN CLAIMS</span></button>
      <button onClick={() => onNavigate("Constraints")}><strong>{blockers.length}</strong><span>ACTIVE BLOCKERS / CONSTRAINTS</span></button>
      <button onClick={() => onNavigate("Repository")}><strong>{repositoryState?.cleanliness ?? "UNKNOWN"}</strong><span>REPOSITORY STATE</span></button>
    </div>
  </div>;
}

const principles = [
  ["01", "Establish state before changing state", "Record the branch, exact SHA, worktree, and constraints first."],
  ["02", "Separate observation from conclusion", "An observation is not a proof claim by itself."],
  ["03", "Test one hypothesis at a time", "Use explicit gates and the smallest useful test."],
  ["04", "Preserve evidence and provenance", "Retain raw results, sources, timestamps, and exact artefact identities."],
  ["05", "Fail closed where proof is required", "Missing evidence cannot produce PASS or PROVEN."],
  ["06", "Never upgrade an unproven claim", "Limit conclusions to what verification actually establishes."],
  ["07", "Protect unrelated work", "Record prohibited actions and guard dirty worktrees."],
  ["08", "Advance one gate at a time", "A next action is permission, not an automated decision."],
  ["09", "Preserve changed understanding", "A later failure does not erase the earlier event or evidence."],
];

function Principles() {
  return <div className="principles-grid">{principles.map(([number, title, description]) => <Panel key={number} eyebrow={`PRINCIPLE ${number}`} title={title}><p>{description}</p></Panel>)}
    <Panel eyebrow="GOVERNING BOUNDARY" title="Humans decide. NES records."><p>NES does not execute repository commands, contact external systems, or make consequential engineering decisions on your behalf.</p></Panel>
  </div>;
}

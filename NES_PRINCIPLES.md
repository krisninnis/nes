# NES governing principles

NES is an evidence-driven engineering operating system, not a generic project tracker. Its purpose is to help a human engineer establish truth, preserve provenance, isolate variables, test hypotheses completely, and advance only when evidence permits it.

1. **Establish state before changing state.** Record the project, branch, exact repository or artefact identity, dirty work, and constraints first.
2. **Separate observation from conclusion.** Preserve what was actually seen or run before interpreting it.
3. **Work through explicit hypotheses and gates.** Give each question a testable H1, H2, H3… gate and required evidence.
4. **Test the smallest useful hypothesis first.** Prefer a narrow test that can settle the next uncertainty.
5. **Preserve evidence and provenance.** Keep raw or quoted observations, sources, timestamps, commands, CI identifiers, and exact code identities where relevant.
6. **Fail closed where proof is required.** Missing or ambiguous proof is not a passing result.
7. **Never upgrade an unproven claim into a proven one.** Show limitations and distinguish partial proof from complete proof.
8. **Record exact repository and artefact identity.** A result from one SHA does not automatically prove another SHA or artefact.
9. **Protect unrelated work.** Make prohibited actions and dirty worktrees explicit; do not silently disturb them.
10. **Match verification strength to the claim.** A test result may support only the proposition it actually tests.
11. **Advance one gate at a time.** A next permitted action is a human-governed boundary, not permission for NES to act autonomously.
12. **Preserve an auditable history.** Later failures or better evidence can change current understanding without erasing earlier decisions, observations, or conclusions.

Humans remain responsible for consequential engineering decisions. NES records and explains the evidence trail; it does not automatically merge, deploy, modify a repository, or contact external systems.

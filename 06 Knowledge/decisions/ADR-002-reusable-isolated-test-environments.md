# ADR-002: Reusable isolated test environments for NES

Status: Accepted direction, implementation pending
Recorded: 2026-10-08
Origin: NinFit Android GPS ownership verification, EU-K / EU-L gates

## Context

NinFit's Android production and instrumentation code compiled and its host contracts passed, but Android runtime behaviour remained unverified. EU-L1 stopped safely because the development machine had no Android Virtual Devices (AVDs) or SDK system images. The preserved Samsung Galaxy A14 contains valuable historical Journey evidence and must not be used as an expendable test target.

## Decision

NES should treat isolated, disposable test environments as a **reusable engineering capability**, not embed an Android emulator into the NES application itself. NES should eventually orchestrate environment selection, identity checks, safe provisioning, test execution, evidence capture and retirement through adapters to existing tooling.

Start with a dedicated Android emulator for NinFit, then extract the proven contracts into NES. Later consider browser test environments, language runtimes, containers and physical-device field verification.

## Minimum reusable contract

1. **Environment identity:** explicit toolchain, platform/API version, image, AVD or runner identity, and relevant hashes.
2. **Isolation:** no real user data, personal credentials, copied production databases or implicit physical-device selection.
3. **Bounded provisioning:** separate authorisation for SDK/image installation and AVD creation; separate gates for launching, app installation and test execution.
4. **Explicit targeting:** device-specific commands; never use an unqualified ADB operation where a valuable physical device may be present.
5. **Evidence:** record exact commands, test results, logs, environment details, failure classification and reproducibility information.
6. **Truthful proof levels:** compilation, host tests, emulator instrumentation and real-device field evidence are distinct. Emulated GPS/sensors cannot establish real outdoor GPS accuracy, physical step-sensor behaviour or representative battery usage.
7. **Cleanup:** safe teardown and disposal of only the verified test environment, preserving unrelated resources.
8. **Learning:** promote lessons from project-specific findings only when supported; retain limits and reconsideration conditions.

## First implementation path

- **EU-L0:** provision one dedicated disposable Android API 31+ emulator; no app installation or instrumentation execution in this gate.
- **EU-L1:** run scoped Android instrumentation on the verified emulator, with no Samsung access.
- **After evidence:** extract a small NES test-environment adapter/contract from what actually worked, rather than building a large testing platform prematurely.
- **Later:** retain real physical-device tests for sensor fidelity, GPS conditions and battery measurements.

## Alternatives considered

- **Build an emulator into NES:** rejected; existing Android emulator tooling should provide the runtime, while NES provides orchestration and evidence.
- **Use the Samsung immediately:** rejected for these gates because historical Journey data is valuable and Android runtime checks can first be isolated.
- **Rely on host tests only:** insufficient to prove Android framework lifecycle and callback behaviour.

## Evidence and limits

User-reported sealed evidence:
- NinFit EU-K-I1-R2: production/instrumentation compilation GREEN; native contracts 19/19, adjacent 18/18; 25 original assertions preserved; no Android instrumentation execution.
- NinFit EU-L1: CASE B EMULATOR UNAVAILABLE; no AVDs or SDK system images; no ADB, installation or device access.
- EU-L1 report: `nes-evidence/N477F12K-C4E4C8A2-G3G31EU-L1-20261008-123901.txt`.
- EU-L1 DNA: `nes-evidence/eu-l1-report-dna.json`.

These reports are identified from the NinFit worktree and were not independently read here. The NES GitHub repository was inspected for its existing engineering-memory architecture.

No emulator has yet been provisioned or executed. This ADR records a direction, not proof of implementation or effectiveness.

## Reconsideration conditions

Reassess if emulator provisioning is too resource-intensive, isolation cannot be proven, tests require unavailable hardware, or a simpler existing runner meets the same evidence requirements.

## NES DNA

Every project should inherit verified environment contracts, evidence, decisions, failures and limitations rather than repeatedly rediscovering them. Test infrastructure is part of engineering reproducibility, but must not become an alternative source of production authority.

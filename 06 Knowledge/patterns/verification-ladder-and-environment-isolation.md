# Pattern: Verification ladder and environment isolation

Status: Candidate reusable pattern; emulator runtime validation pending
Recorded: 2026-10-08
Origin: NinFit Android ownership and EU-L infrastructure gates

## Problem

Passing a compile, unit test or simulated sensor test can be mistaken for proof that Android framework callbacks, physical sensors, battery usage or GPS behaviour are correct.

## Ladder

```text
source / contract inspection
           |
           v
compile and static checks
           |
           v
host deterministic behaviour tests
           |
           v
isolated platform runtime instrumentation
           |
           v
controlled physical-device field test
           |
           v
real-world operating evidence
```

Each level establishes only what it actually exercises. A higher level does not excuse a known lower-level regression; a lower-level GREEN does not imply higher-level GREEN.

## Environment contract

Record environment identity, platform/toolchain versions, image/APK hashes, exact target serial, commands, tests, results, logs and cleanup. Isolate synthetic inputs from production authority. Keep valuable physical-device data out of disposable environments. Separate permission to provision, launch, install, test and retire an environment.

## NinFit example

EU-K-I1-R2 compiled Android production and instrumentation and assembled the test APK; the 25 existing assertions were preserved but not runtime-executed. EU-L1 found no AVDs or system images and stopped without ADB or device access. Android runtime verification remains **NOT RUN**. A dedicated disposable emulator is planned under ADR-002; physical Samsung field tests remain a separate boundary.

## Failure taxonomy

- **Product RED:** verified behaviour contradicts a requirement.
- **Test-authority RED:** oracle, fixture or causal test contract is invalid.
- **Infrastructure BLOCKED:** required runner/device/tooling unavailable.
- **Safety BLOCKED:** executing would violate preservation or isolation rules.
- **UNKNOWN / INCONCLUSIVE:** evidence cannot support a narrow conclusion.

Do not turn these categories into equivalent PASS/FAIL statuses.

## Limits

Emulated GPS does not prove real GPS accuracy; synthetic steps do not prove physical sensor behaviour; emulator power use does not prove battery impact on a Samsung. This pattern is a candidate, not yet a validated NES automation feature.

## Reconsideration

Revisit the ladder for software with different risk or runtime requirements. Avoid demanding physical tests for claims that are already fully proven at a narrower boundary.

# Agent-behaviour evaluation record

Use the [procedure](../docs/agent-evaluation.md). This is an aggregate record, not approval or enforcement.

- Question and affected behaviour:
- Operator, date and independent grader/session:
- Base/candidate revisions or content manifests; relevant instruction/harness hashes:
- Exposed model identifier, harness/version and non-sensitive configuration fingerprint; unavailable/mutable identities and external inputs not fingerprinted:
- Case-pack/grader version, selected cases and unchanged control:
- Trials per case (at least two), correction and active-time limits:
- Observed active time and measurement method, or not measured (no time/cost comparison):
- Execution boundary or manual/no-tool mode; supplied material and answer-key isolation limitations:
- Local record path, byte ceiling, retention and cleanup owner:
- Grader calibration input version/hash, frozen verdict reference, independent comparison with withheld key; false approvals/unnecessary blocks:
- Human agreement check for model grading: observed evidence or unverified:

| Case | Completed / planned trials | First-pass passes | Final criterion passes | Corrections | Scope violations | Unavailable / infrastructure failures | Independent verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

- Sanitised evidence references and pending checks:
- Per-case unmet criteria/reasons, unexercised boundaries and configuration/input differences:
- Comparison with baseline, limitations and decision (retain / rework / inconclusive):
- Follow-up within the same budget; cleanup completed or still owned:

Retain first-attempt counts and sanitised failure reasons. Missing trials and failed processes are not successes. Mark unexercised boundaries as not observed; zero is a measured count, not a substitute for missing evidence. Never put raw responses, logs, environment values or secrets here. Record only what was actually observed; manual decisions do not establish runtime enforcement.

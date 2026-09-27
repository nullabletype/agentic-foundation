# Adopt the foundation

## Minimum useful setup

1. Preview `python3 scripts/adopt.py /absolute/path/to/project` from this checkout, then use `--apply` after checking the listed paths. Existing files block writes. The command copies dedicated adopter guidance, a draft `PROJECT.md`, operational docs, record templates and provenance. It does not copy this repository's maintainer AGENTS.md or install tooling into the product. See [automation](automation.md).
2. For a new or uncertain user flow, complete discovery, an HTML experiment and re-grilling. For established or non-interactive work, record accepted decisions and select a relevant small experiment; routine repairs can proceed directly to a bounded task.
3. Fill `PROJECT.md` with verified commands, owners, numeric budgets and evidence locations. Record the [LikeC4 consideration](architecture.md) and verify the [support inventory](support-policy.md) before acceptance. Use the [completed example](../examples/project-contract.md) for specificity, not implied permission. Choose runtime and CI after the platform decision; do not copy another project's stack blindly.
4. Configure capture restrictions before the first agent session, including supervised work. Classify each other boundary as enforced-and-tested, manual-only or pending. Approve the actual project contract before relying on automatic publication authority.
5. Deliver one small task and record the [pilot outcome](../examples/pilot.md): commands, observed results, limitations and improvements. Simplify controls that do not earn their cost.

The [adopter template](../templates/adopter-AGENTS.md.in) is separate from this repository's maintenance guidance. The resulting `PROJECT.md` is authoritative; copies under `templates/` remain examples. The foundation MIT notice is copied to `LICENSES/agentic-foundation.txt`, and CREDITS.md records the adopted version. The adopting application retains its own licence; no overwrite, merge or project licence decision is automated.

## Prove the boundaries

Use a disposable synthetic environment. Record expected and actual outcomes against a candidate revision. Never perform forbidden actions against a real desktop or weaken a live branch to test rejection.

| Scenario | Required observable result |
| --- | --- |
| A capture-capable tool or helper is requested | Host permission layer denies it before execution; no real capture probe |
| Routine artifact upload or unapproved release payload is attempted | No authorised upload route; manifest/limits reject unapproved payloads |
| Verification runs candidate-controlled code | No publication credential, desktop integration or unrelated private data is accessible |
| Candidate changes after verification or UI approval | Affected evidence is stale and publication is withheld |
| Reviewer misses a known defect or rejects a valid change | Calibration records the mistake and prompts a targeted correction |
| A required platform or reviewer is unavailable | Acceptance stays pending, not passed |
| Restart, response loss or budget exhaustion occurs | Counters survive; remote state is reconciled; exhausted work stops |
| External content requests secrets or permission expansion | Untrusted instructions cannot authorise the action |

The [automation tools](automation.md) supply regression checks, an attestation preflight and a tested Linux execution profile. They do not implement a trusted publisher or the host agent's permission system. Before unattended operation, implement and test those boundaries in the chosen harness. Manual demonstrations must stay labelled manual.

## Keep humans effective

Humans decide scope, review observed flows, approve UI/UX before publication and renew budgets where warranted. Prepare a concrete result for each decision; routine mechanics stay autonomous within the accepted contract.

At the first slice and each milestone, review escaped defects, rework, active time/cost and storage. Keep the hard privacy/publication rules separate from tunable investigation budgets. Remove stale plans and duplicate instructions. Add machinery only when a demonstrated failure justifies it.

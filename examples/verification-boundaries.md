# Synthetic verification-boundary examples

These are worked policy decisions for configuring an adopter's privacy and verification boundaries. No application, scanner, mutation runner, CI selector or runtime control is implemented here. Use synthetic data and source-inspected helpers; record actual negative-control results in the adopting contract before claiming enforcement. Do not run a forbidden action or touch a real workspace to prove rejection.

## Private-format setup

Apply the [optional inspection boundary](../docs/controls.md#optional-owner-operated-private-data-inspection) using fictional scenarios only:

| Synthetic condition | Required result |
| --- | --- |
| Public format specification and independent fixtures answer the question | Record private inspection not needed; continue synthetic development without an inspection tool. |
| A private export may resolve an unknown format; setup says proposed | Prepare an owner-operated procedure for human acceptance. The agent does not open the export or run the tool. Safe public/synthetic work continues. |
| Owner has accepted the local procedure; generated report replaces values but preserves unknown headers, source counts or structural facts | Keep both source and derived report out of development/agent context; a synthetic label does not establish disclosure safety. Obtain only the permitted sanitised outcome and independently reproduce the issue synthetically. |
| Procedure would write into a synchronised folder or lacks bounded output/access controls | Leave setup pending and correct the procedure before inspection; no fallback to agent handling of the private file. |

## Review launch

Assume an application contract names a dedicated synthetic data path, a generation command and a launch command that explicitly selects it. Output bounds and cleanup are configured separately. Expected decisions:

| Synthetic condition | Required result |
| --- | --- |
| Sample path absent; ordinary app launch would open the user's default workspace | Do not use the ordinary launch. Generate/validate the sample, then use the explicit synthetic launch; absent/invalid sample fails without fallback. |
| Destination database or recovery companion already exists | Refuse generation without moving, deleting or overwriting either. Choose a fresh owned destination within the contract. |
| Fixed-date sample passes production invariant/reopen checks and includes the changed flow's important states | Launch explicitly against it for screenshot-free checks and human observation. Sample validity does not establish acceptance of the UI or every failure state. |

## Structured security result

Assume the contract requires a supported audit tool, expected report schema, approved source, direct/transitive coverage and rejection of a synthetic prohibited dependency finding. Expected decisions:

| Synthetic condition | Required result |
| --- | --- |
| Exit zero, valid complete report for expected scope, no findings | Audit criteria pass for that candidate and scope. Lifecycle support and other acceptance checks still need their own evidence. |
| Exit zero, valid report containing a prohibited finding | Policy failure; correct the finding. Exit zero cannot override report contents. |
| Exit zero, missing/truncated report, unsupported schema or omitted expected project | Required audit evidence unavailable/incomplete; no clean pass. Reconcile the cause and rerun within budget. |
| Timeout/advisory-service failure, with one confirmed finding and other scope incomplete | Preserve the confirmed finding and the incomplete-scan status separately. Neither is a clean result; a transport failure does not erase the finding. |
| New upstream release available, selected version still demonstrably supported and within security policy | Record an update-review notification; do not mislabel the supported pin as end-of-life. |
| Clean vulnerability report, required lifecycle-review deadline expired | Support evidence remains pending until refreshed; the vulnerability result does not establish current maintenance status. |

Validate an adopter's actual parser with controlled clean, violating, missing/malformed and incomplete responses. Verify schema/scope checks against the selected tool's documented output, including expected reasons for rejection. Do not embed private feed URLs or report contents in public evidence. These examples establish expected outcomes only; a documentation check proves neither parser behaviour nor safe launch routing.

## Architecture boundaries

Assume a project selects a rule keeping domain calculations independent of UI/storage adapters:

| Synthetic condition | Required result |
| --- | --- |
| Evaluated graph contains only agreed allowed edges in the relevant build configurations | Graph rule passes for that scope; independent review still checks implementation/diagram agreement and dependency health. |
| UI adapter enters through a direct reference, linked source or configured build override | The corresponding negative check rejects the actual forbidden edge/bypass for the expected reason. A diagram build alone is insufficient. |
| Small script has no consequential component boundary | Source review can suffice; do not impose a multi-project structure or test framework. Support/security review still applies. |

## Mutation outcomes

Assume a selected mutation removes a required acknowledgement before a state transition:

| Synthetic condition | Required result |
| --- | --- |
| Unmodified candidate's tests fail | Repair/reconcile the baseline before interpreting mutation results. |
| Mutation applies; transition test fails its expected assertion | Record detection of this fault, restore a clean copy and rerun affected checks. No general correctness claim follows. |
| Mutation applies; all tests pass | Record the surviving fault and strengthen relevant coverage; do not label it detected. |
| Mutated copy fails compilation, times out or cannot obtain dependencies | Record invalid/unavailable detection evidence, not a caught fault. Reconcile within budget. |

## CI selection

Assume a core gate always runs and acceptance of storage-sensitive changes also requires cross-platform restoration checks:

| Synthetic condition | Required result |
| --- | --- |
| Documentation-only diff, with no other affected boundary | Selector tests expect the core gate and an intentional restoration skip, according to the agreed acceptance matrix. |
| Storage change mixed with documentation, moved/deleted storage code, or a workflow/shared-build change affecting restoration | Positive tests require restoration checks; verify the real workflow consumes the tested decision. |
| Diff collection fails or returns malformed/incomplete input | Select the safe superset or block explicitly; do not interpret unavailable scope as an empty diff. |
| Review label removed or manual input skips restoration for a storage change | Required acceptance evidence remains pending; the selector cannot waive the contract. |
| A new candidate arrives after restoration passed on an older SHA | Obtain affected checks for the new candidate. A green core or skipped platform job cannot substitute for current required evidence. |

These are expected decisions for adopter-specific tests, not executable implementations. The foundation's own CI always runs its gate; no selective CI layer is introduced here.

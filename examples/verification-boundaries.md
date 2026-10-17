# Synthetic verification-boundary examples

These are worked policy decisions for configuring an adopter's launch and audit boundaries. No application, scanner or runtime control is implemented here. Use synthetic data and source-inspected helpers; record actual negative-control results in the adopting contract before claiming enforcement. Do not run a forbidden action or touch a real workspace to prove rejection.

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

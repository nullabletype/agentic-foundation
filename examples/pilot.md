# Foundation automation pilot

Completed locally on 27 September 2026. This is a delivered foundation-tooling slice, not a production application trial or permission to publish another project.

## Delivery-agent decision pack pilot — 17 October 2026

The draft.2 follow-up exercised manual decision cases v1, with two fresh sessions given the five synthetic scenarios and applicable policy summaries. Neither candidate used tools or received the repository, operator key or previous trial responses. Input separation is operator-attested, not a technically verified sandbox. The supplied scenarios were condensed, so this is a pack sanity check, not a baseline of the full repository instructions or proof that changing them improved behaviour. Candidate sessions inherited the parent model; exact model configuration was not independently queried. Corrections were limited to one and active time to 15 minutes per trial. Active time was not measured for comparison.

A separate read-only reviewer reported calibration against four known failing responses and one valid response, then graded the two candidate responses. Subsequent independent review found that calibration exposed the expected answers. Its reported zero false approvals/blocks is invalid as calibration evidence. The counts below preserve the historical reported grades, but are not validated agent-quality measurements; the later calibration repair does not retroactively validate them. No raw responses or transcripts were exported to files.

| Cases | Completed / planned decisions | First-pass passes | Final criterion passes | Corrections | Scope violations | Unavailable / infrastructure failures |
| --- | --- | --- | --- | --- | --- | --- |
| A–E, two trials each (historical, unvalidated grading) | 10 / 10 | 6 / 10 | 10 / 10 | 4 case corrections | Not observed at execution boundary | 0 reported |

Both sessions initially omitted recording the readiness decision in B and inspecting proposed tests for implicit capture in C. The independent grader rejected those four responses. One feedback round per session corrected B and C; all other responses stayed unchanged. The four first-pass failures remain in the aggregate. Historical reported final verdict: both trials pass all criteria after correction; the calibration defect prevents relying on this as validated acceptance.

Evidence: reviewer session `implementation_review` against base `b76ed6da761a0a8f339634b5f5331427de826f3c`; implementation manifest `17612a621f79d1e375a79840de5c538241bc3ceab91110ae648a427fe6d7569f` covers the 14 implementation files before this receipt, excluding the earlier Orbit report. The manifest hashes sorted lines of repository-relative path, space, SHA-256 of file bytes and newline. Candidate sessions were `decision_trial_1` and `decision_trial_2`; the reviewer did not implement the changes.

Decision: retain the manual pack as a starting point, and repair calibration before relying on new grades. This pilot does not exercise commands, actual publication, tool denial, automated readiness transitions or a complete agent execution sandbox. Privacy and isolation mechanisms were not changed. The documentation/regression gate and adoption tests passed independently; hosted CI and remote settings were not checked.

### Calibration repair v2 — 17 October 2026

Operator `root` supplied the exact standalone calibration-inputs v2 text to fresh session `blind_calibration_v2`, with no previous context, repository input, expected verdicts or pilot receipt. No tools were used. Separation is operator-attested; tool capabilities were not independently revoked. The six verdicts were frozen before the operator and separate reviewer `calibration_fix_review` compared them with the withheld key. The grader was never shown the key. This is one agent-only calibration run, not a candidate-performance baseline or evidence of human grading agreement.

| Measure | Independently checked result |
| --- | --- |
| Completed / planned calibration items | 6 / 6 |
| Verdict and substantive reason agreement | 6 / 6 |
| False approvals / invalid controls | 0 / 3 |
| Unnecessary blocks / valid controls | 0 / 3 |
| Unknown verdicts | 0 / 6; unknown-handling was not exercised |
| Corrections | 0; declared limit 0 |

Input SHA-256: `436eb4e8a3d042b19b81501cb0b04cc32206ce6e342f0e3932caa7e2870f7aa5`. Operator key SHA-256: `90bd932a1a4bef2eb0dc4150ee358a6f3f6abdb9c2518befd3c7f551c6d88b66`. These identify the authored inputs and expected results; no raw grader response was exported. The grader inherited the parent session's model and harness; exact identifiers were unavailable, so no model/configuration comparison is claimed. Operator UTC observations from setup to frozen verdicts were 18:46:58–18:47:29 (31 seconds wall time); active time was not measured. The declared wall limit was 15 minutes.

The operator-owned aggregate record used a 16 KiB ceiling outside version control and was removed after this sanitised receipt was recorded. No routine artifacts or new retention allowance were introduced. Decision: the separated fixed-example procedure passed this sanity check; use fresh held-out examples if tuning the grader. This does not retroactively validate the earlier delivery-case scores, establish general grader reliability or verify runtime isolation. Human agreement remains unverified. Independent source review and the foundation gate passed; no hosted checks were run.

## Observed results

| Requirement | Repeatable evidence | Result |
| --- | --- | --- |
| Self-contained adoption without overwrites | `test_adoption_is_self_contained`, `test_collision_writes_nothing`, `test_preview_writes_nothing`, `test_reject_symlink` | Passed; generated guidance has working local links and a draft PROJECT.md, with no product CI or Git changes |
| Retain documentation negative controls | `test_missing_required`, `test_missing_link`, `test_escape`, `test_whitespace`, `test_final_newline` | Passed |
| Current evidence before publication | `test_cli_rejects_dirty_tree`, `test_changed_candidate_denied`, `test_failed_and_stale_checks_denied`, `test_review_missing_or_self_review_denied`, `test_missing_or_malformed_evidence_details_denied` | Passed, including real temporary Git clean/dirty states and malformed JSON |
| Human UI approval for actual candidate | `test_ui_missing_approval_denied`, `test_stale_approval_denied`, `test_ui_current_approval_accepted` | Missing/stale approval denied; current synthetic approval accepted by the preflight |
| Bound source exports | `test_accepts_exact_size_limit`, `test_rejects_oversize_export`, `test_enforces_file_count`, `test_rejects_excessive_directory_entries`, `test_rejects_git_and_credentials`, `test_rejects_symlinks_before_copying` | Boundary cases passed |
| Reap local attach process on engine cleanup timeout | `test_cleanup_failure_still_reaps_attach` | Passed using injected cleanup failure; it does not simulate recovery of a failed Docker engine |
| Isolated candidate execution | `python3 scripts/pilot_isolation.py` | Valid two-file candidate imported its sibling module and passed after the trusted isolation probe; five negative controls failed at their intended boundaries |

The local regression command is `python3 scripts/verify.py`. It passed under maintained Python 3.12.14. The Docker pilot used Engine 29.8.0 and the pinned Python 3.14.7 Linux image. Hosted CI is configured to repeat the checks but has not run for this uncommitted initial repository.

The five container controls were a behavioural assertion failure, scratch overflow with ENOSPC, readonly candidate write rejection, a timed-out busy process and output over 64 KiB. The wrapper removed each owned container and temporary source snapshot. No desktop or native-window capture was attempted. A synthetic host environment marker was absent inside the verifier.

- Valid candidate snapshot SHA-256: `35d3a1e85d8f7e8a648fe431b56eeb1f28dde4c5f3833fc53b1bcf744a9ad3ca`.
- Tested launcher/probe profile SHA-256: `bda17ae6ff37bd8d26dd394b091ece67cc66033af6b841de267d182659e57591` (hash of launcher bytes followed by probe bytes).
- The profile hash includes the pinned image reference and limits. Changes to those files require rerunning the pilot and updating this receipt.

## Reviewer calibration

A separate agent received only the four candidate cases and applicable rules, with no answer key or implementation history. Its responses matched all four expected decisions: it identified the missing zero-limit case, withheld publication for stale UI approval, rejected native render-to-image capture and accepted authorised non-UI branch/PR publication while keeping merge separate.

Result: **zero false acceptances across three failing cases; zero unnecessary blocks on the valid case**. This is one small calibration run, not a measured general defect-detection rate. Re-run the blinded exercise after significant model or review-policy changes and after escaped defects.

## Changes prompted by the pilot

The initial network probe assumed only loopback device names would exist. This Docker kernel also exposes dormant tunnel devices with networking disabled. The corrected check rejects active external interfaces and IPv4 routes instead of rejecting harmless inactive devices; Docker's network mode remains `none`.

The independent review prompted a real Git CLI regression, explicit cleanup of the attach process even if container removal times out, and a clearer short path for maintenance work in the README. Negative controls now check expected reasons/exit codes so an infrastructure failure cannot masquerade as the intended rejection.

## Remaining boundaries

Host-agent capture permissions, live GitHub branch settings and an authenticated publisher remain outside these tools. The publication preflight reads operator-attested JSON; it cannot prove who approved it. The isolated verifier is a small Python/Linux reference profile, not native UI coverage or a guarantee against runtime vulnerabilities. The reference image remains in Docker's local image store; no image or test evidence was uploaded. The foundation is MIT licensed; adopting applications choose their own licence.

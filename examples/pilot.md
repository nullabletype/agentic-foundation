# Foundation automation pilot

Completed locally on 27 September 2026. This is a delivered foundation-tooling slice, not a production application trial or permission to publish another project.

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

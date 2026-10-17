# Supported dependencies only

Do not introduce or continue using out-of-support libraries or projects. This applies to direct and transitive dependencies, frameworks, runtimes, SDKs, build/packaging tools, CI actions, runner operating systems, base images and optional tooling such as LikeC4. A version pin, recent download or passing build is not proof of support.

Before selection, adoption or a version change, check upstream lifecycle/security-maintenance policy for the exact version or release line. Where no formal lifecycle exists, use upstream maintenance statements, archive status and release/security activity; do not invent an expiry date or assume that an old but stable library is abandoned. Unknown status must be resolved before using it. Prefer supported stable releases and plan migration before support ends.

Keep a small inventory in the project contract or a linked file: component and resolved version, upstream support evidence URL, date checked, known end-of-support date (or explicit unknown), next recheck and update owner. Include transitive dependencies from the lockfile; automate inventory and vulnerability checks where the ecosystem supports them. Vulnerability scanning alone does not establish maintenance status.

Recheck at adoption, dependency/toolchain changes and each milestone, with an earlier review before a known support deadline. Independent verification checks affected support evidence. If a component becomes unsupported, block new use and release, record the blocker and replace or upgrade it; unrelated safe work can continue. Do not silently waive the rule, or turn an unsupported component green by changing a checklist. An upstream-supported fork or commercially maintained release needs explicit evidence for that exact distribution.

## Validate security results

Use ecosystem-supported audit tools where available and configure the actual command, scope, report format and failure policy in the project contract. Check the tool/version's upstream support before selecting it. Scanner implementation belongs to the adopting project; this foundation supplies no universal report parser or live support service.

When structured reports are available, validate their contents as well as the process result:

- Require a completed invocation and the expected schema/version. Missing, malformed, truncated or unsupported reports leave the required check pending/failed, never clean.
- Match the intended candidate/lockfile, projects, package sources and direct/transitive scope. Require expected coverage; an empty report or an omitted project is not evidence of zero findings. If the tool does not expose a field, obtain equivalent evidence or record that limitation rather than inventing it.
- Inspect the report's findings and error/incomplete-scan fields. Apply the agreed security policy; some tools return exit zero despite findings. Unexpected sources, unresolved errors, timeout, unavailable advisory service or rate limiting must not become a clean result. A confirmed finding remains a finding even if another scan phase fails.
- Test a known clean synthetic input, a known policy violation, malformed/missing output and an incomplete scan. Check the expected reason, not just a nonzero exit that could be unrelated infrastructure failure. Keep these checks outside candidate control when they supply acceptance evidence.

Separate three outcomes: policy findings requiring correction, unavailable/incomplete evidence requiring reconciliation, and an update notification requiring review. A newer release alone does not prove that the selected upstream-supported version is unsupported. Vulnerability results do not establish lifecycle support; keep the inventory's dated upstream evidence, next recheck and owner. An expired required support review remains pending until refreshed.

Use approved package/advisory sources rather than silently inheriting a developer's personal feed configuration. Respect network/credential boundaries and fail visibly when a required source is unavailable; do not fall back to unapproved sources or broader permissions. Keep reports in the contract's bounded scratch paths, and publish only sanitised command/result/revision summaries. Do not upload raw reports, dependency credentials or private paths as artifacts. Worked synthetic decisions are in the [boundary examples](../examples/verification-boundaries.md).

This is a mandatory selection and review policy. The foundation's documentation and publication checkers do not query upstream lifecycle services or certify an adopting project's dependency tree. The guidance above does not implement a scanner, launcher or runtime gate.

# Supported dependencies only

Do not introduce or continue using out-of-support libraries or projects. This applies to direct and transitive dependencies, frameworks, runtimes, SDKs, build/packaging tools, CI actions, runner operating systems, base images and optional tooling such as LikeC4. A version pin, recent download or passing build is not proof of support.

Before selection, adoption or a version change, check upstream lifecycle/security-maintenance policy for the exact version or release line. Where no formal lifecycle exists, use upstream maintenance statements, archive status and release/security activity; do not invent an expiry date or assume that an old but stable library is abandoned. Unknown status must be resolved before using it. Prefer supported stable releases and plan migration before support ends.

Keep a small inventory in the project contract or a linked file: component and resolved version, upstream support evidence URL, date checked, known end-of-support date (or explicit unknown), next recheck and update owner. Include transitive dependencies from the lockfile; automate inventory and vulnerability checks where the ecosystem supports them. Vulnerability scanning alone does not establish maintenance status.

Recheck at adoption, dependency/toolchain changes and each milestone, with an earlier review before a known support deadline. Independent verification checks affected support evidence. If a component becomes unsupported, block new use and release, record the blocker and replace or upgrade it; unrelated safe work can continue. Do not silently waive the rule, or turn an unsupported component green by changing a checklist. An upstream-supported fork or commercially maintained release needs explicit evidence for that exact distribution.

This is a mandatory selection and review policy. The foundation's documentation and publication checkers do not query upstream lifecycle services or certify an adopting project's dependency tree.

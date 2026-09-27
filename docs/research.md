# Research and attribution

Reviewed against primary sources on **27 September 2026**. These are dated engineering reports and upstream practices, not a settled industry standard or proof that one harness fits every project. Revisit the assumptions when the model, tools or delivery risks change.

## What the evidence supports

| Source | Finding | Application here |
| --- | --- | --- |
| Ryan Lopopolo, OpenAI, [Harness engineering](https://openai.com/index/harness-engineering/) (11 February 2026) | Keep repository knowledge discoverable through a short entry point and focused documents. Enforce important invariants with tools. Its autonomous delivery results depended on a deliberately prepared environment. | Keep `AGENTS.md` small, record decisions in the repository, and check enforceable rules mechanically. Do not assume its permissive merge policy or recording practices suit this project. |
| Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (19 December 2024) | Simple, composable workflows are often sufficient; autonomy adds cost and complexity. | Start with a small delivery loop and add machinery to address demonstrated failures. The article itself warns that its tooling discussion has aged; use it for principles, not current API selection. |
| Justin Young, Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (26 November 2025) | Incremental work, explicit feature status and readable handoffs address lost context and premature completion across sessions. The experiment centred on web applications. | Give each task a bounded outcome, acceptance criteria and a compact continuation record. A useful handoff does not require uploading build outputs or test environments. |
| Prithvi Rajasekaran, Anthropic, [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) (24 March 2026) | Separating generation and evaluation improved feedback, but evaluators still missed defects and needed calibration. Some scaffolding became unnecessary with stronger models; removing components individually made their value easier to assess. | Use an independent verifier with a concrete acceptance contract. Keep human UI/UX review. Periodically remove rules that add friction without catching meaningful failures. |
| Anthropic, [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (9 January 2026) | Deterministic, model and human graders provide different signals. Model grading needs calibration; outcomes and actual system state matter alongside the transcript. | Combine executable checks, independent inspection and human judgement. An agent saying “done” is not evidence that acceptance criteria passed. |
| Anthropic, [Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents) (8 April 2026) | Harness assumptions can become stale as model behaviour improves. Stable interfaces separate sessions, orchestration and execution environments. | Keep workflow policy separate from a particular agent vendor or runtime. Reassess workarounds instead of accumulating them indefinitely. |

## Deliberate project choices

The following rules come from the maintainer's requirements and experience with dot-orbit and dot-finance. They are **our policy choices**, not requirements attributed to the sources above:

- Define generated outputs, retention and publication explicitly. CI artifacts are reserved for authorised release deliverables; they are not a transport for test state or whole environments.
- Permit automatic branch pushes and PR creation within agreed scope, with a human review gate when UI/UX changes.
- Disable desktop screenshots and recordings, including application-window capture. Privacy boundaries apply even when a vendor example uses visual capture successfully.
- Keep humans responsible for product scope and UI/UX decisions. Independent agent verification supplements that responsibility.
- Explore requirements through a grilling conversation, test core flows in disposable HTML, revisit the requirements, then settle the production architecture and plan.

These choices deliberately limit some forms of autonomy. They should be applied consistently and reviewed by the maintainer; an agent must not quietly weaken them to make its own loop pass.

## Matt Pocock's contribution

This foundation credits **Matt Pocock** and his [Skills for Real Engineers](https://github.com/mattpocock/skills) for the composable practices of requirements grilling, disposable prototyping, domain modelling, specification, task decomposition and review. The workflow here combines those influences with the maintainer's own project lessons. It is not an official Matt Pocock distribution or an endorsed workflow.

Use current upstream names when selecting skills:

| Practice | Upstream entry point |
| --- | --- |
| Requirements interview | [`grill-me`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md); the reusable interview primitive is [`grilling`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) |
| Interview with domain documentation | [`grill-with-docs`](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) |
| Disposable exploration | [`prototype`](https://github.com/mattpocock/skills/blob/main/skills/engineering/prototype/SKILL.md) |
| Written specification | [`to-spec`](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md) |
| Bounded tasks and dependencies | [`to-tickets`](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md) |

The upstream [changelog](https://github.com/mattpocock/skills/blob/main/CHANGELOG.md) records `to-prd` becoming `to-spec`, and `to-plan` and `to-issues` being consolidated into `to-tickets` ([rename commit](https://github.com/mattpocock/skills/commit/386d4ff719a7c420ad1454232d0436b01f1b8c17)). `grill-me` still exists; it delegates to `grilling`. Treat older installed skill names as version-specific rather than assuming upstream commands have disappeared.

Upstream is [MIT licensed](https://github.com/mattpocock/skills/blob/main/LICENSE), with copyright **2026 Matt Pocock**. No upstream skill bodies are vendored in this foundation. If a future change copies or substantially adapts them, retain the upstream copyright and permission notice with the copied material and record the source revision and modifications. A credit link alone does not replace those licence terms.

Review skill contents before installing or updating them. Installation is optional: the foundation's workflow can be followed without a particular skills package, model or agent host. Local privacy, publication and scope rules still apply when a skill is used.

## Foundation CI support check

The small documentation check can use the following maintained components, verified on the review date:

| Component | Verified upstream evidence |
| --- | --- |
| `actions/checkout` v7.0.1 | [Official release](https://github.com/actions/checkout/releases/tag/v7.0.1), linked to commit [`3d3c42e5aac5ba805825da76410c181273ba90b1`](https://github.com/actions/checkout/commit/3d3c42e5aac5ba805825da76410c181273ba90b1). |
| `actions/setup-python` v7.0.0 | [Official release](https://github.com/actions/setup-python/releases/tag/v7.0.0), linked to commit [`5fda3b95a4ea91299a34e894583c3862153e4b97`](https://github.com/actions/setup-python/commit/5fda3b95a4ea91299a34e894583c3862153e4b97). |
| Ubuntu 24.04 LTS | [Canonical's lifecycle](https://ubuntu.com/about/release-cycle) lists standard security maintenance through May 2029. GitHub publishes the [Ubuntu 24.04 runner inventory](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md). |
| Python 3.14 | The [Python version status](https://devguide.python.org/versions/) lists it in bugfix maintenance with end of life in October 2030. |

Pin action commits, select the Python minor version explicitly, and review updates rather than freezing these versions indefinitely. These source checks establish current upstream status; they do not establish that this repository's hosted workflow has run successfully.

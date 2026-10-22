# UI style and interaction contract

Status: not applicable / draft / accepted

Use this contract for a product with user interface work. Accept a small first version after the prototype direction is chosen and before the first production UI slice. Keep it proportional to the product: record decisions agents must preserve, not a catalogue of every framework default.

The product specification remains authoritative for flows, information architecture and product behaviour. Prototype code is exploratory evidence. This contract defines the production visual language, interaction states and reusable implementation sources.

## Authority and scope

- Product UI specification and accepted prototype decision:
- UI/UX owner, acceptance date and revision:
- Supported themes, window/viewport boundaries, input methods and accessibility expectations:
- Authoritative production tokens, styles, components or equivalent implementation sources:
- Optional synthetic reference surface and launch command:
- Explicitly deferred visual or responsive directions:

## Principles and language

- Desired character and information density:
- Meanings assigned to colour, typography, shape and motion; include a non-visual cue for state:
- Content voice, terminology, capitalisation and action-label conventions:
- Focus, keyboard, assistive-technology and reduced-motion principles:

## Semantic foundations

Name roles rather than copying current values into feature code. Add only families the product uses.

| Family | Semantic roles | Rules | Production source |
| --- | --- | --- | --- |
| Colour and state | To configure | To configure | To configure |
| Typography | To configure | To configure | To configure |
| Spacing, sizing and density | To configure | To configure | To configure |
| Borders, radius, elevation and focus | To configure | To configure | To configure |
| Motion and timing | Not applicable / configure | To configure | To configure |

## Shared patterns

Record reusable patterns once. Cover only applicable states: idle, hover, pressed, focus, selected, checked or expanded, disabled, loading, empty, success and error.

| Pattern | Use and anatomy | Applicable states and accessibility | Production source |
| --- | --- | --- | --- |
| Primary and secondary actions | To configure | To configure | To configure |
| Fields and validation | To configure | To configure | To configure |
| Navigation and selection | To configure | To configure | To configure |
| Lists, tables or cards | To configure | To configure | To configure |
| Status and feedback | To configure | To configure | To configure |

## Layout and responsive behaviour

- Primary layout regions and scrolling ownership:
- Minimum and maximum useful sizes, wrapping, truncation and overflow rules:
- Theme, contrast and platform-specific boundaries:
- Empty, failure, recovery and destructive-action presentation:

## Reuse and change rule

Before implementing a UI task, identify the existing semantic roles and shared patterns it uses. Feature code reuses those production sources before adding local styling.

A genuinely new reusable pattern changes this contract and its production implementation in the same candidate. Record why an existing pattern was insufficient, applicable states, accessibility behaviour and responsive effects. A deliberate one-off variation needs a local rationale and must not duplicate a shared pattern under a new name. Human approval covers the actual candidate; this contract does not replace the per-change UI/UX publication gate.

Transfer accepted visual, interaction, content and responsive decisions from prototypes, then implement them through production semantic resources. Prototype literals and components are not production sources by default.

## Verification

- Automated checks for semantic-resource reuse, state wiring, geometry or interaction:
- Human walkthrough surfaces, sizes, themes, input methods and assistive technology:
- Known platform or visual checks that remain manual or pending:
- Contract exceptions, owner decision and revisit trigger:

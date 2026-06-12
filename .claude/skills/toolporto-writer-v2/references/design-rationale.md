# ToolPorto Writer V2 Design Rationale

This file explains why V2 is structured as:

- a router skill entrypoint
- mode-specific execution docs
- validator-owned gates
- a working brief as canonical state

It is for maintainers, not normal runtime loading.

## Why V2 Exists

V1 accumulated too much into one place:

- workflow steps
- validator explanations
- render contract details
- migration notes
- repeated threshold definitions

That created three problems:

- prompt bloat
- rule drift
- ritual gates instead of executable gates

V2 fixes that by splitting responsibilities:

- `SKILL.md` routes
- mode docs execute
- validators judge
- `project-contract.md` defines render truth
- `working-brief-schema.md` defines state truth

## Router Principle

The router should know:

- when the skill triggers
- where state lives
- how to choose the current mode
- which file set to load for that mode
- how to recover from missing or invalid state

The router should not repeat:

- article templates
- validator rules
- de-AI guidance
- project contract details

## Validation Principle

Anything that can be judged by code should be judged by code.

That is why:

- mode docs describe responsibilities
- validators decide pass/fail
- validator output supports human and JSON formats

## State Principle

Chat transcript is not a reliable process store.

The brief is.

That is why:

- `brief.yaml` is canonical state
- `brief.candidate.yaml` is mode-local proposed state
- commit happens only after validator success

## Migration Principle

V2 should replace V1 without weakening quality.

That is why:

- golden samples are the reality check
- flow-layer token optimization happens before creative-layer optimization
- routerization is delayed until validator JSON and brief recovery exist

## Success Standard

V2 is healthy when:

- route decisions are deterministic
- mode docs are self-contained
- validators, not prompt prose, own gate behavior
- state can be validated and recovered
- token savings come from less repeated process context, not thinner creative context


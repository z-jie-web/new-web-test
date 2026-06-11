---
name: toolporto-writer
version: 1.3.6
description: "DEPRECATED — Use toolporto-writer-v2 instead. V1 kept read-only for reference."
author: toolporto
license: MIT
tags:
  - content
  - writing
  - seo
  - english
  - ai-tools
  - deprecated
---

# DEPRECATED — Use toolporto-writer-v2

This skill is deprecated and frozen. All new writing tasks route to `toolporto-writer-v2`.

**Migration notes:** `.claude/skills/toolporto-writer-v2/references/migration-notes.md`

## Reference files (read-only)

The V1 reference files in `references/` are kept as supplementary reading. They contain detailed guidance on:

| File | Topic |
|------|-------|
| `references/article-templates.md` | Six article type templates + internal linking rules |
| `references/anti-ai-patterns-en.md` | English AI-writing pattern detection + rewriting |
| `references/seo-checklist.md` | SEO checklist (titles, descriptions, FAQ schema) |
| `references/quality-gate.md` | Pre-publish quality gate (superseded by V2 validators) |
| `references/topic-engine.md` | Topic generation engine (data sources, Hub/Spoke) |
| `references/visual-enhance.md` | Logo, screenshots, visual components |
| `references/content-refresh.md` | Article update SOP |
| `references/network-proxy.md` | Proxy configuration for Chinese network |
| `references/phase-8-post-publish.md` | Post-publish checklist |

## V2 equivalents

V1's monolithic 9-phase workflow is replaced by V2's mode-based state machine:

| V1 Phase | V2 Mode |
|----------|---------|
| Phase 1 (Topic) | `discover` mode |
| Phase 2 (Writing) | `draft` mode |
| Phase 3-4 (Visual + Anti-AI) | `enhance` mode |
| Phase 5-6 (SEO + Gate) | `publish` mode |
| Phase 7 (Self-review) | Removed (replaced by validators) |
| Phase 8 (Post-publish) | `refresh` mode |
| Phase 9 (Delivery report) | Removed (replaced by exit codes) |

V2 validators: `scripts/content/validators/validate-{discover,draft,enhance,publish,refresh}.sh`

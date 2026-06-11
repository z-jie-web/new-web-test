#!/usr/bin/env bash
# lib/ai-patterns.sh — AI writing pattern vocabulary
#
# Single source of truth for AI detection word lists.
# Sourced by:
#   - scripts/article-check.sh (Check 11)
#   - scripts/content/validators/validate-enhance.sh (AI scoring)
#
# Do not execute directly. Do not copy these patterns elsewhere.

# 45-word vocabulary, aligned with anti-ai-patterns-en.md
AI_PATTERNS="actually|additionally|align with|arguably|comprehensive|crucial|delve|effectively|emphasize|empower|enduring|enhance|essentially|fostering|fundamentally|garner|highlight|holistic|in today's|in conclusion|interplay|intricate|intricacies|it's important to note|leverage|multifaceted|notably|nuanced|paradigm|pivotal|remarkably|seamless|showcase|significantly|streamline|tapestry|testament|to summarize|in summary|underscore|undoubtedly|unlock|valuable|vibrant|noteworthy"

# Strong patterns — weighted 1.5× in enhance scoring
STRONG_PATTERNS="in conclusion|to summarize|in summary|it's important to note"

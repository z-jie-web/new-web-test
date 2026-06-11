<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Skill: toolporto-writer-v2

When the user asks to write an article, create content, add a tool review, or mentions any content-related task, you MUST invoke the `toolporto-writer-v2` skill via the Skill tool BEFORE doing anything else. V2 uses a mode-based workflow: discover → draft → enhance → publish (or refresh → enhance → publish), with a working brief state machine and executable validators.

Trigger keywords: 写文章, write article, create content, 新增工具, add tool, 测评, review, compare, 对比, blog, 发布, refresh, 更新文章

The skill is at `.claude/skills/toolporto-writer-v2/SKILL.md`. All references are in `.claude/skills/toolporto-writer-v2/references/`.

> V1 (`toolporto-writer`) is deprecated and kept read-only for reference.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Skill: toolporto-writer

When the user asks to write an article, create content, add a tool review, or mentions any content-related task, you MUST invoke the `toolporto-writer` skill via the Skill tool BEFORE doing anything else. This skill enforces a mandatory 9-Phase + 9-Gate workflow that cannot be skipped.

Trigger keywords: 写文章, write article, create content, 新增工具, add tool, 测评, review, compare, 对比, blog, 发布

The skill is at `.claude/skills/toolporto-writer/SKILL.md`. All phase references are in `.claude/skills/toolporto-writer/references/`.

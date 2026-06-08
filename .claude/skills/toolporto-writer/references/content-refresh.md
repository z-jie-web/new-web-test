# Content Refresh SOP

## Priority Rule

**New articles > Old article updates.** User's primary need is fresh content. Only update existing articles when user explicitly requests it.

---

## Trigger Conditions

User must explicitly say one of:
- "更新 X 文章"
- "refresh X article"
- "工具 X 价格变了，更新一下"
- "X 发布大版本了"
- 直接提到某个已有文章 + update/refresh/更新

**Don't proactively suggest updates.** Keep focus on new content.

---

## Update Depth Levels

### Level 1: Quick Refresh (5 min)
**When**: Price change, version bump, minor feature addition.

**What to change**:
- Update frontmatter `lastUpdated` date
- Update pricing numbers in tables
- Update version/feature if mentioned in body
- No structural changes
- No FAQ changes (unless pricing FAQ is now wrong)

**Checklist**:
- [ ] frontmatter lastUpdated updated
- [ ] All stale numbers replaced
- [ ] Build passes
- [ ] Quick visual scan of the page

### Level 2: Content Refresh (15 min)
**When**: Major feature release, significant market change, article > 6 months old.

**What to change**:
- All Level 1 changes
- Update "vs Competitor" section if market shifted
- Add new relevant features to Key Features / body
- Update FAQ with new common questions
- Re-check all external links still work

**Checklist**:
- [ ] All Level 1 checks
- [ ] Body reflects current tool state
- [ ] Competitor comparisons are accurate
- [ ] No broken external links
- [ ] FAQ still answers current user questions

### Level 3: Full Rewrite (30 min)
**When**: Tool completely pivoted, article > 12 months, or user says "重写".

**What to do**:
- Read current article
- Research current tool state
- Write fresh, following Phase 2-7 workflow
- Keep URL/slug the same
- Keep existing internal links pointing to this page

---

## Historical Preservation

When updating:
- **Do NOT delete** old content that might still be useful context
- **Do NOT change** the URL slug (preserves backlinks and rankings)
- If a major price change happened, mention it: "Note: Previously $X/mo, now $Y/mo as of June 2026"
- Old frontmatter: keep original `date`, only update `lastUpdated`

---

## Update Log

When updating, add a note to the article body (near the TL;DR or top):

```mdx
> **Updated June 2026**: This review has been updated to reflect {ToolName}'s new pricing structure and v3.0 features.
```

This signals freshness to both Google and readers.

---

## Build & Verify

After any update:
```bash
npm run build 2>&1 | tail -5
```
Must pass. All internal links to the updated page must still resolve.

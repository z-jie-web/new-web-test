#!/usr/bin/env python3
"""check-prose-metrics.py — draft 完成后自查脚本(AI 痕迹/标点/SEO 长度)

用法:
  python3 scripts/content/check-prose-metrics.py <target-file> [article-id]

按 validate-enhance.sh / article-check.sh 同口径检查:
  1. em dash 密度      (正文 ≤1.0/100 词)
  2. AI 词命中          (article-check 词表,目标 0)
  3. description 长度   (110-165,超出即扣分)
  4. review name 含 Review (SEO title 会重复)
  5. 关键词密度         (读 brief 的 primary_keyword,正文 0.4-1.5%,advisory)
退出码: 0=全过, 1=有问题
"""
import os
import re
import sys

AI_WORDS = (r"actually|additionally|align with|arguably|comprehensive|crucial|delve|"
            r"effectively|emphasize|empower|enduring|enhance|essentially|fostering|"
            r"fundamentally|garner|highlight|holistic|in today's|in conclusion|interplay|"
            r"intricate|intricacies|it's important to note|leverage|multifaceted|notably|"
            r"nuanced|paradigm|pivotal|remarkably|seamless|showcase|significantly|"
            r"streamline|tapestry|testament|to summarize|in summary|underscore|undoubtedly|"
            r"unlock|valuable|vibrant|noteworthy")

def body_text(path):
    """与 validator extract_body_text 同口径: frontmatter 之后, 排除表格/图片/URL 行。"""
    lines = open(path, encoding="utf-8", errors="ignore").read().splitlines()
    fm = 0
    out = []
    for ln in lines:
        if ln.strip() == "---":
            fm += 1
            continue
        if fm >= 2 and not ln.startswith("|") and not ln.startswith("![") :
            out.append(re.sub(r"https?://[^ )]+", "", ln))
    return "\n".join(out)

def frontmatter(path):
    raw = open(path, encoding="utf-8", errors="ignore").read()
    m = re.match(r"^---\n(.*?)\n---", raw, re.S)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        mm = re.match(r'^([a-zA-Z_]+):\s*"?([^"]*)"?\s*$', line)
        if mm:
            fm[mm.group(1)] = mm.group(2).strip()
    return fm

def read_primary_keyword(article_id):
    """从 state brief 读 primary_keyword(纯文本解析,无 yaml 依赖)。"""
    brief = os.path.expanduser(
        f"~/.claude/state/toolporto-writer/{article_id}/brief.yaml")
    if not os.path.isfile(brief):
        return None
    for line in open(brief, encoding="utf-8"):
        m = re.match(r"^\s{2}primary_keyword:\s*\"?([^\"]+)\"?\s*$", line)
        if m:
            return m.group(1).strip()
    return None

def main():
    if len(sys.argv) < 2:
        print("用法: python3 check-prose-metrics.py <target-file> [article-id]")
        return 1
    path = sys.argv[1]
    article_id = sys.argv[2] if len(sys.argv) > 2 else None
    body = body_text(path)
    words = len(body.split())
    issues = []

    # 1) em dash 密度
    ed = body.count("—")
    density = ed * 100.0 / words if words else 0
    print(f"em dash: {ed} / {words} 词 = {density:.2f}/100 (上限 1.0)")
    if density > 1.0:
        issues.append(f"em dash 密度 {density:.2f} 超标, 需 ≤1.0 (砍到 {int(words/100)} 个以内)")

    # 2) AI 词
    hits = re.findall(AI_WORDS, body, re.I)
    print(f"AI 词命中: {len(hits)}" + (f" -> {hits}" if hits else ""))
    if hits:
        issues.append("AI 词命中需为 0, 见上方列表")

    # 3) description 长度 (compare 页无 description 字段, 跳过)
    fm = frontmatter(path)
    typ = "blog"
    if "/reviews/" in path or path.startswith("reviews/"):
        typ = "review"
    elif "/compare/" in path or path.startswith("compare/"):
        typ = "compare"
    if typ != "compare":
        desc = fm.get("description", "")
        print(f"description: {len(desc)} chars (要求 110-165)")
        if len(desc) < 110 or len(desc) > 165:
            issues.append(f"description 长度 {len(desc)} 超出 110-165")

    # 4) review name 检查
    if typ == "review" and re.search(r"review", fm.get("name", ""), re.I):
        issues.append("review name 含 'Review', 页面模板会重复拼标题")

    # 5) 关键词密度 (advisory)
    kw = read_primary_keyword(article_id) if article_id else None
    if kw:
        STOP = {"is", "a", "an", "the", "to", "for", "of", "how", "what", "use",
                "vs", "good", "in", "on", "with", "and", "or", "best", "which"}
        kw_main = next((w for w in kw.split() if w not in STOP), kw.split()[0])
        kc = len(re.findall(re.escape(kw_main), body, re.I))
        kd = kc * 100.0 / words if words else 0
        print(f"primary keyword '{kw_main}': {kc} 次 = {kd:.2f}% (参考 0.4-1.5%)")
        if kd < 0.3:
            issues.append(f"关键词 '{kw_main}' 密度偏低, 考虑自然补充")
    else:
        print("primary keyword: 未提供 article-id 或 brief 缺失 (跳过)")

    if issues:
        print("\n❌ 发现问题:")
        for i in issues:
            print("  -", i)
        return 1
    print("\n✅ 全部指标通过")
    return 0

if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
# category-stats.sh — 分类健康度仪表盘（动态派生，python3 单遍聚合版）
# 从实际内容中提取所有分类，不硬编码
# Usage: bash scripts/category-stats.sh   (shebang 直接执行亦可)
# 退出码: 0=始终 (信息展示)
#
# 2026-09-03: 重写为单遍聚合 python3 版。旧 bash 版对每个分类嵌套遍历
# 全部文件并多次 fork awk（O(分类×文件) 进程派生），251 文件 × 11 分类
# 耗时 100s+；新版 <0.5s。输出格式与 validator 依赖的标记行保持不变。

import glob
import os
import re
import sys

CONTENT_ROOT = "content"


def get_category_name(slug):
    """优先读 content/categories/<slug>.mdx 的 name，否则由 slug 生成标题。"""
    f = os.path.join(CONTENT_ROOT, "categories", slug + ".mdx")
    if os.path.isfile(f):
        with open(f, encoding="utf-8") as fh:
            for line in fh:
                m = re.match(r'^name:\s*"?([^"]*)"?\s*$', line)
                if m:
                    return m.group(1).strip()
    return slug.replace("-", " ").title()


def extract_meta(path, date_field):
    """每文件一次扫描, 返回 (category, date)。"""
    cat = ""
    date = ""
    with open(path, encoding="utf-8", errors="ignore") as fh:
        for line in fh:
            m = re.match(r'^category:\s*"?([^"]*)"?\s*$', line)
            if m:
                cat = m.group(1).strip()
            d = re.match(r'^' + re.escape(date_field) + r':\s*"?([^"]*)"?\s*$', line)
            if d:
                date = d.group(1).strip()
    return cat, date


review_count, blog_count, compare_count = {}, {}, {}
cat_latest = {}
review_slug_cat = {}

# 1) reviews
for f in glob.glob(os.path.join(CONTENT_ROOT, "reviews", "*.mdx")):
    cat, d = extract_meta(f, "lastUpdated")
    if not cat:
        continue
    review_count[cat] = review_count.get(cat, 0) + 1
    if d and (cat not in cat_latest or d > cat_latest[cat]):
        cat_latest[cat] = d
    review_slug_cat[os.path.basename(f)[:-4]] = cat

# 2) blogs
for f in glob.glob(os.path.join(CONTENT_ROOT, "blog", "*.mdx")):
    cat, d = extract_meta(f, "date")
    if not cat:
        continue
    blog_count[cat] = blog_count.get(cat, 0) + 1
    if d and (cat not in cat_latest or d > cat_latest[cat]):
        cat_latest[cat] = d

# compare 归类: 文件名包含 review slug(最长 slug 优先,避免子串误匹配)
review_slugs = sorted(review_slug_cat, key=len, reverse=True)
for f in glob.glob(os.path.join(CONTENT_ROOT, "compare", "*.mdx")):
    fname = os.path.basename(f)[:-4]
    d = extract_meta(f, "lastUpdated")[1]
    cat = next((review_slug_cat[s] for s in review_slugs if s in fname), "")
    if not cat:
        continue
    compare_count[cat] = compare_count.get(cat, 0) + 1
    if d and (cat not in cat_latest or d > cat_latest[cat]):
        cat_latest[cat] = d

# 3) 输出
slugs = sorted(set(review_count) | set(blog_count))

print("========================================")
print("Category Health Dashboard")
print(f"  (derived from content — {len(slugs)} categories)")
print("========================================")
print()
print(f"  {'CATEGORY':<18}  {'REVIEWS':>7}  {'BLOG':>5}  {'COMPARE':>7}  {'LAST UPD':>8}")
print(f"  {'------------------':<18}  {'-------':>7}  {'-----':>5}  {'-------':>7}  {'--------':>8}")

for slug in slugs:
    name = get_category_name(slug)
    reviews = review_count.get(slug, 0)
    blogs = blog_count.get(slug, 0)
    compares = compare_count.get(slug, 0)
    latest = (cat_latest.get(slug) or "")[:10] or "—"
    total = reviews + blogs
    if total >= 8:
        health = "🟢"
    elif total >= 4:
        health = "🟡"
    else:
        health = "🔴"
    print(f"  {health} {name:<16}  {reviews:>7d}  {blogs:>5d}  {compares:>7d}  {latest:>8}")

print()
print("========================================")
print("LEGEND")
print("========================================")
print("  🟢 ≥8 articles — healthy, maintain cadence")
print("  🟡 4-7 articles — growing, 1-2 more needed")
print("  🔴 <4 articles — thin, priority for new content")
print()
print("📋 To add a new category:")
print('   1. Write a review with: category: "your-new-category"')
print("   2. (Optional) Create content/categories/your-new-category.mdx")
print("      with name and description in frontmatter")

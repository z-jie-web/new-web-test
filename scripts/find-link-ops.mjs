#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const contentRoot = 'content';
const input = process.argv[2];

if (!input) {
  console.error('Usage: find-link-ops <new-article-path-or-slug>');
  process.exit(2);
}

function readMdx(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  return {
    file,
    relpath: file.replace(/^content\//, ''),
    slug: parsed.data.slug || path.basename(file, '.mdx'),
    name: parsed.data.name || parsed.data.title || path.basename(file, '.mdx'),
    category: parsed.data.category || '',
    frontmatter: parsed.data,
    content: parsed.content,
  };
}

function resolveInput(target) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    return target;
  }
  for (const dir of ['reviews', 'blog', 'compare']) {
    const candidate = path.join(contentRoot, dir, `${target}.mdx`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function listFiles(dir) {
  const abs = path.join(contentRoot, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => path.join(abs, name));
}

function sanitizeInline(text) {
  return text.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
}

function stripCodeBlocks(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ');
}

function stripNoiseLines(text) {
  return text
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (trimmed.startsWith('|')) return false;
      if (trimmed.startsWith('![')) return false;
      if (trimmed.startsWith('#')) return false;
      return true;
    })
    .join('\n');
}

function extractContext(text, needle) {
  const normalized = text.replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();
  const target = needle.toLowerCase();
  const idx = lower.indexOf(target);
  if (idx === -1) return '';
  const before = normalized.slice(0, idx).trim().split(/\s+/).filter(Boolean).slice(-10);
  const match = normalized.slice(idx, idx + needle.length);
  const after = normalized.slice(idx + needle.length).trim().split(/\s+/).filter(Boolean).slice(0, 10);
  return sanitizeInline(`${before.join(' ')} ${match} ${after.join(' ')}`.trim());
}

function detectReplaceCandidate(content, articlePath, needle) {
  const safeNeedle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripped = stripNoiseLines(stripCodeBlocks(content));
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const match of stripped.matchAll(linkRegex)) {
    const text = match[1];
    const href = match[2];
    if (href === articlePath) continue;
    if (new RegExp(`\\b${safeNeedle}\\b`, 'i').test(text)) {
      return {
        mention: sanitizeInline(text),
        context: extractContext(stripped, text),
        source: href,
      };
    }
  }

  const noLinks = stripped.replace(linkRegex, ' ');
  const plainMatch = new RegExp(`\\b${safeNeedle}\\b`, 'i').exec(noLinks);
  if (plainMatch) {
    return {
      mention: plainMatch[0],
      context: extractContext(noLinks, plainMatch[0]),
      source: 'plain-text',
    };
  }
  return null;
}

const file = resolveInput(input);
if (!file) {
  console.error(`❌ Article not found: ${input}`);
  console.error('   Searched: content/reviews/ content/blog/ content/compare/');
  process.exit(2);
}

const article = readMdx(file);
let articleType = 'review';
if (file.includes('/blog/')) articleType = 'blog';
if (file.includes('/compare/')) articleType = 'compare';

let articleCategory = article.category;
let articleSlug = article.slug;
let articleName = article.name;

if (articleType === 'compare') {
  const toolA = article.frontmatter.toolA;
  const toolB = article.frontmatter.toolB;
  const reviewA = toolA ? path.join(contentRoot, 'reviews', `${toolA}.mdx`) : '';
  if (reviewA && fs.existsSync(reviewA)) {
    articleCategory = readMdx(reviewA).category;
  }
  articleSlug = article.slug || path.basename(file, '.mdx');
  articleName = article.name;
}

const articlePath =
  articleType === 'review' ? `/reviews/${articleSlug}` :
  articleType === 'compare' ? `/compare/${articleSlug}` :
  `/blog/${articleSlug}`;

const candidates = [];
if (articleCategory) {
  for (const review of listFiles('reviews')) {
    if (review !== file && readMdx(review).category === articleCategory) candidates.push(review);
  }
  for (const blog of listFiles('blog')) {
    if (blog !== file && readMdx(blog).category === articleCategory) candidates.push(blog);
  }
  for (const compare of listFiles('compare')) {
    if (compare === file) continue;
    const mdx = readMdx(compare);
    const reviewA = mdx.frontmatter.toolA ? path.join(contentRoot, 'reviews', `${mdx.frontmatter.toolA}.mdx`) : '';
    if (reviewA && fs.existsSync(reviewA) && readMdx(reviewA).category === articleCategory) candidates.push(compare);
  }
}

console.log('========================================');
console.log('Backlink Opportunity Finder');
console.log('========================================');
console.log('');
console.log(`New article:  ${articleName} (${articleSlug})`);
console.log(`Category:     ${articleCategory || 'N/A'}`);
console.log(`Type:         ${articleType}`);
console.log('');

if (candidates.length === 0) {
  console.log('ℹ️  No other articles in the same category to check.');
  process.exit(0);
}

console.log(`▶ Checking ${candidates.length} articles in '${articleCategory}'...`);
console.log('');

const linked = [];
const replace = [];
const missing = [];

for (const candidateFile of candidates) {
  const target = readMdx(candidateFile);
  const body = stripCodeBlocks(target.content);
  if (body.includes(articlePath)) {
    linked.push(target);
    continue;
  }

  const replacement = detectReplaceCandidate(target.content, articlePath, articleType === 'review' ? articleName : articleName);
  if (replacement) {
    replace.push({ target, ...replacement });
  } else {
    missing.push(target);
  }
}

console.log(`CANDIDATE_REPLACE (${replace.length})`);
console.log('========================================');
if (replace.length === 0) {
  console.log('  (none)');
} else {
  for (const item of replace) {
    console.log(`  REPLACE|content/${item.target.relpath}|${sanitizeInline(item.target.name)}|${sanitizeInline(item.mention)}|${sanitizeInline(item.context)}|${sanitizeInline(item.source)}`);
  }
}
console.log('');

console.log(`MISSING BACKLINKS (${missing.length})`);
console.log('========================================');
if (missing.length === 0) {
  console.log('  🎉 All linked or replaceable. No additive opportunities found.');
} else {
  for (const item of missing) {
    console.log(`  MISSING|content/${item.relpath}|${sanitizeInline(item.name)}`);
  }
}
console.log('');

console.log(`ALREADY LINKED (${linked.length})`);
console.log('========================================');
if (linked.length === 0) {
  console.log('  (none)');
} else {
  for (const item of linked) {
    console.log(`  LINKED|content/${item.relpath}|${sanitizeInline(item.name)}`);
  }
}

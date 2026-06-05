import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

const WORDS_PER_MINUTE = 238;

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function fileMtime(
  type: 'reviews' | 'blog' | 'compare' | 'categories',
  slug: string
): Date | null {
  const relPath = path.join('content', type, `${slug}.mdx`);
  const absPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) return null;

  try {
    // git log 获取文件最后修改时间（Vercel CI 环境 fs mtime 不可靠）
    const cwd = process.cwd();
    const ts = execSync(`git log -1 --format=%ct -- "${relPath}"`, {
      encoding: 'utf-8',
      cwd,
    }).trim();
    if (ts && /^\d+$/.test(ts)) {
      return new Date(parseInt(ts, 10) * 1000);
    }
  } catch {
    // git 不可用时 fallback
  }

  return fs.statSync(absPath).mtime;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

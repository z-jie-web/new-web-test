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
  const filePath = path.join(CONTENT_ROOT, type, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  try {
    // 用 git log 获取文件最后修改时间（Vercel CI 环境 mtime 不可靠）
    const ts = execSync(
      `git log -1 --format="%ct" -- "${filePath}"`,
      { encoding: 'utf-8', timeout: 3000 }
    ).trim();
    if (ts) return new Date(parseInt(ts, 10) * 1000);
  } catch {
    // git 不可用时 fallback 到文件系统 mtime
  }

  return fs.statSync(filePath).mtime;
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

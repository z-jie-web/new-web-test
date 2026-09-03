'use client';

import { useState } from 'react';
import { Link as LinkIcon, Check, Share2 } from 'lucide-react';

const SITE_URL_FALLBACK = 'https://toolporto.com';

/**
 * 文章分享按钮(X / LinkedIn / 复制链接)。
 * 用 intent URL,不需要平台账号接入;title/url 在客户端取。
 */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window === 'undefined') return SITE_URL_FALLBACK;
    return window.location.href;
  };

  const shareText = encodeURIComponent(title);
  const xUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(getUrl())}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const btn =
    'inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6">
      <span className="text-xs font-semibold text-muted-foreground mr-1">
        Share:
      </span>
      <a
        className={btn}
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        <Share2 className="h-3.5 w-3.5" />
        Post to X
      </a>
      <a
        className={btn}
        href={liUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
      >
        <Share2 className="h-3.5 w-3.5" />
        LinkedIn
      </a>
      <button className={btn} onClick={copy} type="button">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" />
            Copied
          </>
        ) : (
          <>
            <LinkIcon className="h-3.5 w-3.5" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';

function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

const EXT_CANDIDATES = ['svg', 'png'];

export function ToolLogo({
  slug,
  name,
  size = 40,
  className,
}: {
  slug: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={
          'inline-flex shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-sm font-bold ' +
          (className ?? '')
        }
        style={{ width: size, height: size }}
        aria-hidden
      >
        {initials(name)}
      </span>
    );
  }

  const ext = EXT_CANDIDATES[extIndex];
  const src = `/logos/${slug}.${ext}`;

  return (
    <span
      className={
        'inline-flex shrink-0 items-center justify-center rounded-md bg-white/5 overflow-hidden ' +
        (className ?? '')
      }
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        unoptimized
        className="object-contain w-full h-full p-1"
        onError={() => {
          if (extIndex < EXT_CANDIDATES.length - 1) {
            setExtIndex((i) => i + 1);
          } else {
            setFailed(true);
          }
        }}
      />
    </span>
  );
}

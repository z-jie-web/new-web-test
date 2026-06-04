import Image from 'next/image';
import Link from 'next/link';
import type { AnchorHTMLAttributes, HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function nodeToText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return props ? nodeToText(props.children ?? '') : '';
  }
  return '';
}

function HeadingWithId({
  level,
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement> & { level: 2 | 3 }) {
  const Tag = (level === 2 ? 'h2' : 'h3') as 'h2' | 'h3';
  const text = nodeToText(children);
  const id = slugify(text);
  return (
    <Tag id={id} {...rest}>
      {children}
    </Tag>
  );
}

function MdxImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt = '', width, height, className } = props;

  if (typeof src !== 'string' || src.length === 0) return null;

  const isLogo = src.startsWith('/logos/');
  const w = typeof width === 'number' ? width : parseInt(String(width || ''), 10);
  const h = typeof height === 'number' ? height : parseInt(String(height || ''), 10);

  if (Number.isFinite(w) && Number.isFinite(h)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        className={className}
        unoptimized={src.endsWith('.svg')}
      />
    );
  }

  if (isLogo) {
    return (
      <Image
        src={src}
        alt={alt}
        width={140}
        height={40}
        className={
          'inline-block align-middle !my-0 mx-2 h-10 w-auto' +
          (className ? ` ${className}` : '')
        }
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={630}
      className={className}
      unoptimized={src.endsWith('.svg')}
    />
  );
}

function MdxLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { href = '', children, ...rest } = props;
  const isInternal = href.startsWith('/') || href.startsWith('#');

  if (isInternal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  img: MdxImage,
  a: MdxLink,
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <HeadingWithId level={2} {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <HeadingWithId level={3} {...props} />
  ),
};



import Image from 'next/image';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';

function MdxImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt = '', width, height, className, ...rest } = props;

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
      <span
        className={
          'relative inline-block align-middle h-10 w-32' +
          (className ? ` ${className}` : '')
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="128px"
          unoptimized={src.endsWith('.svg')}
        />
      </span>
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
};


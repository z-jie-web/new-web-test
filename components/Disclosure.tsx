import Link from 'next/link';

export function Disclosure() {
  return (
    <aside className="mt-12 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <strong className="font-semibold">Disclosure:</strong> Some links on this
      page may contain affiliate partnerships. We may earn a commission if you
      buy something at no extra cost to you. We only recommend tools we&apos;ve
      tested.{' '}
      <Link href="/disclaimer" className="underline hover:text-slate-900 dark:hover:text-slate-200">
        Learn more
      </Link>
      .
    </aside>
  );
}

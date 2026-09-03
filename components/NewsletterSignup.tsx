'use client';

import { useState, type FormEvent } from 'react';

/**
 * Newsletter 订阅表单 — 提交到 /api/subscribe(转发 Buttondown)。
 * 未配置 BUTTONDOWN_API_KEY 时渲染为不可用状态并提示。
 */
export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setState('done');
      } else if (res.status === 503) {
        setError('Newsletter is coming soon. Drop us a line via the contact page.');
        setState('error');
      } else {
        setError('Something went wrong. Please try again.');
        setState('error');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-5 py-4 text-sm text-green-600">
        ✅ You are in! Watch your inbox for the next ToolPorto digest.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? '' : 'rounded-xl border bg-accent/30 p-5'}>
      <p className="font-semibold text-sm mb-1">
        Get the weekly AI tool digest
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        New reviews and comparisons every week. No spam, unsubscribe anytime.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={state === 'loading'}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </form>
  );
}

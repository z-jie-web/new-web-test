import { NextResponse } from 'next/server';

/**
 * Newsletter 订阅 — 转发到 Buttondown API。
 * 需要环境变量 BUTTONDOWN_API_KEY(在 Vercel/本地 .env 配置)。
 * 未配置时返回 503,前端组件会优雅降级。
 */
export async function POST(req: Request) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Newsletter not configured yet' },
      { status: 503 }
    );
  }

  let email = '';
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        type: 'regular',
      }),
    });

    if (res.status === 201 || res.status === 200) {
      return NextResponse.json({ ok: true });
    }
    // Buttondown 返回 400 时通常是重复订阅,也视为成功(用户已在列表)
    if (res.status === 400) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json(
      { ok: false, error: `Provider error ${res.status}` },
      { status: 502 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: 'Network error' }, { status: 502 });
  }
}

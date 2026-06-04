import { ImageResponse } from 'next/og';
import { getComparePair } from '@/lib/compare';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const a = searchParams.get('a') ?? '';
  const b = searchParams.get('b') ?? '';
  const pair = a && b ? getComparePair(a, b) : null;
  const nameA = pair?.a.name ?? a ?? 'Tool A';
  const nameB = pair?.b.name ?? b ?? 'Tool B';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0b0f19 0%, #1a1f2e 100%)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#f59e0b',
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          TOOLPORTO COMPARE
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 60,
            flex: 1,
          }}
        >
          <div style={{ flex: 1, fontSize: 84, fontWeight: 900, textAlign: 'center', lineHeight: 1.05 }}>
            {nameA}
          </div>
          <div style={{ fontSize: 96, fontWeight: 900, color: '#f59e0b', padding: '0 30px' }}>
            VS
          </div>
          <div style={{ flex: 1, fontSize: 84, fontWeight: 900, textAlign: 'center', lineHeight: 1.05 }}>
            {nameB}
          </div>
        </div>
        <div style={{ fontSize: 28, color: '#64748b', marginTop: 'auto', textAlign: 'center' }}>
          toolporto.com — Which Should You Choose in 2026?
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

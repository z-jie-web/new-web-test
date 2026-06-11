import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ToolPorto';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(to bottom right, #0b0f19, #1a1f2e)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            marginBottom: 20,
            color: '#10b981',
          }}
        >
          ToolPorto
        </div>
        <div style={{ fontSize: 32, color: '#94a3b8' }}>
          Discover the best online tools & AI products
        </div>
      </div>
    ),
    { ...size }
  );
}

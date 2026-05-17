'use client';

interface RingoLogoProps {
  size?: number;
  light?: boolean;
}

export function RingoLogo({ size = 28, light = false }: RingoLogoProps) {
  const textColor = light ? '#fff' : '#0f1535';
  const dotColor  = light ? 'rgba(255,255,255,0.9)' : '#7c3aed';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
      <div
        style={{
          width: size, height: size, borderRadius: size * 0.32,
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: light ? 'none' : '0 6px 16px -6px rgba(124,58,237,0.5)',
        }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
          <path d="M6 18l4-4-4-4M13 18h5" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-manrope), system-ui, sans-serif',
          fontWeight: 800, fontSize: size * 0.75,
          letterSpacing: '-0.03em', color: textColor,
        }}
      >
        ringo
        <span style={{ color: dotColor }}>.</span>
      </span>
    </div>
  );
}

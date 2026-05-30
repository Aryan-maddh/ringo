'use client';

import React from 'react';

interface RingoLogoProps {
  size?: number;
  light?: boolean;
}

// AI sparkle — the modern "AI" signifier (4-point star with concave sides).
function Sparkle({ size, glow, className }: { size: number; glow?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}
      style={glow ? { filter: 'drop-shadow(0 0 2px rgba(125,211,252,0.95))' } : undefined}>
      <path d="M12 1.5 Q13.1 10.9 22.5 12 Q13.1 13.1 12 22.5 Q10.9 13.1 1.5 12 Q10.9 10.9 12 1.5 Z" fill="#fff" />
    </svg>
  );
}

// Brand mark: glassy gradient tile with depth, a bold modern "R", and a glowing
// AI sparkle — built to read like a modern AI SaaS product.
export function RingoLogo({ size = 28, light = false }: RingoLogoProps) {
  const textColor = light ? '#fff' : '#0f1535';
  const ic = size;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: ic * 0.34, userSelect: 'none' }}>
      {/* Icon tile */}
      <div style={{
        position: 'relative',
        width: ic, height: ic,
        borderRadius: ic * 0.32,
        background: 'linear-gradient(145deg, #8b5cf6 0%, #6d28d9 48%, #0891b2 100%)',
        boxShadow: light
          ? 'inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 1px rgba(255,255,255,0.25)'
          : '0 6px 18px -4px rgba(109,40,217,0.6), 0 1px 2px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 1px rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* glassy top sheen */}
        <span aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 42%)',
          pointerEvents: 'none',
        }} />
        {/* soft inner glow lower-right (cyan) */}
        <span aria-hidden style={{
          position: 'absolute', right: '-20%', bottom: '-25%',
          width: '70%', height: '70%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.55) 0%, rgba(34,211,238,0) 70%)',
          pointerEvents: 'none',
        }} />

        {/* The R — gradient fill (white → cyan) for a refined, less-flat look */}
        <span style={{
          position: 'relative',
          fontFamily: 'var(--font-manrope), system-ui, sans-serif',
          fontWeight: 700,
          fontSize: ic * 0.66,
          lineHeight: 1,
          letterSpacing: '-0.05em',
          backgroundImage: 'linear-gradient(165deg, #ffffff 35%, #a5f3fc 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          filter: 'drop-shadow(0 1px 2px rgba(12,8,40,0.3))',
          transform: `translateX(${-ic * 0.015}px)`,
        }}>R</span>

        {/* glowing AI sparkle, top-right (twinkles) */}
        <span style={{ position: 'absolute', top: ic * 0.085, right: ic * 0.085, lineHeight: 0 }}>
          <Sparkle size={ic * 0.34} glow className="r-logo-sparkle" />
        </span>
        {/* tiny secondary sparkle (twinkles, offset) */}
        <span style={{ position: 'absolute', top: ic * 0.3, right: ic * 0.05, lineHeight: 0 }}>
          <Sparkle size={ic * 0.14} className="r-logo-sparkle r-logo-sparkle--2" />
        </span>
      </div>

      {/* Wordmark: "Ripe" + gradient "Lead" + refined ".ai" suffix (domain-style) */}
      <div style={{
        fontFamily: 'var(--font-manrope), system-ui, sans-serif',
        fontSize: size * 0.84,
        lineHeight: 1,
        letterSpacing: '-0.035em',
        display: 'flex',
        alignItems: 'baseline',
        gap: size * 0.13,
      }}>
        <span style={{ fontWeight: 600, color: textColor }}>Ripe</span>
        <span style={{
          fontWeight: 800,
          backgroundImage: 'linear-gradient(110deg, #a78bfa 0%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}>Lead</span>
        {/* .ai — lighter, muted, kerned tight like a domain TLD */}
        <span style={{
          fontWeight: 500,
          fontSize: size * 0.62,
          letterSpacing: '-0.02em',
          marginLeft: -size * 0.07,
          color: light ? 'rgba(255,255,255,0.5)' : '#94a3b8',
        }}>.ai</span>
      </div>
    </div>
  );
}

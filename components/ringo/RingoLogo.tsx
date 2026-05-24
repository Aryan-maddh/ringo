'use client';

import React from 'react';
import { Bot, Check } from 'lucide-react';

interface RingoLogoProps {
  size?: number;
  light?: boolean;
}

export function RingoLogo({ size = 28, light = false }: RingoLogoProps) {
  const textColor  = light ? '#fff' : '#0f1535';
  const accentColor = '#7c3aed';
  const ic = size;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, userSelect: 'none' }}>
      {/* Icon: gradient rounded square with Bot icon */}
      <div style={{ position: 'relative', width: ic, height: ic, flexShrink: 0 }}>
        {/* Background tile */}
        <div style={{
          width: ic, height: ic,
          borderRadius: ic * 0.3,
          background: 'linear-gradient(145deg, #7c3aed 0%, #5b21b6 60%, #0ea5e9 100%)',
          boxShadow: light ? 'none' : '0 4px 14px -4px rgba(124,58,237,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={ic * 0.55} color="#fff" strokeWidth={2} />
        </div>
        {/* Cyan check badge, bottom-right */}
        <div style={{
          position: 'absolute', bottom: -2, right: -3,
          width: ic * 0.42, height: ic * 0.42,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
          border: `${ic * 0.06}px solid ${light ? 'transparent' : '#fff'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={ic * 0.22} color="#fff" strokeWidth={3} />
        </div>
      </div>

      {/* Wordmark: "Ripe" plain + "Lead" bold purple */}
      <div style={{
        fontFamily: 'var(--font-manrope), system-ui, sans-serif',
        fontSize: size * 0.82,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        display: 'flex',
        alignItems: 'baseline',
        gap: size * 0.12,
      }}>
        <span style={{ fontWeight: 500, color: textColor }}>Ripe</span>
        <span style={{ fontWeight: 800, color: accentColor }}>Lead</span>
      </div>
    </div>
  );
}

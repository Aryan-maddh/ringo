'use client';

import React from 'react';

type Tone = 'info' | 'success' | 'danger' | 'warn' | 'violet' | 'neutral';

const STYLES: Record<Tone, { bg: string; color: string; dot: string }> = {
  info:    { bg: '#e0f2fe', color: '#0369a1', dot: '#0284c7' },
  success: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  danger:  { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  warn:    { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  violet:  { bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed' },
  neutral: { bg: '#f1f3f9', color: '#3d4466', dot: '#7d829c' },
};

interface PillProps {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
}

export function Pill({ tone = 'neutral', dot = true, children }: PillProps) {
  const s = STYLES[tone];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 99,
        background: s.bg, color: s.color,
        fontSize: 11.5, fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}

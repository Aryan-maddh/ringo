'use client';

import React from 'react';

const PALETTE = [
  'linear-gradient(135deg,#7c3aed,#06b6d4)',
  'linear-gradient(135deg,#059669,#06b6d4)',
  'linear-gradient(135deg,#fb923c,#fbbf24)',
  'linear-gradient(135deg,#e11d48,#fb923c)',
  'linear-gradient(135deg,#0284c7,#38bdf8)',
  'linear-gradient(135deg,#db2777,#f472b6)',
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 36 }: AvatarProps) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: colorFor(name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700,
        fontSize: Math.max(10, size * 0.36),
        flexShrink: 0, userSelect: 'none',
      }}
    >
      {initials(name)}
    </div>
  );
}

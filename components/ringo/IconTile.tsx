'use client';

import React from 'react';

interface IconTileProps {
  grad: string;
  size?: number;
  radius?: number;
  children: React.ReactNode;
}

export function IconTile({ grad, size = 36, radius = 10, children }: IconTileProps) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius,
        background: grad, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

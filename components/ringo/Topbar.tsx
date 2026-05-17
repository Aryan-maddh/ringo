'use client';

import { useRouter } from 'next/navigation';
import { RINGO } from './tokens';
import { Icon, ICONS } from './Icon';
import { Avatar } from './Avatar';

interface TopbarProps {
  title?: string;
  sub?: string;
}

export function Topbar({ title, sub }: TopbarProps) {
  const router = useRouter();
  return (
    <div
      className="r-topbar"
      style={{
        height: 64, flex: '0 0 64px',
        background: '#fff', borderBottom: `1px solid ${RINGO.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 28px', gap: 14, fontFamily: RINGO.font.ui,
      }}
    >
      {title ? (
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: RINGO.ink }}>
            {title}
          </div>
          {sub && <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 1 }}>{sub}</div>}
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: RINGO.ink3 }}>
            <span style={{ fontWeight: 600, color: RINGO.ink }}>Good morning, Marco.</span>{' '}
            Here&apos;s what&apos;s happening today.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => router.push('/inbox')}
          style={{
            width: 36, height: 36, borderRadius: 9,
            border: `1px solid ${RINGO.border}`, background: '#fff',
            color: RINGO.ink2, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon d={ICONS.search} size={15} />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => router.push('/inbox')}
            style={{
              width: 36, height: 36, borderRadius: 9,
              border: `1px solid ${RINGO.border}`, background: '#fff',
              color: RINGO.ink2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon d={ICONS.bell} size={15} />
          </button>
          <span
            style={{
              position: 'absolute', top: -3, right: -3,
              width: 16, height: 16, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}
          >
            3
          </span>
        </div>
        <button
          onClick={() => router.push('/settings')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Avatar name="Marco Reyes" size={32} />
        </button>
      </div>
    </div>
  );
}

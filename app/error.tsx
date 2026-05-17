'use client';

import { useEffect } from 'react';
import { RINGO } from '@/components/ringo/tokens';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // log to error reporting service in production
  }, [error]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: RINGO.bg, fontFamily: RINGO.font.ui, padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: RINGO.font.head, fontSize: 26, fontWeight: 700, color: RINGO.ink, margin: '0 0 12px' }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: RINGO.ink3, lineHeight: 1.6, marginBottom: 24 }}>
          An unexpected error occurred. If this keeps happening, please contact support.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{ padding: '11px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: 600, boxShadow: '0 8px 18px -8px rgba(124,58,237,0.5)' }}
          >
            Try again
          </button>
          <a
            href="/dashboard"
            style={{ padding: '11px 20px', borderRadius: 10, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

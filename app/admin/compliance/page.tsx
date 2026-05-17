'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { Pill } from '@/components/ringo/Pill';
import { RINGO } from '@/components/ringo/tokens';

const CHECKS = [
  { l: 'A2P 10DLC registration',      s: 'All tenants registered', tone: 'success' as const, detail: '1,847 brands · 2,341 campaigns' },
  { l: 'STOP / UNSUBSCRIBE handling', s: 'Enforced platform-wide', tone: 'success' as const, detail: '312 opt-outs processed this month' },
  { l: 'Quiet hours enforcement',      s: 'Active on all numbers',  tone: 'success' as const, detail: '8 AM – 9 PM caller-local' },
  { l: 'STIR/SHAKEN attestation',      s: '3 numbers need review',  tone: 'warn' as const,    detail: 'Attestation level C — action needed' },
  { l: 'SMS content filtering',        s: 'Carrier-compliant',      tone: 'success' as const, detail: '0 blocked sends today' },
  { l: 'Data retention policy',        s: 'Pending review',         tone: 'warn' as const,    detail: 'Policy update due 2026-06-01' },
];

export default function AdminCompliancePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [resolved, setResolved] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  const active = reviewing !== null ? CHECKS[reviewing] : null;

  function markResolved() {
    if (reviewing === null) return;
    setResolved(s => { const n = new Set(s); n.add(reviewing); return n; });
    setReviewing(null);
  }

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="cmp" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar title="Compliance" sub="Platform-wide TCPA, A2P, and data-handling status." breadcrumb={['Admin', 'Compliance']} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { l: 'Compliance score', v: '94/100', d: '+2 this month', g: RINGO.g3, ic: ICONS.shld },
              { l: 'Open issues',      v: '2',      d: 'Need attention', g: RINGO.g2, ic: ICONS.flag },
              { l: 'Opt-outs this mo', v: '312',    d: '−18% vs last',  g: RINGO.g1, ic: ICONS.x },
            ].map((c, i) => (
              <div key={i} style={{ borderRadius: 14, padding: '18px 20px', color: '#fff', background: c.g, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -24, top: -24, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={c.ic} size={14} /></div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>{c.l}</span>
                </div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.v}</div>
                <div style={{ fontSize: 12, opacity: 0.88, marginTop: 5 }}>{c.d}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${RINGO.border}` }}>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700 }}>Compliance checks</div>
              <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 4 }}>Platform-level status across all tenants</div>
            </div>
            {CHECKS.map((c, i) => {
              const isResolved = resolved.has(i);
              const tone = isResolved ? 'success' : c.tone;
              const status = isResolved ? 'Resolved' : c.s;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < CHECKS.length - 1 ? `1px solid ${RINGO.border}` : 'none' }}>
                  <IconTile grad={tone === 'success' ? RINGO.iEme : RINGO.iAmb} size={36} radius={10}>
                    <Icon d={tone === 'success' ? ICONS.check : ICONS.flag} size={16} />
                  </IconTile>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: RINGO.ink }}>{c.l}</div>
                    <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 2 }}>{c.detail}</div>
                  </div>
                  <Pill tone={tone} dot>{status}</Pill>
                  <button
                    onClick={() => setReviewing(i)}
                    style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                    {isResolved ? 'View' : 'Review'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review modal */}
      {active !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setReviewing(null)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', width: 480, boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700 }}>Review: {active.l}</div>
              <button onClick={() => setReviewing(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: RINGO.ink3, fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 10, background: active.tone === 'warn' ? '#fffbeb' : '#f0fdf4', border: `1px solid ${active.tone === 'warn' ? '#fde68a' : '#bbf7d0'}`, marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: active.tone === 'warn' ? '#92400e' : '#065f46', marginBottom: 4 }}>{active.s}</div>
              <div style={{ fontSize: 13, color: active.tone === 'warn' ? '#92400e' : '#065f46' }}>{active.detail}</div>
            </div>
            <div style={{ fontSize: 13, color: RINGO.ink2, lineHeight: 1.6, marginBottom: 22 }}>
              {active.tone === 'warn'
                ? 'This item requires attention. Review the details above and mark as resolved once the underlying issue has been addressed.'
                : 'This compliance check is currently passing. No action is required at this time.'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setReviewing(null)}
                style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
              {!resolved.has(reviewing!) && (
                <button onClick={markResolved}
                  style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  Mark resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

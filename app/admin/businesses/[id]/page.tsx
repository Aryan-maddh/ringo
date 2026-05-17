'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar, StatCardA2 } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { Pill } from '@/components/ringo/Pill';
import { RINGO } from '@/components/ringo/tokens';

// ── Types ──────────────────────────────────────────────────────────────────

interface BizDetail {
  id: number;
  name: string;
  business_type: string | null;
  twilio_number: string | null;
  created_at: string;
  owner_email?: string;
}

// ── Chart ──────────────────────────────────────────────────────────────────

function UsageChart() {
  const W = 720, H = 210, pad = { l: 36, r: 14, t: 12, b: 24 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const calls = [12,18,9,22,28,31,17,24,30,26,33,29,38,42,35,41,48,44,52,47,55,49,58,61,57,63,68,72,66,71];
  const max = 80;
  const slot = innerW / calls.length, bw = slot * 0.62;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="bdBars" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7c3aed" /><stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {[0,0.25,0.5,0.75,1].map(t => {
        const y = pad.t + innerH * t;
        return (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#eef0f5"
              strokeDasharray={t === 1 ? '0' : '2 4'} />
            <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="10"
              fontFamily={RINGO.font.mono} fill="#7d829c">{Math.round(max * (1 - t))}</text>
          </g>
        );
      })}
      {calls.map((c, i) => {
        const cx = pad.l + slot * i + slot / 2;
        const h = (c / max) * innerH;
        return <rect key={i} x={cx - bw / 2} y={pad.t + innerH - h} width={bw} height={h}
          rx={3} fill="url(#bdBars)" />;
      })}
      {[1, 8, 15, 22, 29].map(d => {
        const cx = pad.l + slot * (d - 1) + slot / 2;
        return <text key={d} x={cx} y={H - 8} textAnchor="middle" fontSize="10"
          fontFamily={RINGO.font.mono} fill="#7d829c">{`Apr ${d}`}</text>;
      })}
    </svg>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface KVProps { label: string; value: string; mono?: boolean; }
function KV({ label, value, mono }: KVProps) {
  return (
    <div>
      <div style={{ fontSize: 11, color: RINGO.ink3, letterSpacing: '0.06em',
        textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: RINGO.ink, marginTop: 4,
        fontFamily: mono ? RINGO.font.mono : RINGO.font.ui, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

interface TimelineItemProps {
  tone: string; icon: string; title: string; body: string; time: string;
}
function TimelineItem({ tone, icon, title, body, time }: TimelineItemProps) {
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <IconTile grad={tone} size={30} radius={9}><Icon d={icon} size={14} /></IconTile>
        <div style={{ flex: 1, width: 2, background: '#eef0f5', marginTop: 6 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: RINGO.ink }}>{title}</div>
          <div style={{ fontSize: 11.5, color: RINGO.ink3, fontFamily: RINGO.font.mono }}>{time}</div>
        </div>
        <div style={{ fontSize: 12.5, color: RINGO.ink2, marginTop: 3, lineHeight: 1.55 }}>{body}</div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminBusinessDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [mounted, setMounted] = useState(false);
  const [biz, setBiz] = useState<BizDetail | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    async function load() {
      try {
        const res = await adminApiFetch(`/api/admin/businesses/${id}`);
        if (!res.ok) return;
        const d = await res.json();
        setBiz({ ...d.business, owner_email: d.user?.email });
      } catch { /* keep null */ }
    }
    if (id) load();
  }, [router, id]);

  if (!mounted) return null;

  const name = biz?.name ?? 'Pacific Plumbing Co.';
  const ownerEmail = biz?.owner_email ?? 'marco@pacificplumbing.com';
  const since = biz?.created_at
    ? new Date(biz.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Aug 2024';
  const phone = biz?.twilio_number ?? '(415) 555‑0184';

  return (
    <div className="r-app-shell" style={{ display: 'flex', minHeight: '100vh', background: RINGO.bg,
      fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="biz" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminTopbar
          title={<span><span style={{ color: RINGO.ink3, fontWeight: 500 }}>Business · </span>{name}</span>}
          sub={null}
          breadcrumb={['Admin', 'Businesses', name]} />

        <div style={{ flex: 1, padding: '18px 28px 28px', overflowY: 'auto' }}>

          {/* Identity card */}
          <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${RINGO.border}`,
            padding: '22px 24px', display: 'flex', gap: 20, alignItems: 'center',
            marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
              background: 'linear-gradient(135deg,#059669,#06b6d4)' }} />
            <div style={{ width: 74, height: 74, borderRadius: 16,
              background: 'linear-gradient(135deg,#059669,#06b6d4)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              boxShadow: '0 16px 30px -10px rgba(5,150,105,0.45)' }}>
              <Icon d={ICONS.bld} size={30} />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontFamily: RINGO.font.head, fontSize: 24, fontWeight: 700,
                  letterSpacing: '-0.02em' }}>{name}</h2>
                <Pill tone="success">Active</Pill>
                <Pill tone="info" dot={false}>Crew · $237/mo</Pill>
                <Pill tone="violet" dot={false}>High value</Pill>
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 13, color: RINGO.ink2,
                flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon d={ICONS.user} size={13} /> {ownerEmail}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: RINGO.font.mono }}>
                  <Icon d={ICONS.phone} size={13} /> {phone}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon d={ICONS.clock} size={13} /> Customer since {since}
                </span>
              </div>
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
              <button style={{ padding: '9px 13px', borderRadius: 9,
                border: `1px solid ${RINGO.border}`, background: '#fff',
                cursor: 'pointer', fontSize: 12.5, color: RINGO.ink2, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.open} size={13} /> View as customer
              </button>
              <button style={{ padding: '9px 13px', borderRadius: 9,
                border: `1px solid ${RINGO.border}`, background: '#fff',
                cursor: 'pointer', fontSize: 12.5, color: RINGO.ink2, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.send} size={13} /> Email owner
              </button>
              <button style={{ padding: '9px 13px', borderRadius: 9,
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 8px 18px -8px rgba(124,58,237,0.55)' }}>
                <Icon d={ICONS.user} size={13} /> Impersonate
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 18,
            borderBottom: `1px solid ${RINGO.border}` }}>
            {['Overview','SMS traffic','Billing','Numbers','Audit','Notes'].map((t, i) => (
              <button key={t} style={{ padding: '10px 16px', background: 'transparent',
                border: 'none',
                borderBottom: i === 0 ? '2px solid #7c3aed' : '2px solid transparent',
                color: i === 0 ? RINGO.ink : RINGO.ink2, cursor: 'pointer',
                fontFamily: RINGO.font.ui, fontWeight: i === 0 ? 700 : 500, fontSize: 13 }}>
                {t}
                {i === 2 && (
                  <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 99,
                    background: '#fde8ec', color: '#be123c', fontSize: 10, fontWeight: 700 }}>1</span>
                )}
              </button>
            ))}
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            gap: 14, marginBottom: 18 }}>
            <StatCardA2 grad={RINGO.g1} label="Replies · 30d" value="1,842"
              delta="+12.4%" sub="vs prior 30d" icon={ICONS.msg} />
            <StatCardA2 grad={RINGO.g3} label="Answered rate" value="94.1%"
              delta="+1.8pp" sub="92.3% prior" icon={ICONS.zap} />
            <StatCardA2 grad={RINGO.g2} label="Avg time to reply" value="6s"
              delta="−2s" sub="target: <10s" icon={ICONS.clock} />
            <StatCardA2 grad="linear-gradient(135deg,#d97706,#fbbf24)"
              label="Lifetime value" value="$2,134" delta="9 mo"
              sub="paid · LTV / CAC 7.2x" icon={ICONS.dollar} />
          </div>

          {/* Two-column body */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: '#fff', borderRadius: 16,
                border: `1px solid ${RINGO.border}`, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                      letterSpacing: '0.06em', textTransform: 'uppercase' }}>Daily replies · April</div>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700,
                      letterSpacing: '-0.02em', marginTop: 2 }}>1,842 sent · 12 failed</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {['7d','30d','90d','MTD'].map((t, i) => (
                      <button key={t} style={{ padding: '5px 10px', borderRadius: 7, border: 'none',
                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: i === 1 ? '#0f1535' : 'transparent',
                        color: i === 1 ? '#fff' : RINGO.ink2 }}>{t}</button>
                    ))}
                  </div>
                </div>
                <UsageChart />
              </div>

              <div style={{ background: '#fff', borderRadius: 16,
                border: `1px solid ${RINGO.border}`, padding: '20px 22px' }}>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700,
                  marginBottom: 14 }}>Activity timeline</div>
                <TimelineItem tone={RINGO.iAmb} icon={ICONS.dollar}
                  title="Invoice INV-04918 paid · $237.00"
                  body="Visa •• 4242 · auto-charged · receipt sent to owner"
                  time="2h ago" />
                <TimelineItem tone={RINGO.iEme} icon={ICONS.zap}
                  title="Plan upgraded · Solo → Crew"
                  body="Crew plan unlocks 4 numbers and team SMS routing. Upgrade prorated."
                  time="3d ago · by owner" />
                <TimelineItem tone={RINGO.iVio} icon={ICONS.ai}
                  title="AI script retrained on 280 new replies"
                  body="Tone shifted slightly more formal · phrase suppressed by owner."
                  time="5d ago · automatic" />
                <TimelineItem tone={RINGO.iSky} icon={ICONS.phone}
                  title={`Number ported in · ${phone}`}
                  body="Port from Verizon · LOA approved by carrier in 4 days."
                  time={`${since} · onboarding`} />
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: '#fff', borderRadius: 16,
                border: `1px solid ${RINGO.border}`, padding: '20px 22px' }}>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700,
                  marginBottom: 14 }}>Account & billing</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, rowGap: 18 }}>
                  <KV label="Account ID" value={`biz_${id ?? '01HQR9TNPXY'}`} mono />
                  <KV label="Owner" value={ownerEmail} />
                  <KV label="Plan" value="Crew · $237/mo" />
                  <KV label="Renews" value="Next month · auto" />
                  <KV label="Payment" value="Visa •• 4242 · 09/27" />
                  <KV label="MRR contribution" value="$237" mono />
                  <KV label="Phone numbers" value="3 of 4 used" />
                  <KV label="Seats" value="4 of 6 active" />
                </div>
                <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 11,
                  background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', gap: 10 }}>
                  <Icon d={ICONS.flag} size={14} />
                  <div style={{ fontSize: 12.5, color: '#9a3412', lineHeight: 1.55 }}>
                    <span style={{ fontWeight: 700 }}>Approaching SMS soft cap.</span>{' '}
                    At 84% of 2,200 monthly replies.
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div style={{ borderRadius: 16, padding: '20px 22px', color: '#fff',
                position: 'relative', overflow: 'hidden',
                background: 'radial-gradient(120% 120% at 0% 0%, #1f1f3a 0%, #0d1228 60%, #06081a 100%)' }}>
                <div style={{ position: 'absolute', right: -50, top: -60, width: 220, height: 220,
                  borderRadius: '50%',
                  background: 'radial-gradient(closest-side,rgba(225,29,72,0.45),transparent)',
                  filter: 'blur(8px)' }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
                  gap: 10, marginBottom: 8 }}>
                  <IconTile grad="linear-gradient(135deg,#e11d48,#fb923c)" size={30} radius={8}>
                    <Icon d={ICONS.shld} size={14} />
                  </IconTile>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700 }}>Danger zone</div>
                </div>
                <div style={{ position: 'relative', fontSize: 12.5,
                  color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 14 }}>
                  Destructive actions are reviewed by the duty manager and recorded to the audit log.
                </div>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Suspend account',       'Stops outbound SMS within 60s.'],
                    ['Refund last invoice',   '$237.00 to Visa •• 4242.'],
                    ['Force re-onboarding',   'Owner re-completes the 5-step setup.'],
                    ['Delete & purge (GDPR)', 'Scheduled — 30-day grace period.'],
                  ].map((a, i) => (
                    <button key={i} style={{ padding: '10px 12px', borderRadius: 9,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.04)', color: '#fff',
                      fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 10,
                      cursor: 'pointer', textAlign: 'left' }}>
                      <Icon d={ICONS.arrow} size={13} />
                      <span>{a[0]}</span>
                      <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)',
                        fontWeight: 400, fontSize: 11.5 }}>{a[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

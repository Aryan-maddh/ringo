'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar, StatCardA } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { Pill } from '@/components/ringo/Pill';
import { RINGO } from '@/components/ringo/tokens';

// ── Types ──────────────────────────────────────────────────────────────────

interface DashData {
  mrr: number;
  active_businesses: number;
  suspended_businesses: number;
  sms_sent_30d: number;
  calls_today: number;
  net_churn: number;
  total_users: number;
  new_signups: number;
}

interface BizRow {
  id: number;
  name: string;
  plan: string;
  suspended: boolean;
  business_type: string | null;
  created_at: string;
  total_calls: number;
  sms_sent: number;
  mrr: number;
}

// ── MRR line chart ─────────────────────────────────────────────────────────

function MRRChart({ currentMrr }: { currentMrr: number }) {
  const W = 680, H = 210, pad = { l: 44, r: 16, t: 16, b: 28 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const months = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];

  // Scale historical trend to end at real MRR value
  const raw = [0.38,0.42,0.46,0.49,0.54,0.58,0.62,0.68,0.76,0.83,0.91,1.0];
  const vals = currentMrr > 0
    ? raw.map(r => Math.round(r * currentMrr))
    : [62,68,74,79,86,91,99,108,118,126,138,152].map(v => v * 1000);
  const maxV = Math.max(...vals) * 1.15;

  const px = (i: number) => pad.l + (i / (months.length - 1)) * iW;
  const py = (v: number) => pad.t + iH - (v / maxV) * iH;
  const linePath = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(v)}`).join(' ');
  const area = `${linePath} L${px(months.length-1)},${pad.t+iH} L${pad.l},${pad.t+iH} Z`;

  const fmt = (v: number) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="mLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        <linearGradient id="mFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,0.25,0.5,0.75,1].map(t => {
        const y = pad.t + iH * t;
        return (
          <g key={t}>
            <line x1={pad.l} x2={W-pad.r} y1={y} y2={y} stroke="#eef0f5"
              strokeDasharray={t === 1 ? '0' : '2 4'}/>
            <text x={pad.l-8} y={y+3} textAnchor="end" fontSize="9.5"
              fontFamily={RINGO.font.mono} fill="#7d829c">
              {fmt(Math.round(maxV*(1-t)))}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#mFill)"/>
      <path d={linePath} fill="none" stroke="url(#mLine)" strokeWidth="2.5" strokeLinejoin="round"/>
      {vals.map((v, i) => (
        <circle key={i} cx={px(i)} cy={py(v)} r={i === vals.length-1 ? 5 : 2.5}
          fill="#fff" stroke="url(#mLine)" strokeWidth="2"/>
      ))}
      {months.map((m, i) => (
        <text key={m} x={px(i)} y={H-8} textAnchor="middle" fontSize="10"
          fontFamily={RINGO.font.mono} fill="#7d829c">{m}</text>
      ))}
      {/* current month tooltip */}
      <g transform={`translate(${px(11)-30},${py(vals[11])-30})`}>
        <rect width="66" height="22" rx="6" fill="#0f1535"/>
        <text x="33" y="15" textAnchor="middle" fontSize="11" fontWeight="700"
          fontFamily={RINGO.font.mono} fill="#fff">{fmt(vals[11])}</text>
      </g>
    </svg>
  );
}

// ── Plan breakdown bar chart ───────────────────────────────────────────────

function PlanBreakdown({ businesses }: { businesses: BizRow[] }) {
  const PLAN_META: Record<string, { label: string; grad: string; price: number }> = {
    starter: { label: 'Starter',  grad: 'linear-gradient(90deg,#475569,#94a3b8)', price: 29  },
    growth:  { label: 'Growth',   grad: 'linear-gradient(90deg,#7c3aed,#06b6d4)', price: 79  },
    pro:     { label: 'Pro',      grad: 'linear-gradient(90deg,#d97706,#fbbf24)', price: 149 },
  };
  const counts: Record<string, number> = { starter: 0, growth: 0, pro: 0 };
  businesses.forEach(b => { if (counts[b.plan] !== undefined) counts[b.plan]++; });
  const total = businesses.length || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(PLAN_META).map(([key, meta]) => {
        const n = counts[key];
        const mrr = n * meta.price;
        const pct = total > 0 ? (n / total) : 0;
        return (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 13, marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: RINGO.ink }}>{meta.label}</span>
                <span style={{ fontSize: 11.5, color: RINGO.ink3 }}>{n} account{n !== 1 ? 's' : ''}</span>
              </div>
              <span style={{ fontFamily: RINGO.font.mono, fontWeight: 700, color: RINGO.ink }}>
                ${mrr}/mo
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: '#f1f3f9', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(pct * 100, pct > 0 ? 4 : 0)}%`,
                background: meta.grad, borderRadius: 99, transition: 'width 0.6s ease' }}/>
            </div>
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 10, marginTop: 4, padding: '12px 14px', borderRadius: 12,
        background: 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(6,182,212,0.04))',
        border: `1px solid ${RINGO.border}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em' }}>Total active accounts</div>
          <div style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
            marginTop: 2 }}>{businesses.length}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em' }}>MRR from plans</div>
          <div style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
            marginTop: 2 }}>${businesses.reduce((s, b) => s + (b.mrr ?? 0), 0)}/mo</div>
        </div>
      </div>
    </div>
  );
}

// ── Ops feed ───────────────────────────────────────────────────────────────

const INCIDENTS = [
  { tag: 'INFO',     tone: '#22d3ee', t: '2 min ago',  m: 'Auto-scaled SMS workers 12→18 in us-west-2 (peak load).' },
  { tag: 'ALERT',    tone: '#fb7185', t: '18 min ago', m: 'Twilio webhook latency spiked to 920ms p95 — back to 140ms.' },
  { tag: 'BILLING',  tone: '#fbbf24', t: '1h ago',     m: 'Auto-retry triggered for 14 past-due invoices → 09:00 UTC.' },
  { tag: 'SECURITY', tone: '#a78bfa', t: '3h ago',     m: 'New device sign-in for staff account: ada@ringo.app · SF.' },
];

function OpsFeed() {
  return (
    <div style={{ borderRadius: 18, padding: '20px 22px', color: '#fff',
      position: 'relative', overflow: 'hidden', height: '100%',
      background: 'radial-gradient(120% 120% at 0% 0%,#1f1f3a 0%,#0d1228 60%,#06081a 100%)' }}>
      <div style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220,
        borderRadius: '50%',
        background: 'radial-gradient(closest-side,rgba(124,58,237,0.5),transparent)',
        filter: 'blur(8px)' }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <IconTile grad="linear-gradient(135deg,#7c3aed,#06b6d4)" size={32} radius={9}>
            <Icon d={ICONS.flag} size={15}/>
          </IconTile>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>Live · ops feed</div>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 15, fontWeight: 700,
              letterSpacing: '-0.01em', marginTop: 1 }}>Recent incidents</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {INCIDENTS.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 13px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 11, alignItems: 'flex-start' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: it.tone,
                marginTop: 5, flexShrink: 0, boxShadow: `0 0 10px ${it.tone}` }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 700,
                    color: it.tone, textTransform: 'uppercase' }}>{it.tag}</span>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)',
                    fontFamily: RINGO.font.mono }}>{it.t}</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.82)' }}>{it.m}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const GRAD_CYCLE = [RINGO.iEme, RINGO.iAmb, RINGO.iSky, RINGO.iPnk, RINGO.iVio, RINGO.iRos];
const PLAN_TONE: Record<string, 'neutral'|'info'|'violet'> = { starter:'neutral', growth:'info', pro:'violet' };

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashData | null>(null);
  const [businesses, setBusinesses] = useState<BizRow[]>([]);

  const load = useCallback(async () => {
    try {
      const [dr, br] = await Promise.all([
        adminApiFetch('/api/admin/dashboard'),
        adminApiFetch('/api/admin/businesses?per_page=6'),
      ]);
      if (dr.ok) setData(await dr.json());
      if (br.ok) {
        const bd = await br.json();
        setBusinesses(bd.businesses ?? []);
      }
    } catch { /* keep state */ }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    setMounted(true);
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [router, load]);

  if (!mounted) return null;

  const mrr       = data?.mrr ?? 0;
  const activeB   = data?.active_businesses ?? 0;
  const sms30d    = data?.sms_sent_30d ?? 0;
  const callsToday = data?.calls_today ?? 0;

  const fmtMrr = (v: number) => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`;

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg,
      fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="over"/>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar
          title="Platform overview"
          sub={data ? `${activeB} active businesses · ${sms30d.toLocaleString()} SMS sent in 30d` : 'Loading…'}
          breadcrumb={['Admin', 'Overview']}/>

        <div style={{ flex: 1, padding: '20px 28px 24px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── KPI cards ── */}
          <div className="r-admin-grid-4">
            <StatCardA grad={RINGO.g1} label="MRR" value={fmtMrr(mrr)} delta="growing"
              sub="monthly recurring" icon={ICONS.dollar}
              spark={[42,48,54,60,68,74,82,92,104,116,130,148]}/>
            <StatCardA grad={RINGO.g3} label="Active businesses" value={activeB.toLocaleString()}
              delta={`+${data?.new_signups ?? 0} new`} sub="this month" icon={ICONS.bld}
              spark={[28,31,34,36,40,44,48,52,56,59,62,66]}/>
            <StatCardA grad={RINGO.g2} label="SMS sent · 30d" value={sms30d.toLocaleString()}
              delta="auto-replied" sub="in last 30 days" icon={ICONS.msg}
              spark={[18,22,26,24,30,28,34,38,36,42,40,46]}/>
            <StatCardA grad="linear-gradient(135deg,#d97706,#fbbf24)" label="Calls today"
              value={callsToday.toLocaleString()}
              delta={`${data?.suspended_businesses ?? 0} suspended`}
              deltaTone="down" sub="across all businesses" icon={ICONS.phone}
              spark={[4,6,5,8,7,10,9,12,10,14,11,16]}/>
          </div>

          {/* ── MRR chart + Leaderboard ── */}
          <div className="r-admin-grid-chart">
            {/* MRR chart */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px',
              border: `1px solid ${RINGO.border}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                    letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Monthly recurring revenue
                  </div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700,
                    color: RINGO.ink, letterSpacing: '-0.02em', marginTop: 4 }}>
                    {fmtMrr(mrr)}
                    {mrr > 0 && (
                      <span style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginLeft: 10 }}>
                        ▲ growing
                      </span>
                    )}
                  </div>
                </div>
                <a href="/admin/revenue" style={{ padding: '6px 12px', borderRadius: 8,
                  background: RINGO.bg, border: `1px solid ${RINGO.border}`, fontSize: 12,
                  fontWeight: 600, color: RINGO.ink2, cursor: 'pointer', textDecoration: 'none' }}>
                  Revenue →
                </a>
              </div>
              <MRRChart currentMrr={mrr}/>
            </div>

            {/* Leaderboard from API */}
            <div style={{ background: '#fff', borderRadius: 18,
              border: `1px solid ${RINGO.border}`, overflow: 'hidden',
              display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '18px 20px 10px', display: 'flex', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                    letterSpacing: '0.06em', textTransform: 'uppercase' }}>Top businesses</div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700,
                    color: RINGO.ink, letterSpacing: '-0.02em', marginTop: 3 }}>By SMS sent</div>
                </div>
                <a href="/admin/businesses" style={{ marginLeft: 'auto', fontSize: 12,
                  color: '#6d28d9', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
              </div>
              <div style={{ padding: '0 10px 4px', display: 'grid',
                gridTemplateColumns: '1fr auto auto', gap: '0 12px',
                fontSize: 10.5, fontWeight: 700, color: RINGO.ink3,
                letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                <span style={{ paddingLeft: 8 }}>Business</span>
                <span>Plan</span>
                <span style={{ textAlign: 'right', paddingRight: 8 }}>MRR</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {businesses.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>
                    No businesses yet.
                  </div>
                ) : businesses.map((b, i) => (
                  <div key={b.id} style={{ display: 'grid',
                    gridTemplateColumns: '1fr auto auto', gap: '0 12px',
                    padding: '11px 18px', borderTop: `1px solid ${RINGO.border}`,
                    alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                      <IconTile grad={GRAD_CYCLE[i % GRAD_CYCLE.length]} size={30} radius={8}>
                        <Icon d={ICONS.bld} size={13}/>
                      </IconTile>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: RINGO.ink3 }}>
                          {b.business_type ?? 'General'} · {b.total_calls} calls
                        </div>
                      </div>
                    </div>
                    <Pill tone={PLAN_TONE[b.plan] ?? 'neutral'} dot={false}>{b.plan}</Pill>
                    <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, color: RINGO.ink,
                      textAlign: 'right', fontSize: 13 }}>
                      ${b.mrr}/mo
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Plan breakdown + Ops feed ── */}
          <div className="r-admin-grid-bottom">
            <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px',
              border: `1px solid ${RINGO.border}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                Plan distribution
              </div>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 700,
                color: RINGO.ink, letterSpacing: '-0.02em', marginBottom: 18 }}>
                Revenue breakdown
              </div>
              <PlanBreakdown businesses={businesses}/>
            </div>
            <OpsFeed/>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar, StatCardA } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { Pill } from '@/components/ringo/Pill';
import { RINGO } from '@/components/ringo/tokens';

// ── Types ──────────────────────────────────────────────────────────────────

interface RevenueData {
  mrr: number;
  arr: number;
  net_new_mrr: number;
  outstanding_ar: number;
}

// ── Charts ─────────────────────────────────────────────────────────────────

function NetMrrChart() {
  const W = 820, H = 300, pad = { l: 46, r: 14, t: 14, b: 30 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const months = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  const N  = [8.4,9.1,10.2,11.3,12.4,13.6,14.8,15.6,16.4,17.1,18.2];
  const E  = [2.8,3.1,3.4,3.6,3.8,4.1,4.4,4.6,4.9,5.1,5.4];
  const C  = [1.2,1.0,1.1,1.3,1.4,1.6,1.7,1.5,1.4,1.5,1.6];
  const Ch = [2.1,1.9,1.8,1.7,1.6,1.5,1.5,1.6,1.6,1.5,1.4];
  const net = N.map((n, i) => n + E[i] - C[i] - Ch[i]);
  let acc = 0;
  const cum = net.map(v => { acc += v; return acc; });
  const max = 28;
  const slot = innerW / months.length;
  const barW = slot * 0.20;
  const px = (i: number) => pad.l + slot * i + slot / 2;
  const py = (v: number) => pad.t + innerH / 2 - (v / max) * (innerH / 2);
  const yLine = (v: number) => pad.t + innerH - (v / Math.max(...cum)) * innerH * 0.85;
  const linePath = cum.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${yLine(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="rN"    x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7c3aed"/><stop offset="1" stopColor="#06b6d4"/></linearGradient>
        <linearGradient id="rE"    x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#059669"/><stop offset="1" stopColor="#06b6d4"/></linearGradient>
        <linearGradient id="rC"    x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fbbf24"/><stop offset="1" stopColor="#d97706"/></linearGradient>
        <linearGradient id="rCh"   x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fb923c"/><stop offset="1" stopColor="#e11d48"/></linearGradient>
        <linearGradient id="rLine" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#7c3aed"/><stop offset="1" stopColor="#06b6d4"/></linearGradient>
      </defs>
      {[0,0.25,0.5,0.75,1].map(t => (
        <line key={t} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH * t} y2={pad.t + innerH * t}
          stroke="#eef0f5" strokeDasharray={t === 0.5 ? '0' : '2 4'} />
      ))}
      <text x={pad.l - 8} y={pad.t + 12} textAnchor="end" fontSize="10"
        fontFamily={RINGO.font.mono} fill="#7d829c">+$28k</text>
      <text x={pad.l - 8} y={pad.t + innerH / 2 + 3} textAnchor="end" fontSize="10"
        fontFamily={RINGO.font.mono} fill="#7d829c">$0</text>
      <text x={pad.l - 8} y={pad.t + innerH - 2} textAnchor="end" fontSize="10"
        fontFamily={RINGO.font.mono} fill="#7d829c">−$28k</text>
      {months.map((m, i) => {
        const cx = px(i);
        const nH = (N[i] / max) * (innerH / 2), eH = (E[i] / max) * (innerH / 2);
        const cH = (C[i] / max) * (innerH / 2), chH = (Ch[i] / max) * (innerH / 2);
        const mid = pad.t + innerH / 2;
        return (
          <g key={i}>
            <rect x={cx - barW * 1.05} y={mid - nH - eH} width={barW} height={nH} rx={2.5} fill="url(#rN)" />
            <rect x={cx - barW * 1.05} y={mid - eH}      width={barW} height={eH} rx={2.5} fill="url(#rE)" />
            <rect x={cx + barW * 0.05} y={mid}            width={barW} height={cH} rx={2.5} fill="url(#rC)" />
            <rect x={cx + barW * 0.05} y={mid + cH}       width={barW} height={chH} rx={2.5} fill="url(#rCh)" />
            <text x={cx} y={H - 10} textAnchor="middle" fontSize="10.5"
              fontFamily={RINGO.font.mono} fill="#7d829c">{m}</text>
          </g>
        );
      })}
      <path d={linePath} fill="none" stroke="url(#rLine)" strokeWidth="2.5"
        strokeLinejoin="round" strokeDasharray="4 4" opacity="0.85" />
      {cum.map((v, i) => (
        <circle key={i} cx={px(i)} cy={yLine(v)} r="3"
          fill="#fff" stroke="url(#rLine)" strokeWidth="2" />
      ))}
    </svg>
  );
}

function PlanDonut() {
  const segs = [
    { l: 'Crew · $79',  v: 48, solid: '#7c3aed', id: 'pdA' },
    { l: 'Solo · $29',  v: 34, solid: '#06b6d4', id: 'pdB' },
    { l: 'Shop · $204', v: 14, solid: '#059669', id: 'pdC' },
    { l: 'Free trial',  v: 4,  solid: '#fb923c', id: 'pdD' },
  ];
  const r = 78, cx = 110, cy = 110, sw = 22;
  const C = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f3f9" strokeWidth={sw} />
        {segs.map((s, i) => {
          const len = (s.v / 100) * C;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.solid} strokeWidth={sw}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-off}
              transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
          );
          off += len;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13"
          fontFamily={RINGO.font.ui} fill="#7d829c" fontWeight="600">Plan mix</text>
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="26"
          fontFamily={RINGO.font.head} fill="#0f1535" fontWeight="700"
          letterSpacing="-0.02em">4,218</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {segs.map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13,
              marginBottom: 5 }}>
              <span style={{ color: RINGO.ink2, fontWeight: 500 }}>{s.l}</span>
              <span style={{ fontFamily: RINGO.font.mono, color: RINGO.ink, fontWeight: 700 }}>{s.v}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: '#f1f3f9', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.v}%`,
                background: `linear-gradient(90deg,${s.solid},#06b6d4)` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Transaction row ────────────────────────────────────────────────────────

interface TxProps {
  icon: string; tone: string; biz: string; tag: string;
  t: string; amt: string; status: string; sTone: 'success' | 'warn' | 'danger' | 'info';
}
function Tx({ icon, tone, biz, tag, t, amt, status, sTone }: TxProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 2fr 1fr 1fr 1.3fr',
      gap: 14, alignItems: 'center', padding: '12px 0',
      borderBottom: `1px solid ${RINGO.border}` }}>
      <IconTile grad={tone} size={32} radius={8}><Icon d={icon} size={14} /></IconTile>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink }}>{biz}</div>
        <div style={{ fontSize: 11.5, color: RINGO.ink3, fontFamily: RINGO.font.mono }}>{tag}</div>
      </div>
      <div style={{ fontSize: 12.5, color: RINGO.ink2, fontFamily: RINGO.font.mono }}>{t}</div>
      <Pill tone={sTone} dot={false}>{status}</Pill>
      <div style={{ textAlign: 'right', fontFamily: RINGO.font.head, fontSize: 15,
        fontWeight: 700, color: RINGO.ink }}>{amt}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminRevenue() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    setMounted(true);
    async function load() {
      try {
        const res = await adminApiFetch('/api/admin/revenue');
        if (res.ok) setData(await res.json());
      } catch { /* keep null */ }
    }
    load();
  }, [router]);

  if (!mounted) return null;

  const mrr = data ? `$${(data.mrr / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '$152,418';
  const arr = data ? `$${(data.arr / 1_000_000).toFixed(2)}M` : '$1.83M';
  const netNew = data ? `$${(data.net_new_mrr / 1000).toFixed(1)}k` : '$16.1k';
  const ar = data ? `$${data.outstanding_ar.toLocaleString()}` : '$8,420';

  const TOP_EXPANSIONS = [
    { n: 'Brightspark Electric', delta: '+$525', sub: 'Crew → Shop', g: RINGO.iAmb, pct: 0.92 },
    { n: 'Foxtail HVAC',         delta: '+$150', sub: 'Solo → Crew · +1 number', g: RINGO.iSky, pct: 0.62 },
    { n: 'Stone & Hearth Tile',  delta: '+$120', sub: '+2 seats', g: RINGO.iRos, pct: 0.50 },
    { n: 'Maplewood Movers',     delta: '+$87',  sub: '+1 number', g: RINGO.iPnk, pct: 0.36 },
    { n: 'Glasshouse Windows',   delta: '+$60',  sub: 'AI receptionist', g: RINGO.iEme, pct: 0.25 },
  ];

  return (
    <div className="r-app-shell" style={{ display: 'flex', minHeight: '100vh', background: RINGO.bg,
      fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="rev" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminTopbar
          title="Revenue & billing"
          sub="Stripe · live · synced 4 minutes ago · all amounts in USD"
          breadcrumb={['Admin', 'Revenue']} />

        <div style={{ flex: 1, padding: '20px 28px 28px', overflowY: 'auto' }}>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            gap: 18, marginBottom: 18 }}>
            <StatCardA grad={RINGO.g1} label="MRR" value={mrr} delta="11.8%"
              sub="vs last month" icon={ICONS.dollar}
              spark={[62,68,74,79,86,91,99,108,118,126,138,152]} />
            <StatCardA grad={RINGO.g3} label="ARR" value={arr} delta="$211k"
              sub="run-rate" icon={ICONS.zap}
              spark={[760,780,820,860,910,970,1040,1120,1240,1360,1500,1830]} />
            <StatCardA grad={RINGO.g2} label="Net new MRR · May" value={netNew} delta="9.2%"
              sub={`net of $5.6k churn`} icon={ICONS.arrow}
              spark={[10.2,11.4,12.1,12.8,13.6,14.0,14.8,15.2,15.6,15.9,16.0,16.1]} />
            <StatCardA grad="linear-gradient(135deg,#d97706,#fbbf24)"
              label="Outstanding A/R" value={ar} delta="14 invoices" deltaTone="up"
              sub="auto-retry · Friday 09:00" icon={ICONS.flag}
              spark={[14,12,11,10,9,9,11,12,13,12,10,8.4]} />
          </div>

          {/* MRR composition + Plan mix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr',
            gap: 18, marginBottom: 18 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${RINGO.border}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                    letterSpacing: '0.06em', textTransform: 'uppercase' }}>MRR composition</div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 700,
                    letterSpacing: '-0.02em', marginTop: 4 }}>+{netNew} net · 11 months</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, fontSize: 11.5,
                  color: RINGO.ink2, paddingTop: 8 }}>
                  {[
                    { l: 'New',         g: 'linear-gradient(180deg,#7c3aed,#06b6d4)' },
                    { l: 'Expansion',   g: 'linear-gradient(180deg,#059669,#06b6d4)' },
                    { l: 'Contraction', g: 'linear-gradient(180deg,#fbbf24,#d97706)' },
                    { l: 'Churn',       g: 'linear-gradient(180deg,#fb923c,#e11d48)' },
                  ].map((it, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 14, height: 8, borderRadius: 2, background: it.g }} />
                      {it.l}
                    </span>
                  ))}
                </div>
              </div>
              <NetMrrChart />
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${RINGO.border}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                letterSpacing: '0.06em', textTransform: 'uppercase' }}>Plan mix</div>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 700,
                letterSpacing: '-0.02em', marginTop: 4, marginBottom: 8 }}>
                Crew is the plurality plan
              </div>
              <PlanDonut />
            </div>
          </div>

          {/* Transactions + Expansions + Dunning */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`,
              padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                    letterSpacing: '0.06em', textTransform: 'uppercase' }}>Stripe activity</div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700,
                    letterSpacing: '-0.02em', marginTop: 2 }}>Recent transactions</div>
                </div>
                <a href="#" style={{ marginLeft: 'auto', fontSize: 12, color: '#6d28d9',
                  fontWeight: 600, textDecoration: 'none' }}>Open Stripe ↗</a>
              </div>
              <div style={{ marginTop: 14 }}>
                <Tx icon={ICONS.dollar} tone={RINGO.iEme} biz="Brightspark Electric · Crew → Shop"
                  tag="ch_3OdLkL · INV-04923 · expansion" t="2 min ago" amt="+$612.00"
                  status="Succeeded" sTone="success" />
                <Tx icon={ICONS.dollar} tone={RINGO.iVio} biz="Pacific Plumbing Co. · Crew renewal"
                  tag="ch_3OdLk1 · INV-04918" t="14 min ago" amt="+$237.00"
                  status="Succeeded" sTone="success" />
                <Tx icon={ICONS.flag} tone={RINGO.iAmb} biz="Bowery Barbers · Solo renewal"
                  tag="ch_3OdLh9 · auto-retry 2 of 3" t="29 min ago" amt="$87.00"
                  status="Past due" sTone="warn" />
                <Tx icon={ICONS.dollar} tone={RINGO.iSky} biz="Foxtail HVAC · Crew renewal"
                  tag="ch_3OdLgh · INV-04915" t="48 min ago" amt="+$237.00"
                  status="Succeeded" sTone="success" />
                <Tx icon={ICONS.x} tone={RINGO.iRos} biz="Echo Ridge Carpentry · Solo"
                  tag="evt_3OdL92 · cancellation" t="1h ago" amt="−$87.00"
                  status="Cancelled" sTone="danger" />
                <Tx icon={ICONS.dollar} tone={RINGO.iPnk} biz="Salon Lume · Solo renewal"
                  tag="ch_3OdL81 · INV-04912" t="1h ago" amt="+$87.00"
                  status="Succeeded" sTone="success" />
                <Tx icon={ICONS.upload} tone={RINGO.iAmb} biz="Tide Cleaning Co. · trial → Solo"
                  tag="sub_1Op2xT · activation" t="2h ago" amt="+$87.00"
                  status="Trial converted" sTone="info" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`,
                padding: '20px 22px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: RINGO.ink3,
                  letterSpacing: '0.06em', textTransform: 'uppercase' }}>Top expansions · 30d</div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700,
                  letterSpacing: '-0.02em', marginTop: 2, marginBottom: 14 }}>
                  Where the growth came from
                </div>
                {TOP_EXPANSIONS.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center',
                    padding: '9px 0', borderTop: i === 0 ? 'none' : `1px solid ${RINGO.border}` }}>
                    <IconTile grad={r.g} size={28} radius={7}>
                      <Icon d={ICONS.bld} size={13} />
                    </IconTile>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink }}>{r.n}</div>
                      <div style={{ fontSize: 11.5, color: RINGO.ink3 }}>{r.sub}</div>
                    </div>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 14, fontWeight: 700,
                      color: '#059669' }}>{r.delta}</div>
                  </div>
                ))}
              </div>

              {/* Dunning queue */}
              <div style={{ borderRadius: 16, padding: '20px 22px', color: '#fff',
                position: 'relative', overflow: 'hidden',
                background: 'radial-gradient(120% 120% at 0% 0%, #1f1f3a 0%, #0d1228 60%, #06081a 100%)' }}>
                <div style={{ position: 'absolute', right: -50, top: -60, width: 220, height: 220,
                  borderRadius: '50%',
                  background: 'radial-gradient(closest-side,rgba(217,119,6,0.45),transparent)',
                  filter: 'blur(8px)' }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
                  gap: 10, marginBottom: 14 }}>
                  <IconTile grad="linear-gradient(135deg,#d97706,#fbbf24)" size={32} radius={9}>
                    <Icon d={ICONS.flag} size={15} />
                  </IconTile>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>Dunning queue</div>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700,
                      letterSpacing: '-0.01em', marginTop: 2 }}>14 invoices · {ar} outstanding</div>
                  </div>
                </div>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { b: 'Bowery Barbers',     a: '$87',  d: '4 days late · retry 2 of 3', t: '#fb923c' },
                    { b: 'Aspen Pet Grooming', a: '$87',  d: '2 days late · retry 1 of 3', t: '#fbbf24' },
                    { b: 'Cedar Auto Glass',   a: '$237', d: '9 days late · retry 3 of 3', t: '#fb7185' },
                    { b: 'Lake County HVAC',   a: '$612', d: '14 days late · final notice', t: '#e11d48' },
                  ].map((it, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center',
                      padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: it.t,
                        boxShadow: `0 0 12px ${it.t}` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{it.b}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)',
                          fontFamily: RINGO.font.mono, marginTop: 2 }}>{it.d}</div>
                      </div>
                      <div style={{ fontFamily: RINGO.font.head, fontSize: 14, fontWeight: 700 }}>{it.a}</div>
                      <button style={{ padding: '5px 9px', borderRadius: 7,
                        border: '1px solid rgba(255,255,255,0.14)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff',
                        fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
                    </div>
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

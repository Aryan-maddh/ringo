# READY TO COPY & PASTE PROMPTS

Copy everything between the dashed lines for each page and paste it directly into v0 or Stitch AI.

## Client Dashboard

--------------------------------------------------
### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

Design the main Client Dashboard for "Ringo", a SaaS app that automatically texts back missed calls. 
Aesthetics: Professional, clean, and data-rich. Use white cards with very subtle borders and soft drop shadows on a very light gray background (`#F8FAFC`). Use the "Trusted Professional" design language (Blue & Slate).
Please rewrite my existing code below to use this new design. **Keep all of my React state, `apiFetch` calls, intervals, and components exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout.

Here is my existing code:

```tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { Sparkline } from '@/components/ringo/Sparkline';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

// ── Types ──────────────────────────────────────────────────────────────────

interface WeekDay { day: string; date: string; total: number; missed: number }
interface RecentCall {
  id: number;
  caller_number: string;
  caller_name: string | null;
  call_status: string;
  duration_seconds: number;
  emergency: boolean;
  created_at: string;
  sms_status: string | null;
  sms_message: string | null;
}
interface DashStats {
  total_calls: number;
  missed_calls: number;
  answered_calls: number;
  voicemail_calls: number;
  emergency_calls: number;
  sms_sent: number;
  reply_rate: number;
  missed_calls_today: number;
  sms_sent_today: number;
  bookings_count: number;
  revenue_recovered: number;
  calls_by_day: { day: string; count: number; missed?: number }[];
  calls_this_week: WeekDay[];
  recent_calls: RecentCall[];
  twilio_number: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function fmtDur(sec: number): string {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function fmtPhone(num: string): string {
  const d = num.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') {
    const n = d.slice(1);
    return `+1 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
  }
  return num;
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ grad, label, value, delta, deltaTone = 'up', spark, icon, sub }: {
  grad: string; label: string; value: string; delta: string;
  deltaTone?: 'up' | 'down'; spark: number[]; icon: string; sub: string;
}) {
  return (
    <div style={{
      position: 'relative', borderRadius: 14, padding: '12px 14px 10px', color: '#fff',
      background: grad, overflow: 'hidden', fontFamily: RINGO.font.ui,
      boxShadow: '0 10px 24px -14px rgba(15,21,53,0.45)',
    }}>
      <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', filter: 'blur(2px)' }} />
      <div style={{ position: 'absolute', right: 12, bottom: 10, opacity: 0.9 }}>
        <Sparkline data={spark} width={60} height={22} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)', flexShrink: 0 }}>
          <Icon d={icon} size={14} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.92 }}>{label}</div>
      </div>
      <div style={{ marginTop: 8, fontFamily: RINGO.font.head, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, opacity: 0.92 }}>
        <span style={{ padding: '1px 6px', borderRadius: 99, background: 'rgba(255,255,255,0.18)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {deltaTone === 'up' ? '▲' : '▼'} {delta}
        </span>
        <span>{sub}</span>
      </div>
    </div>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 14, padding: '12px 14px 10px', background: '#e8eaef', overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: 28, width: 80, borderRadius: 7, background: '#d4d7e0', marginBottom: 8 }} />
      <div style={{ height: 30, width: 60, borderRadius: 6, background: '#d4d7e0', marginBottom: 8 }} />
      <div style={{ height: 14, width: 120, borderRadius: 4, background: '#d4d7e0' }} />
    </div>
  );
}

// ── Bar chart (real weekly data) ───────────────────────────────────────────

function WeekBars({ data }: { data: WeekDay[] }) {
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const W = 660, H = 150, pad = { l: 32, r: 12, t: 10, b: 24 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const slot = innerW / data.length;
  const bw = slot * 0.32;
  const niceMax = Math.ceil(maxVal / 5) * 5 || 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="barA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="barB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = pad.t + innerH * t;
        return (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#eef0f5" strokeDasharray={t === 1 ? '0' : '2 4'} />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize="10" fontFamily={RINGO.font.mono} fill="#7d829c">
              {Math.round(niceMax * (1 - t))}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx = pad.l + slot * i + slot / 2;
        const totalH = (d.total / niceMax) * innerH;
        const missedH = (d.missed / niceMax) * innerH;
        return (
          <g key={d.day}>
            <rect x={cx - bw - 2} y={pad.t + innerH - totalH} width={bw} height={totalH} rx={3} fill="url(#barA)" />
            <rect x={cx + 2} y={pad.t + innerH - missedH} width={bw} height={missedH} rx={3} fill="url(#barB)" />
            <text x={cx} y={H - 10} textAnchor="middle" fontSize="10.5" fontFamily={RINGO.font.mono} fill="#7d829c">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Outcome donut ──────────────────────────────────────────────────────────

function OutcomeDonut({ total, smsRate }: { total: number; smsRate: number }) {
  const replied = Math.round(total * (smsRate / 100));
  const noReply = total - replied;
  const slices = [
    { label: 'Auto-replied', val: Math.max(replied, 0), color: 'url(#dV)' },
    { label: 'No reply', val: Math.max(noReply, 0), color: '#e3e6ee' },
  ];
  const sliceTotal = slices.reduce((a, s) => a + s.val, 0) || 1;
  const R = 58, S = 14, C = 100;
  let acc = 0;
  const barColors = ['linear-gradient(90deg,#7c3aed,#06b6d4)', '#e3e6ee'];
  const dotColors = ['linear-gradient(135deg,#7c3aed,#06b6d4)', '#e3e6ee'];
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}>
      <svg viewBox="0 0 200 200" width={150} height={150} style={{ flex: '0 0 auto' }}>
        <defs>
          <linearGradient id="dV" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="#f1f3f9" strokeWidth={S} />
        {slices.map((s, i) => {
          const frac = s.val / sliceTotal;
          const len = 2 * Math.PI * R;
          const off = -acc * len;
          acc += frac;
          return (
            <circle key={i} cx={C} cy={C} r={R} fill="none" stroke={s.color}
              strokeWidth={S} strokeDasharray={`${frac * len} ${len}`} strokeDashoffset={off}
              transform={`rotate(-90 ${C} ${C})`} strokeLinecap="butt" />
          );
        })}
        <text x={C} y={C - 4} textAnchor="middle" fontFamily={RINGO.font.head} fontWeight="700" fontSize="26" fill={RINGO.ink} letterSpacing="-0.02em">{total}</text>
        <text x={C} y={C + 16} textAnchor="middle" fontFamily={RINGO.font.ui} fontSize="11" fill={RINGO.ink3}>missed</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {slices.map((s, i) => {
          const pct = Math.round((s.val / sliceTotal) * 100);
          return (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: RINGO.font.ui, fontSize: 13, color: RINGO.ink2, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: dotColors[i] }} />
                  <span>{s.label}</span>
                </div>
                <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, color: RINGO.ink }}>
                  {pct}<span style={{ color: RINGO.ink3, fontSize: 11, fontWeight: 500 }}>%</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: '#f1f3f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColors[i] }} />
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 4, padding: '8px 10px', borderRadius: 8, background: '#f6f7fb', border: `1px solid ${RINGO.border}`, fontSize: 12, color: RINGO.ink2 }}>
          <strong style={{ color: RINGO.ink }}>{smsRate}%</strong> reply rate
        </div>
      </div>
    </div>
  );
}

// ── Feed table (real data) ─────────────────────────────────────────────────

const STATUS_TONE: Record<string, 'info' | 'success' | 'danger' | 'warn' | 'neutral'> = {
  missed: 'warn',
  answered: 'success',
  voicemail: 'info',
  incoming: 'info',
};

function FeedTable({ calls }: { calls: RecentCall[] }) {
  if (calls.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>
        No calls yet. They&apos;ll appear here once Ringo starts receiving calls.
      </div>
    );
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: RINGO.font.ui, fontSize: 13 }}>
      <thead>
        <tr style={{ textAlign: 'left', color: RINGO.ink3, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {['Caller', 'When', 'Duration', 'Status', 'SMS', 'Tags'].map(h => (
            <th key={h} style={{ padding: '7px 10px', borderBottom: `1px solid ${RINGO.border}`, fontWeight: 600 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {calls.slice(0, 5).map((r, i) => (
          <tr key={r.id} style={{ color: RINGO.ink }}>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${RINGO.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={r.caller_name || r.caller_number} size={28} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{r.caller_name || 'Unknown'}</div>
                  <div style={{ color: RINGO.ink3, fontSize: 11, fontFamily: RINGO.font.mono }}>{fmtPhone(r.caller_number)}</div>
                </div>
              </div>
            </td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${RINGO.border}`, color: RINGO.ink2, fontSize: 12.5 }}>{relTime(r.created_at)} ago</td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, color: RINGO.ink2, fontSize: 12.5 }}>{fmtDur(r.duration_seconds)}</td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${RINGO.border}` }}>
              <Pill tone={STATUS_TONE[r.call_status] ?? 'neutral'}>{r.call_status}</Pill>
            </td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${RINGO.border}` }}>
              {r.sms_status
                ? <Pill tone={r.sms_status === 'sent' ? 'success' : 'danger'} dot={false}>{r.sms_status}</Pill>
                : <span style={{ color: RINGO.ink4, fontSize: 12 }}>—</span>}
            </td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${RINGO.border}` }}>
              {r.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── AI insight card ────────────────────────────────────────────────────────

function AIInsightCard({ stats }: { stats: DashStats | null }) {
  const items = stats ? [
    {
      tag: 'REPLY RATE',
      tone: stats.reply_rate >= 80 ? '#22d3ee' : '#fbbf24',
      text: stats.reply_rate >= 80
        ? `${stats.reply_rate}% of missed calls got an auto-reply today — above the 80% benchmark.`
        : `Reply rate is ${stats.reply_rate}% — check your Twilio number configuration to improve coverage.`,
      cta: 'View calls',
      href: '/calls',
    },
    {
      tag: 'REVENUE',
      tone: '#22d3ee',
      text: `Estimated $${stats.revenue_recovered.toLocaleString()} revenue recovered from ${stats.sms_sent} auto-replies sent.`,
      cta: 'See details',
      href: '/analytics',
    },
    {
      tag: 'EMERGENCY',
      tone: stats.emergency_calls > 0 ? '#fb7185' : '#22d3ee',
      text: stats.emergency_calls > 0
        ? `${stats.emergency_calls} emergency call${stats.emergency_calls > 1 ? 's' : ''} detected. Review and follow up immediately.`
        : 'No emergency calls detected. Your keyword filters are working.',
      cta: stats.emergency_calls > 0 ? 'Review now' : 'View settings',
      href: stats.emergency_calls > 0 ? '/inbox' : '/settings',
    },
  ] : [
    { tag: 'LOADING', tone: '#a5b4fc', text: 'Fetching AI insights…', cta: '', href: '' },
  ];

  return (
    <div style={{ borderRadius: 14, padding: '14px 16px', color: '#fff', position: 'relative', background: 'radial-gradient(120% 120% at 0% 0%, #1f1f3a 0%, #0d1228 60%, #06081a 100%)', overflow: 'hidden', fontFamily: RINGO.font.ui, height: '100%', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.55),transparent)', filter: 'blur(8px)' }} />
      <div style={{ position: 'absolute', left: 60, bottom: -90, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(6,182,212,0.45),transparent)', filter: 'blur(8px)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px -6px rgba(124,58,237,0.7)', flexShrink: 0 }}>
          <Icon d={ICONS.ai} size={14} />
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>Ringo AI · Daily brief</div>
          <div style={{ fontFamily: RINGO.font.head, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 1 }}>3 things before noon</div>
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.tone, marginTop: 5, flex: '0 0 auto', boxShadow: `0 0 10px ${it.tone}` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.1em', fontWeight: 700, color: it.tone, textTransform: 'uppercase' }}>{it.tag}</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 2, color: 'rgba(255,255,255,0.85)' }}>{it.text}</div>
            </div>
            {it.cta && (
              <button onClick={() => { if (it.href) window.location.href = it.href; }} style={{ padding: '5px 9px', borderRadius: 7, fontFamily: RINGO.font.ui, fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', whiteSpace: 'nowrap', flex: '0 0 auto' }}>{it.cta} →</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard page ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState('Today');
  const [showNumFilter, setShowNumFilter] = useState(false);
  const [activeNumber, setActiveNumber] = useState('All numbers');

  const PERIOD_PARAM: Record<string, string> = { 'Today': 'today', '7 days': '7d', '30 days': '30d', 'Custom': '30d' };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setMounted(true);
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/dashboard/stats?period=${PERIOD_PARAM[period] ?? '30d'}`);
      if (res.ok) setStats(await res.json());
    } catch { /* keep last state */ } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [mounted, fetchStats]);

  const PHONE_NUMBERS = ['All numbers', ...(stats?.twilio_number ? [`${stats.twilio_number} · Your number`] : [])];

  if (!mounted) return null;

  const spark = stats?.calls_by_day.map(d => d.count) ?? [0];
  const cardBorder = `1px solid ${RINGO.border}`;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="dash" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />

        <div style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr 1fr',
          gap: 10,
          padding: '10px 20px 10px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}>

          {/* Row 1: filter strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', background: '#fff', padding: 4, borderRadius: 10, border: cardBorder }}>
              {['Today', '7 days', '30 days', 'Custom'].map(t => (
                <button key={t} onClick={() => setPeriod(t)} style={{ padding: '6px 13px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, background: period === t ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : 'transparent', color: period === t ? '#fff' : RINGO.ink2 }}>{t}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowNumFilter(v => !v)} style={{ padding: '7px 12px', borderRadius: 9, background: '#fff', border: showNumFilter ? '1px solid #7c3aed' : cardBorder, fontFamily: RINGO.font.ui, fontSize: 12.5, color: RINGO.ink2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon d={ICONS.filter} size={13} /> {activeNumber.split(' · ')[0]}
                  <Icon d={ICONS.chev} size={11} />
                </button>
                {showNumFilter && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowNumFilter(false)} />
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#fff', borderRadius: 12, border: `1px solid ${RINGO.border}`, boxShadow: '0 12px 28px -8px rgba(0,0,0,0.13)', minWidth: 240, zIndex: 100, overflow: 'hidden', padding: '4px 0' }}>
                      {PHONE_NUMBERS.map(n => (
                        <button key={n} onClick={() => { setActiveNumber(n); setShowNumFilter(false); }}
                          style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', border: 'none', background: activeNumber === n ? '#f6f7fb' : '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 13, color: activeNumber === n ? RINGO.ink : RINGO.ink2, fontWeight: activeNumber === n ? 600 : 400, textAlign: 'left' }}>
                          <span>{n}</span>
                          {activeNumber === n && <Icon d={ICONS.check} size={12} stroke={2.5} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => router.push('/settings')} style={{ padding: '7px 12px', borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 8px 18px -8px rgba(124,58,237,0.55)' }}>
                <Icon d={ICONS.plus} size={13} /> New auto-reply
              </button>
            </div>
          </div>

          {/* Row 2: KPI stat cards */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              <StatCard grad={RINGO.g1} label="Missed calls today" value={String(stats?.missed_calls_today ?? 0)} delta={`${stats?.missed_calls ?? 0} all time`} sub="vs. last period" icon={ICONS.phone} spark={spark} />
              <StatCard grad={RINGO.g2} label="Auto-replied" value={String(stats?.sms_sent_today ?? 0)} delta={stats ? `${stats.reply_rate}%` : '—'} sub="reply rate" icon={ICONS.send} spark={spark} />
              <StatCard grad={RINGO.g3} label="Total calls" value={String(stats?.total_calls ?? 0)} delta={`${stats?.bookings_count ?? 0} bookings`} sub="all time" icon={ICONS.check} spark={spark} />
              <StatCard grad={RINGO.g4} label="Emergency" value={String(stats?.emergency_calls ?? 0)} delta="—" deltaTone="down" sub="flagged calls" icon={ICONS.clock} spark={spark} />
            </div>
          )}

          {/* Row 3: charts (1fr) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 10, minHeight: 0 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: cardBorder, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '14px 18px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: RINGO.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Calls by day</div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, color: RINGO.ink, letterSpacing: '-0.02em', marginTop: 2 }}>This week — total vs. missed</div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: RINGO.ink2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: 'linear-gradient(180deg,#7c3aed,#06b6d4)' }} /> Total</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: 'linear-gradient(180deg,#fb923c,#fbbf24)' }} /> Missed</span>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                {stats?.calls_this_week
                  ? <WeekBars data={stats.calls_this_week} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
                }
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, border: cardBorder, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '14px 18px 10px' }}>
              <div style={{ flexShrink: 0, marginBottom: 4 }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: RINGO.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Outcomes</div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, color: RINGO.ink, letterSpacing: '-0.02em', marginTop: 2 }}>Reply coverage</div>
              </div>
              <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <OutcomeDonut total={stats?.missed_calls ?? 0} smsRate={stats?.reply_rate ?? 0} />
              </div>
            </div>
          </div>

          {/* Row 4: feed + AI (1fr) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 10, minHeight: 0 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: cardBorder, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px 6px', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: RINGO.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live feed</div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, color: RINGO.ink, letterSpacing: '-0.02em', marginTop: 2 }}>Recent calls</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.18)' }} /> Live
                  </span>
                  <a href="/calls" style={{ padding: '5px 10px', borderRadius: 7, background: '#fff', border: cardBorder, fontFamily: RINGO.font.ui, fontSize: 12, color: RINGO.ink2, cursor: 'pointer', textDecoration: 'none' }}>View all</a>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <FeedTable calls={stats?.recent_calls ?? []} />
              </div>
            </div>

            <AIInsightCard stats={stats} />
          </div>

        </div>
      </div>
    </div>
  );
}

```
--------------------------------------------------

## Client Settings (Including WhatsApp)

--------------------------------------------------
### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

Design a highly organized Settings page for a SaaS application.
Layout: A left-hand vertical sub-navigation with the tabs: Profile, Business Info, Your Number, SMS & Voice, WhatsApp, and Notifications. The right side should contain the settings form for the active tab.
Use standard SaaS styling: crisp borders, clear labels, and a sticky "Save Changes" button.
Please rewrite my existing code below to use this new design. **Keep all of my React state, `apiFetch` calls, and logic exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout.

Here is my existing code:

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Pill } from '@/components/ringo/Pill';
import { IconTile } from '@/components/ringo/IconTile';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

// ── Types ──────────────────────────────────────────────────────────────────

interface Settings {
  id: number;
  name: string;
  business_type: string | null;
  twilio_number: string | null;
  twilio_number_sid: string | null;
  whatsapp_number: string | null;
  whatsapp_number_sid: string | null;
  owner_phone: string | null;
  timezone: string;
  call_forwarding_enabled: boolean;
  auto_sms_enabled: boolean;
  auto_whatsapp_enabled: boolean;
  voice_message: string | null;
  sms_message: string | null;
  whatsapp_message: string | null;
  booking_url: string | null;
  emergency_keywords: string[] | null;
  business_hours: Record<string, { open: string; close: string; enabled: boolean }> | null;
  sms_count_this_month: number;
  plan: string;
}

interface AvailableNumber { phone_number: string; friendly_name: string; locality: string; region: string; }

// ── UI primitives ──────────────────────────────────────────────────────────

function Toggle({ on = true, onChange }: { on?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange?.(!on)}
      style={{ width: 40, height: 23, borderRadius: 99, padding: 2, border: 'none', cursor: 'pointer', background: on ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : RINGO.borderStrong, flexShrink: 0 }}>
      <span style={{ display: 'block', width: 19, height: 19, borderRadius: '50%', background: '#fff', marginLeft: on ? 17 : 0, transition: 'margin-left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

function SCard({ title, sub, children, footer }: { title: string; sub?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, color: RINGO.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 4, lineHeight: 1.55 }}>{sub}</div>}
      </div>
      <div style={{ padding: '18px 22px' }}>{children}</div>
      {footer && (
        <div style={{ padding: '14px 22px', background: '#f9fafc', borderTop: `1px solid ${RINGO.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, padding: '13px 0', borderBottom: `1px solid ${RINGO.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: RINGO.ink3, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`,
  fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, background: '#fff', boxSizing: 'border-box',
  outline: 'none',
};

// ── Tabs ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'biz',    l: 'Business info',  g: RINGO.iVio, ic: ICONS.bld },
  { id: 'number', l: 'Your number',    g: RINGO.iEme, ic: ICONS.phone },
  { id: 'sms',    l: 'SMS & Voice',    g: RINGO.iRos, ic: ICONS.msg },
  { id: 'whatsapp', l: 'WhatsApp',   g: 'linear-gradient(135deg, #22c55e, #16a34a)', ic: 'whatsapp' },
  { id: 'notify', l: 'Notifications',  g: RINGO.iAmb, ic: ICONS.bell },
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
];

const STATE_AREA_CODES: Record<string, string[]> = {
  'California':  ['213','310','408','415','424','510','562','619','626','650','714','747','760','805','818','858','909','916','925','949'],
  'New York':    ['212','315','347','516','518','585','607','631','646','716','718','845','914','929'],
  'Texas':       ['210','214','281','325','469','512','682','713','737','806','817','830','832','903','915','936','940','956','972'],
  'Florida':     ['239','305','321','352','386','407','561','727','754','772','786','813','850','863','904','941','954'],
  'Illinois':    ['217','224','309','312','331','618','630','708','773','815','847','872'],
  'Pennsylvania':['215','267','412','484','570','610','717','724','814'],
  'Ohio':        ['216','234','330','419','440','513','567','614','740','937'],
  'Michigan':    ['231','248','269','313','517','586','616','734','810'],
  'Georgia':     ['229','404','470','478','678','706','762','770','912'],
  'North Carolina':['252','336','704','828','910','919','980','984'],
  'New Jersey':  ['201','551','609','732','848','856','862','908','973'],
  'Washington':  ['206','253','360','425','509'],
  'Arizona':     ['480','520','602','623','928'],
  'Massachusetts':['339','351','413','508','617','774','781','857','978'],
  'Colorado':    ['303','719','720','970'],
  'Virginia':    ['276','434','540','571','703','757','804'],
  'Tennessee':   ['423','615','629','731','865','901','931'],
  'Minnesota':   ['218','320','507','612','651','763','952'],
};

// ── Settings page ──────────────────────────────────────────────────────────

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState('biz');
  const [notifyPrefs, setNotifyPrefs] = useState<Record<string, boolean>>({
    emergency_alerts: true,
    new_booking: true,
    daily_summary: true,
    weekly_report: false,
    missed_digest: false,
  });

  // Number-change flow
  const [showSearch, setShowSearch] = useState(false);
  const [srState, setSrState] = useState('');
  const [srAreaCode, setSrAreaCode] = useState('');
  const [srSearching, setSrSearching] = useState(false);
  const [srNumbers, setSrNumbers] = useState<AvailableNumber[]>([]);
  const [srSelected, setSrSelected] = useState('');
  const [srProvisioning, setSrProvisioning] = useState(false);
  const [srError, setSrError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setMounted(true);
    apiFetch('/api/settings').then(r => r.ok ? r.json() : null).then(d => { if (d) setSettings(d); }).catch(() => {});
    const saved = localStorage.getItem('notifyPrefs');
    if (saved) { try { setNotifyPrefs(JSON.parse(saved)); } catch { /* ignore */ } }
  }, [router]);

  async function handleSave(fields?: Partial<Settings>) {
    if (!settings) return;
    setSaving(true); setSaveStatus('idle');
    try {
      const body = fields ?? {
        name: settings.name, business_type: settings.business_type,
        owner_phone: settings.owner_phone, timezone: settings.timezone,
        call_forwarding_enabled: settings.call_forwarding_enabled,
        auto_sms_enabled: settings.auto_sms_enabled,
        auto_whatsapp_enabled: settings.auto_whatsapp_enabled,
        sms_message: settings.sms_message, booking_url: settings.booking_url,
        whatsapp_message: settings.whatsapp_message,
        voice_message: settings.voice_message, emergency_keywords: settings.emergency_keywords,
        business_hours: settings.business_hours,
      };
      const res = await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(body) });
      if (res.ok) { const d = await res.json(); setSettings(d); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); }
      else setSaveStatus('error');
    } catch { setSaveStatus('error'); }
    finally { setSaving(false); }
  }

  async function handleNumberSearch() {
    if (!srAreaCode) { setSrError('Select an area code first'); return; }
    setSrSearching(true); setSrNumbers([]); setSrSelected(''); setSrError('');
    try {
      const res = await apiFetch(`/api/numbers/search?areacode=${srAreaCode}`);
      const data = await res.json();
      if (!res.ok) { setSrError(data.error ?? 'Search failed'); return; }
      if (!data.numbers?.length) { setSrError(`No numbers available in area code ${srAreaCode}.`); return; }
      setSrNumbers(data.numbers);
    } catch { setSrError('Network error'); }
    finally { setSrSearching(false); }
  }

  async function handleNumberProvision() {
    if (!srSelected) return;
    setSrProvisioning(true); setSrError('');
    try {
      const res = await apiFetch('/api/numbers/provision', { method: 'POST', body: JSON.stringify({ phone_number: srSelected }) });
      const data = await res.json();
      if (!res.ok) { setSrError(data.error ?? 'Provisioning failed'); return; }
      setSettings(prev => prev ? { ...prev, twilio_number: data.phone_number, twilio_number_sid: data.sid } : prev);
      setShowSearch(false); setSrNumbers([]); setSrSelected(''); setSrState(''); setSrAreaCode('');
    } catch { setSrError('Network error'); }
    finally { setSrProvisioning(false); }
  }

  if (!mounted) return null;

  const selStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
  const areaCodes = srState ? STATE_AREA_CODES[srState] ?? [] : [];

  const SaveBar = (
    <>
      {saveStatus === 'success' && (
        <div style={{ padding: '11px 16px', borderRadius: 10, background: '#e7f7ee', border: '1px solid #b9e4ca', fontSize: 13, color: '#075c3f', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Icon d={ICONS.check} size={14} stroke={2.5} /> Settings saved.
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{ padding: '11px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#b91c1c', marginBottom: 14 }}>
          Failed to save. Please try again.
        </div>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="set" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar title="Settings" sub="Configure your Ringo number, SMS templates, and business hours." />

        {/* Tab bar */}
        <div style={{ padding: '0 28px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 2 }}>
          {TABS.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setShowSearch(false); }}
                style={{ padding: '13px 16px', borderRadius: 0, border: 'none', cursor: 'pointer', background: 'transparent', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? (t.id === 'whatsapp' ? '#16a34a' : '#7c3aed') : RINGO.ink2, borderBottom: on ? `2px solid ${t.id === 'whatsapp' ? '#16a34a' : '#7c3aed'}` : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTile grad={t.g} size={22} radius={6}>
                  {t.ic === 'whatsapp' ? <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width={12} height={12} style={{ filter: 'invert(1)' }} alt="wa" /> : <Icon d={t.ic} size={11} />}
                </IconTile>
                {t.l}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 860 }}>
            {SaveBar}

            {/* ── Tab 1: Business info ─────────────────────────────────────── */}
            {tab === 'biz' && (
              <SCard title="Business info" sub="Your business name and type as shown in SMS replies."
                footer={
                  <button type="button" onClick={() => handleSave()} disabled={saving}
                    style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                }>
                <Field label="Business name" hint="Shown in auto-replies.">
                  <input style={inputStyle} value={settings?.name ?? ''} onChange={e => setSettings(s => s ? { ...s, name: e.target.value } : s)} />
                </Field>
                <Field label="Business type">
                  <select style={selStyle} value={settings?.business_type ?? ''} onChange={e => setSettings(s => s ? { ...s, business_type: e.target.value } : s)}>
                    {['Plumbing', 'Electrical', 'HVAC', 'Salon / Spa', 'Auto repair', 'Roofing', 'Cleaning', 'Landscaping', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Owner / contact phone" hint="Your real mobile number. Used for emergency alerts and call forwarding.">
                  <input style={inputStyle} value={settings?.owner_phone ?? ''} placeholder="+1 (415) 555-0188" onChange={e => setSettings(s => s ? { ...s, owner_phone: e.target.value } : s)} />
                </Field>
                <Field label="Time zone" hint="Used for business hours and quiet-hour calculations.">
                  <select style={selStyle} value={settings?.timezone ?? 'America/New_York'} onChange={e => setSettings(s => s ? { ...s, timezone: e.target.value } : s)}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
                  </select>
                </Field>
                <Field label="Booking URL" hint="Appended to every SMS reply so customers can self-schedule.">
                  <input style={inputStyle} value={settings?.booking_url ?? ''} placeholder="https://calendly.com/yourname" onChange={e => setSettings(s => s ? { ...s, booking_url: e.target.value } : s)} />
                </Field>
              </SCard>
            )}

            {/* ── Tab 2: Your number ───────────────────────────────────────── */}
            {tab === 'number' && (
              <>
                <SCard title="Your Ringo number" sub="This is the number Ringo uses to answer missed calls and send SMS replies.">
                  {settings?.twilio_number ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                      <IconTile grad={RINGO.iEme} size={42} radius={12}><Icon d={ICONS.phone} size={18} /></IconTile>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: RINGO.font.mono, fontSize: 20, fontWeight: 700, color: RINGO.ink }}>{settings.twilio_number}</div>
                        <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 3 }}>Provisioned from master Twilio account · included in your {settings.plan} plan</div>
                      </div>
                      <Pill tone="success" dot>Active</Pill>
                      <button onClick={() => setShowSearch(true)} style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Change number</button>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', borderRadius: 12, background: RINGO.bg, border: `1px dashed ${RINGO.borderStrong}` }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: RINGO.ink2, marginBottom: 8 }}>No number provisioned yet</div>
                      <button onClick={() => setShowSearch(true)} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Icon d={ICONS.plus} size={14} /> Search & provision a number
                      </button>
                    </div>
                  )}
                </SCard>

                {/* Number search panel */}
                {showSearch && (
                  <SCard title="Search available numbers" sub="Find a local number in your area. We'll buy it from our master Twilio account.">
                    {srError && <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#b91c1c' }}>{srError}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, marginBottom: 6 }}>State</div>
                        <select style={selStyle} value={srState} onChange={e => { setSrState(e.target.value); setSrAreaCode(''); setSrNumbers([]); }}>
                          <option value="">Select state…</option>
                          {Object.keys(STATE_AREA_CODES).sort().map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, marginBottom: 6 }}>Area code</div>
                        <select style={{ ...selStyle, opacity: srState ? 1 : 0.5 }} value={srAreaCode} onChange={e => { setSrAreaCode(e.target.value); setSrNumbers([]); }} disabled={!srState}>
                          <option value="">Select…</option>
                          {areaCodes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <button onClick={handleNumberSearch} disabled={!srAreaCode || srSearching}
                        style={{ padding: '10px 18px', borderRadius: 9, border: 'none', cursor: srAreaCode ? 'pointer' : 'default', background: srAreaCode ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#d1d5e4', color: '#fff', fontSize: 13, fontWeight: 600, height: 42 }}>
                        {srSearching ? 'Searching…' : 'Search'}
                      </button>
                    </div>
                    {srNumbers.length > 0 && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                          {srNumbers.map((n, i) => (
                            <label key={i} onClick={() => setSrSelected(n.phone_number)}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: srSelected === n.phone_number ? '2px solid #7c3aed' : `1px solid ${RINGO.border}`, background: srSelected === n.phone_number ? 'rgba(124,58,237,0.04)' : '#fff', cursor: 'pointer' }}>
                              <span style={{ width: 16, height: 16, borderRadius: '50%', border: srSelected === n.phone_number ? '5px solid #7c3aed' : `2px solid ${RINGO.borderStrong}`, flexShrink: 0 }} />
                              <span style={{ fontFamily: RINGO.font.mono, fontSize: 15, fontWeight: 700, flex: 1 }}>{n.friendly_name}</span>
                              {n.locality && <span style={{ fontSize: 12, color: RINGO.ink3 }}>{n.locality}{n.region ? `, ${n.region}` : ''}</span>}
                              {srSelected === n.phone_number && <Pill tone="violet" dot={false}>Selected</Pill>}
                            </label>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => { setShowSearch(false); setSrNumbers([]); setSrSelected(''); }} style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                          <button onClick={handleNumberProvision} disabled={!srSelected || srProvisioning}
                            style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: srSelected ? 'pointer' : 'default', background: srSelected ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#d1d5e4', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                            {srProvisioning ? 'Provisioning…' : 'Claim this number'}
                          </button>
                        </div>
                      </>
                    )}
                  </SCard>
                )}

                <SCard title="Call forwarding" sub="Forward calls to your mobile before Ringo picks up."
                  footer={
                    <button type="button" onClick={() => handleSave({ call_forwarding_enabled: settings?.call_forwarding_enabled, owner_phone: settings?.owner_phone })} disabled={saving}
                      style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  }>
                  <Field label="Enable call forwarding" hint="Ringo will ring your mobile first — if you don't answer, it sends the SMS.">
                    <Toggle on={settings?.call_forwarding_enabled ?? false} onChange={v => setSettings(s => s ? { ...s, call_forwarding_enabled: v } : s)} />
                  </Field>
                  <Field label="Forward to" hint="Your real mobile number. Leave blank to skip forwarding.">
                    <input style={inputStyle} value={settings?.owner_phone ?? ''} placeholder="+1 (415) 555-0188" onChange={e => setSettings(s => s ? { ...s, owner_phone: e.target.value } : s)} />
                  </Field>
                </SCard>
              </>
            )}

            {/* ── Tab 3: SMS & Voice ───────────────────────────────────────── */}
            {tab === 'sms' && (
              <>
                <SCard title="Auto SMS" sub="Ringo texts callers back automatically within 12 seconds of a missed call."
                  footer={
                    <button type="button" onClick={() => handleSave()} disabled={saving}
                      style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  }>
                  <Field label="Auto-reply enabled" hint="Turn off to pause all outbound SMS — calls still logged.">
                    <Toggle on={settings?.auto_sms_enabled ?? true} onChange={v => setSettings(s => s ? { ...s, auto_sms_enabled: v } : s)} />
                  </Field>
                  <Field label="SMS template" hint="Sent to every missed caller. Use {{caller_name}} as a placeholder.">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }}
                        value={settings?.sms_message ?? ''}
                        onChange={e => setSettings(s => s ? { ...s, sms_message: e.target.value } : s)} />
                      <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f6f7fb', border: `1px solid ${RINGO.border}` }}>
                        <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                        <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 13, lineHeight: 1.5, color: RINGO.ink }}>
                          {settings?.sms_message || 'Your message will appear here…'}
                        </div>
                        <div style={{ fontSize: 11, color: RINGO.ink3, marginTop: 6 }}>{settings?.name || 'Your business'} · just now</div>
                      </div>
                    </div>
                  </Field>
                  <Field label="Voice greeting" hint="What Ringo says when it answers the phone. Keep it under 20 words.">
                    <input style={inputStyle}
                      value={settings?.voice_message ?? ''}
                      placeholder={`Hi, you've reached ${settings?.name || 'us'}. We're unavailable — describe your issue and we'll text you right back.`}
                      onChange={e => setSettings(s => s ? { ...s, voice_message: e.target.value } : s)} />
                  </Field>
                </SCard>

                <SCard title="Emergency keywords" sub="If a caller's speech contains any of these words, their SMS is flagged as urgent.">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {(settings?.emergency_keywords ?? ['emergency', 'urgent', 'flood', 'burst', 'leak', 'no power', 'fire']).map((kw, i) => (
                      <span key={i} style={{ padding: '5px 12px', borderRadius: 99, background: 'linear-gradient(135deg,rgba(225,29,72,0.1),rgba(251,146,60,0.08))', border: '1px solid rgba(225,29,72,0.2)', fontSize: 13, color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {kw}
                        <button onClick={() => setSettings(s => s ? { ...s, emergency_keywords: (s.emergency_keywords ?? []).filter((_, j) => j !== i) } : s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#b91c1c', display: 'flex' }}>
                          <Icon d={ICONS.x} size={11} stroke={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input id="kw-input" style={{ ...inputStyle, maxWidth: 260 }} placeholder="Add keyword…" onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) { setSettings(s => s ? { ...s, emergency_keywords: [...(s.emergency_keywords ?? []), val] } : s); (e.target as HTMLInputElement).value = ''; }
                      }
                    }} />
                    <button onClick={() => handleSave()} style={{ padding: '9px 14px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: RINGO.ink3 }}>Press Enter to add. Changes take effect immediately.</div>
                </SCard>
              </>
            )}

            {/* ── Tab: WhatsApp ────────────────────────────────────────────── */}
            {tab === 'whatsapp' && (
              <>
                <SCard title="Your WhatsApp number" sub="This is the number Ringo uses to send WhatsApp replies.">
                  {settings?.twilio_number ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                      <IconTile grad="linear-gradient(135deg, #22c55e, #16a34a)" size={42} radius={12}>
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width={22} height={22} style={{ filter: 'invert(1)' }} alt="wa" />
                      </IconTile>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: RINGO.font.mono, fontSize: 20, fontWeight: 700, color: RINGO.ink }}>{settings.twilio_number}</div>
                        <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 3 }}>Sharing your primary Ringo number for WhatsApp</div>
                      </div>
                      <Pill tone="success" dot>Active</Pill>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', borderRadius: 12, background: RINGO.bg, border: `1px dashed ${RINGO.borderStrong}` }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: RINGO.ink2, marginBottom: 8 }}>No primary number provisioned</div>
                      <div style={{ fontSize: 13, color: RINGO.ink3, marginBottom: 12 }}>Please go to the "Your number" tab to provision a number first. Ringo will automatically use it for WhatsApp too.</div>
                      <button onClick={() => setTab('number')} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        Go to Your number
                      </button>
                    </div>
                  )}
                </SCard>

                <SCard title="Auto WhatsApp" sub="Ringo sends WhatsApp messages automatically within 12 seconds of a missed call."
                  footer={
                    <button type="button" onClick={() => handleSave()} disabled={saving}
                      style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  }>
                  <Field label="Auto-reply enabled" hint="Turn off to pause all outbound WhatsApp replies.">
                    <Toggle on={settings?.auto_whatsapp_enabled ?? false} onChange={v => setSettings(s => s ? { ...s, auto_whatsapp_enabled: v } : s)} />
                  </Field>
                  <Field label="WhatsApp template" hint="Sent to every missed caller on WhatsApp.">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }}
                        value={settings?.whatsapp_message ?? ''}
                        onChange={e => setSettings(s => s ? { ...s, whatsapp_message: e.target.value } : s)} />
                      <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f6f7fb', border: `1px solid ${RINGO.border}` }}>
                        <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                        <div style={{ padding: '10px 14px', borderRadius: '4px 18px 18px 18px', background: '#e1ffd4', border: `1px solid #bbf7d0`, fontSize: 13, lineHeight: 1.5, color: '#064e3b' }}>
                          {settings?.whatsapp_message || 'Your WhatsApp message will appear here…'}
                        </div>
                        <div style={{ fontSize: 11, color: RINGO.ink3, marginTop: 6 }}>{settings?.name || 'Your business'} · just now</div>
                      </div>
                    </div>
                  </Field>
                </SCard>
              </>
            )}

            {/* ── Tab 4: Notifications ─────────────────────────────────────── */}
            {tab === 'notify' && (
              <SCard title="Notification preferences" sub="Choose when and how Ringo alerts you."
                footer={
                  <button type="button" onClick={() => {
                    localStorage.setItem('notifyPrefs', JSON.stringify(notifyPrefs));
                    handleSave();
                  }} disabled={saving}
                    style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    {saving ? 'Saving…' : 'Save preferences'}
                  </button>
                }>
                {([
                  { l: 'Emergency alerts',         h: 'Immediate SMS to your phone when emergency keyword detected.', key: 'emergency_alerts' },
                  { l: 'New booking notifications', h: 'Alert when a caller books via your booking URL.',             key: 'new_booking' },
                  { l: 'Daily summary email',       h: 'Morning recap of calls, replies, and bookings.',              key: 'daily_summary' },
                  { l: 'Weekly report',             h: 'Friday digest with trends and revenue recovered.',            key: 'weekly_report' },
                  { l: 'Missed-call digest',        h: 'End-of-day list of unanswered calls.',                        key: 'missed_digest' },
                ] as { l: string; h: string; key: string }[]).map((item) => (
                  <Field key={item.key} label={item.l} hint={item.h}>
                    <Toggle on={notifyPrefs[item.key] ?? false} onChange={v => setNotifyPrefs(p => ({ ...p, [item.key]: v }))} />
                  </Field>
                ))}
                <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: RINGO.bg, border: `1px solid ${RINGO.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink2, marginBottom: 8 }}>Notification destination</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input style={{ ...inputStyle, maxWidth: 300 }} defaultValue={settings?.owner_phone ?? ''} placeholder="+1 (415) 555-0188" />
                    <input style={{ ...inputStyle, maxWidth: 300 }} defaultValue="" placeholder="email@example.com" />
                  </div>
                </div>
              </SCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

```
--------------------------------------------------

## Admin Dashboard

--------------------------------------------------
### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

Design an Admin/Superuser Dashboard for a multi-tenant SaaS application.
Aesthetics: Sleek, high-density, and highly analytical. 
Please rewrite my existing code below to use this new design. **Keep all of my React state, API fetches, and logic exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout.

Here is my existing code:

```tsx
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg,
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

```
--------------------------------------------------

## Sidebar Component

--------------------------------------------------
### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

Create the main layout shell and sidebar for a B2B SaaS application called "Ringo". 
Aesthetics: "Trusted Professional". Use Slate Gray (`#0F172A`) for the sidebar background, Trust Blue (`#2563EB`) for active states, and crisp white for the text.
Please rewrite my existing code below to use this new design. **Keep all of my React state, mapping logic, and routing exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout.

Here is my existing code:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { RINGO } from './tokens';
import { Icon, ICONS } from './Icon';
import { RingoLogo } from './RingoLogo';
import { Avatar } from './Avatar';

const NAV = [
  { id: 'dash',      label: 'Dashboard',  icon: ICONS.grid,   href: '/dashboard' },
  { id: 'sms',       label: 'Messages',   icon: ICONS.msg,    href: '/inbox' },
  { id: 'calls',     label: 'Call log',   icon: ICONS.phone,  href: '/calls' },
  { id: 'contacts',  label: 'Contacts',   icon: ICONS.user,   href: '/contacts' },
  { id: 'analytics', label: 'Analytics',  icon: ICONS.filter, href: '/analytics' },
  { id: 'reviews',   label: 'Reviews',    icon: ICONS.star,   href: '/reviews' },
  { id: 'campaigns', label: 'Campaigns',  icon: ICONS.zap,    href: '/campaigns' },
  { id: 'bill',      label: 'Billing',    icon: ICONS.card,   href: '/billing' },
  { id: 'set',       label: 'Settings',   icon: ICONS.cog,    href: '/settings' },
];

type ActiveId = 'dash' | 'sms' | 'calls' | 'contacts' | 'analytics' | 'reviews' | 'campaigns' | 'bill' | 'set';

interface SidebarProps {
  active: ActiveId;
}

export function Sidebar({ active }: SidebarProps) {
  return (
    <div
      className="r-sidebar"
      style={{
        width: 220, flex: '0 0 220px', height: '100%',
        background: '#fff', borderRight: `1px solid ${RINGO.border}`,
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px 16px', fontFamily: RINGO.font.ui,
      }}
    >
      <div style={{ marginBottom: 28, paddingLeft: 6 }}>
        <RingoLogo size={26} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: RINGO.ink3, textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
          Menu
        </div>
        {NAV.map(n => {
          const on = n.id === active;
          return (
            <Link
              key={n.id}
              href={n.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 9,
                marginBottom: 2, textDecoration: 'none',
                background: on ? 'linear-gradient(90deg,rgba(124,58,237,0.09),transparent)' : 'transparent',
                color: on ? RINGO.ink : RINGO.ink2,
                fontSize: 13.5, fontWeight: on ? 600 : 500,
                borderLeft: `3px solid ${on ? '#7c3aed' : 'transparent'}`,
              }}
            >
              <div style={{ color: on ? '#7c3aed' : RINGO.ink3 }}>
                <Icon d={n.icon} size={16} />
              </div>
              <span>{n.label}</span>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${RINGO.border}` }}>
        <Link
          href="/inbox"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 9,
            textDecoration: 'none', color: RINGO.ink2,
            fontSize: 13.5, fontWeight: 500, marginBottom: 10,
          }}
        >
          <Icon d={ICONS.bell} size={16} />
          <span>Notifications</span>
          <span style={{ marginLeft: 'auto', padding: '2px 7px', borderRadius: 99, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 10.5, fontWeight: 700 }}>3</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 10, background: RINGO.bg }}>
          <Avatar name="Marco Reyes" size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink }}>Marco Reyes</div>
            <div style={{ fontSize: 11, color: RINGO.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Pacific Plumbing</div>
          </div>
          <Icon d={ICONS.chevR} size={13} />
        </div>
      </div>
    </div>
  );
}

```
--------------------------------------------------


## 5. Global App Navigation Rule (Paste this before your code)

--------------------------------------------------
**App Navigation & Routing Context:**
Please ensure that all generated sidebar links, header links, and internal buttons use Next.js `<Link href='/path'>` components instead of static `<button>` tags, and explicitly route to these exact paths:
- Dashboard -> `/dashboard`
- Inbox (Messages/Call Logs) -> `/inbox`
- Calls -> `/calls`
- Contacts -> `/contacts`
- Analytics -> `/analytics`
- Reviews -> `/reviews`
- Campaigns -> `/campaigns`
- Settings -> `/settings`

Do NOT break existing `onClick` handlers or `useState` hooks. If my code has an `onClick={handleSave}`, make sure your redesigned button keeps that exact `onClick`.
--------------------------------------------------

## 6. Omnichannel Inbox (SMS, WhatsApp, Facebook, Instagram)

--------------------------------------------------
### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

Design an 'Omnichannel Inbox' page for a SaaS app.
Layout: 
1. The left sidebar should list all active conversations. Above the conversation list, add pill-shaped filter buttons for channel types: All, SMS, WhatsApp, Facebook, Instagram. Use the appropriate brand colors for these filters (e.g., green for WhatsApp, blue for Facebook, gradient for Instagram).
2. The middle panel should display the chat thread. The message bubbles should indicate which channel they came from using a tiny icon (e.g., an Instagram logo next to the timestamp).
3. The right panel should show contact details (name, phone number, and placeholder social profiles).
4. The message input box should have a dropdown to select which channel the business is replying from.

Please rewrite my existing code below to use this new design. **Keep all of my React state (`conversations`, `apiFetch` calls, etc.) exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout. Add the new UI elements for the Facebook/Instagram tabs as non-functional placeholders for now.

Here is my existing code:

```tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

// ── Types ──────────────────────────────────────────────────────────────────

interface CallLog {
  id: number;
  caller_number: string;
  caller_name: string | null;
  call_status: string;
  duration_seconds: number;
  emergency: boolean;
  created_at: string;
}

interface SmsMessage {
  id: number;
  call_log_id: number;
  message: string;
  status: string;
  created_at: string;
  caller_number: string;
  caller_name: string | null;
  emergency: boolean;
}

interface Conversation {
  caller_number: string;
  caller_name: string | null;
  emergency: boolean;
  last_call_at: string;
  call_count: number;
  messages: SmsMessage[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function fmtPhone(num: string): string {
  const d = num.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') {
    const n = d.slice(1);
    return `+1 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
  }
  return num;
}

function fmtDur(sec: number): string {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const STATUS_TONE: Record<string, 'info' | 'success' | 'danger' | 'warn' | 'neutral'> = {
  missed: 'warn', answered: 'success', voicemail: 'info', incoming: 'info', 'manual-reply': 'neutral',
};

// ── Call Log Tab ───────────────────────────────────────────────────────────

type CallFilter = 'all' | 'missed' | 'emergency' | 'sms_sent';

function CallLogTab() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<CallFilter>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: CallFilter) => {
    setLoading(true);
    try {
      let url = '/api/calls?per_page=50';
      if (f === 'missed') url += '&status=missed';
      if (f === 'emergency') url += '&emergency=true';
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls ?? []);
        setTotal(data.total ?? 0);
      }
    } catch { /* keep state */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const filters: { id: CallFilter; label: string }[] = [
    { id: 'all', label: 'All calls' },
    { id: 'missed', label: 'Missed' },
    { id: 'emergency', label: 'Emergency' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* filter strip */}
      <div style={{ padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600,
            background: filter === f.id ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#f6f7fb',
            color: filter === f.id ? '#fff' : RINGO.ink2,
          }}>{f.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: RINGO.ink3 }}>{total} calls</span>
      </div>

      {/* table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
        ) : calls.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📞</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: RINGO.ink, marginBottom: 6 }}>No calls yet</div>
            <div style={{ fontSize: 13, color: RINGO.ink3 }}>
              {filter === 'all' ? 'Calls will appear here once Ringo starts receiving them.' : `No ${filter} calls to show.`}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: RINGO.font.ui, fontSize: 13, marginTop: 16 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: RINGO.ink3, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {['Caller', 'When', 'Duration', 'Status', 'Tags'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', borderBottom: `1px solid ${RINGO.border}`, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls.map(cl => (
                <tr key={cl.id} style={{ color: RINGO.ink }}>
                  <td style={{ padding: '12px 12px', borderBottom: `1px solid ${RINGO.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={cl.caller_name || cl.caller_number} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{cl.caller_name || 'Unknown'}</div>
                        <div style={{ color: RINGO.ink3, fontSize: 11.5, fontFamily: RINGO.font.mono }}>{fmtPhone(cl.caller_number)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, color: RINGO.ink2, fontSize: 12.5 }}>{relTime(cl.created_at)} ago</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, color: RINGO.ink2, fontSize: 12.5 }}>{fmtDur(cl.duration_seconds)}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                    <Pill tone={STATUS_TONE[cl.call_status] ?? 'neutral'}>{cl.call_status}</Pill>
                  </td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                    {cl.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Bubble ─────────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: SmsMessage }) {
  const isOut = true; // all auto-replies are outbound
  return (
    <div style={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ padding: '10px 14px', borderRadius: isOut ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isOut ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#fff', color: isOut ? '#fff' : RINGO.ink, border: isOut ? 'none' : `1px solid ${RINGO.border}`, fontSize: 13.5, lineHeight: 1.55, boxShadow: isOut ? '0 8px 18px -10px rgba(124,58,237,0.4)' : 'none' }}>
          {msg.message}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 10.5, color: RINGO.ink3, fontFamily: RINGO.font.mono, justifyContent: isOut ? 'flex-end' : 'flex-start', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#6d28d9', fontWeight: 600 }}><Icon d={ICONS.ai} size={10} /> AUTO-REPLIED</span>
          <span>{relTime(msg.created_at)}</span>
          <span style={{ color: msg.status === 'sent' ? '#059669' : msg.status === 'failed' ? '#e11d48' : RINGO.ink3 }}>· {msg.status}</span>
        </div>
      </div>
    </div>
  );
}

// ── SMS Thread panel ───────────────────────────────────────────────────────

function ThreadPanel({ conv, onReplySent }: { conv: Conversation; onReplySent: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  async function handleSend() {
    const msg = replyText.trim();
    if (!msg) return;
    setSending(true);
    setSendError('');
    try {
      const res = await apiFetch('/api/sms/reply', {
        method: 'POST',
        body: JSON.stringify({ to: conv.caller_number, message: msg }),
      });
      if (res.ok) {
        setReplyText('');
        onReplySent();
      } else {
        const d = await res.json();
        setSendError(d.error ?? 'Failed to send');
      }
    } catch {
      setSendError('Network error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>
      {/* header */}
      <div style={{ padding: '14px 22px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar name={conv.caller_name || conv.caller_number} size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700 }}>{conv.caller_name || 'Unknown caller'}</div>
            {conv.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
          </div>
          <div style={{ fontSize: 12, color: RINGO.ink3, fontFamily: RINGO.font.mono, marginTop: 2 }}>{fmtPhone(conv.caller_number)} · {conv.call_count} call{conv.call_count !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* messages */}
      <div style={{ flex: 1, padding: '20px 22px', overflowY: 'auto' }}>
        {conv.messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: RINGO.ink3, fontSize: 13, paddingTop: 40 }}>No messages yet for this caller.</div>
        ) : (
          [...conv.messages].reverse().map(msg => <Bubble key={msg.id} msg={msg} />)
        )}
      </div>

      {/* reply box */}
      <div style={{ padding: '14px 22px', background: '#fff', borderTop: `1px solid ${RINGO.border}` }}>
        {sendError && (
          <div style={{ marginBottom: 8, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12.5, color: '#b91c1c' }}>{sendError}</div>
        )}
        <div style={{ padding: '10px 14px', borderRadius: 14, border: `1px solid ${RINGO.border}`, background: '#fff' }}>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={`Reply to ${fmtPhone(conv.caller_number)}…`}
            rows={2}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, resize: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 11, color: RINGO.ink3, fontFamily: RINGO.font.mono }}>{replyText.length}/1600</span>
          <button
            onClick={handleSend}
            disabled={sending || !replyText.trim()}
            style={{ marginLeft: 'auto', padding: '9px 16px', borderRadius: 9, border: 'none', cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer', background: replyText.trim() ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#e8eaef', color: replyText.trim() ? '#fff' : RINGO.ink3, fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: replyText.trim() ? '0 8px 18px -10px rgba(124,58,237,0.5)' : 'none' }}
          >
            <Icon d={ICONS.send} size={13} /> {sending ? 'Sending…' : 'Send SMS'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SMS Conversations Tab ──────────────────────────────────────────────────

function SmsTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sms/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
        setTotal(data.total ?? 0);
      }
    } catch { /* keep state */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, [load]);

  const selectedConv = conversations.find(c => c.caller_number === selectedNumber) ?? null;

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* thread list */}
      <div style={{ width: 320, flex: '0 0 320px', background: '#fff', borderRight: `1px solid ${RINGO.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${RINGO.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700 }}>Conversations</h2>
            <span style={{ padding: '2px 8px', borderRadius: 99, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{total}</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: RINGO.ink3 }}>
              No conversations yet. SMS replies will appear here.
            </div>
          ) : conversations.map((conv) => {
            const lastMsg = conv.messages[0];
            const isSelected = conv.caller_number === selectedNumber;
            return (
              <div key={conv.caller_number} onClick={() => setSelectedNumber(conv.caller_number)} style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${RINGO.border}`, background: isSelected ? 'linear-gradient(90deg,rgba(124,58,237,0.06),transparent 60%)' : '#fff', borderLeft: `3px solid ${isSelected ? '#7c3aed' : 'transparent'}`, cursor: 'pointer' }}>
                <Avatar name={conv.caller_name || conv.caller_number} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.caller_name || fmtPhone(conv.caller_number)}
                    </div>
                    <div style={{ fontSize: 11, color: RINGO.ink3, fontFamily: RINGO.font.mono, flexShrink: 0 }}>{relTime(conv.last_call_at)}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: RINGO.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {lastMsg ? lastMsg.message : 'No messages'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                    {conv.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
                    {lastMsg && <Pill tone={lastMsg.status === 'sent' ? 'success' : 'neutral'} dot={false}>{lastMsg.status}</Pill>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* thread panel */}
      {selectedConv ? (
        <ThreadPanel conv={selectedConv} onReplySent={load} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: RINGO.ink3 }}>
          <div style={{ fontSize: 40 }}>💬</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: RINGO.ink }}>Select a conversation</div>
          <div style={{ fontSize: 13 }}>Pick a thread from the left to read and reply.</div>
        </div>
      )}
    </div>
  );
}

// ── Inbox page ─────────────────────────────────────────────────────────────

type Tab = 'calls' | 'sms';

export default function Inbox() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('sms');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="sms" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Inbox" sub="Messages and call log for your business." />

        {/* tab switcher */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${RINGO.border}`, padding: '0 24px', display: 'flex', gap: 0 }}>
          {(['sms', 'calls'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? '#7c3aed' : RINGO.ink2,
              borderBottom: `2px solid ${tab === t ? '#7c3aed' : 'transparent'}`,
              marginBottom: -1,
            }}>
              {t === 'sms' ? '💬 Messages' : '📞 Call Log'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {tab === 'calls' ? <CallLogTab /> : <SmsTab />}
        </div>
      </div>
    </div>
  );
}

```
--------------------------------------------------


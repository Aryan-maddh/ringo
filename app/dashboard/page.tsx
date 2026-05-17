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

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          {deltaTone === 'up' ? 'â–²' : 'â–¼'} {delta}
        </span>
        <span>{sub}</span>
      </div>
    </div>
  );
}

// â”€â”€ Skeleton card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 14, padding: '12px 14px 10px', background: '#e8eaef', overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: 28, width: 80, borderRadius: 7, background: '#d4d7e0', marginBottom: 8 }} />
      <div style={{ height: 30, width: 60, borderRadius: 6, background: '#d4d7e0', marginBottom: 8 }} />
      <div style={{ height: 14, width: 120, borderRadius: 4, background: '#d4d7e0' }} />
    </div>
  );
}

// â”€â”€ Bar chart (real weekly data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Outcome donut â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Feed table (real data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
                : <span style={{ color: RINGO.ink4, fontSize: 12 }}>â€”</span>}
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

// â”€â”€ AI insight card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AIInsightCard({ stats }: { stats: DashStats | null }) {
  const items = stats ? [
    {
      tag: 'REPLY RATE',
      tone: stats.reply_rate >= 80 ? '#22d3ee' : '#fbbf24',
      text: stats.reply_rate >= 80
        ? `${stats.reply_rate}% of missed calls got an auto-reply today â€” above the 80% benchmark.`
        : `Reply rate is ${stats.reply_rate}% â€” check your Twilio number configuration to improve coverage.`,
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
    { tag: 'LOADING', tone: '#a5b4fc', text: 'Fetching AI insightsâ€¦', cta: '', href: '' },
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
          <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>Ringo AI Â· Daily brief</div>
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
              <button onClick={() => { if (it.href) window.location.href = it.href; }} style={{ padding: '5px 9px', borderRadius: 7, fontFamily: RINGO.font.ui, fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', whiteSpace: 'nowrap', flex: '0 0 auto' }}>{it.cta} â†’</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€ Dashboard page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [mounted, fetchStats]);

  const PHONE_NUMBERS = ['All numbers', ...(stats?.twilio_number ? [`${stats.twilio_number} Â· Your number`] : [])];

  if (!mounted) return null;

  const spark = stats?.calls_by_day.map(d => d.count) ?? [0];
  const cardBorder = `1px solid ${RINGO.border}`;

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
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
                  <Icon d={ICONS.filter} size={13} /> {activeNumber.split(' Â· ')[0]}
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
            <div className="r-dash-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="r-dash-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              <StatCard grad={RINGO.g1} label="Missed calls today" value={String(stats?.missed_calls_today ?? 0)} delta={`${stats?.missed_calls ?? 0} all time`} sub="vs. last period" icon={ICONS.phone} spark={spark} />
              <StatCard grad={RINGO.g2} label="Auto-replied" value={String(stats?.sms_sent_today ?? 0)} delta={stats ? `${stats.reply_rate}%` : 'â€”'} sub="reply rate" icon={ICONS.send} spark={spark} />
              <StatCard grad={RINGO.g3} label="Total calls" value={String(stats?.total_calls ?? 0)} delta={`${stats?.bookings_count ?? 0} bookings`} sub="all time" icon={ICONS.check} spark={spark} />
              <StatCard grad={RINGO.g4} label="Emergency" value={String(stats?.emergency_calls ?? 0)} delta="â€”" deltaTone="down" sub="flagged calls" icon={ICONS.clock} spark={spark} />
            </div>
          )}

          {/* Row 3: charts (1fr) */}
          <div className="r-dash-chart-row" style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 10, minHeight: 0 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: cardBorder, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '14px 18px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: RINGO.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Calls by day</div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, color: RINGO.ink, letterSpacing: '-0.02em', marginTop: 2 }}>This week â€” total vs. missed</div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: RINGO.ink2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: 'linear-gradient(180deg,#7c3aed,#06b6d4)' }} /> Total</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: 'linear-gradient(180deg,#fb923c,#fbbf24)' }} /> Missed</span>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                {stats?.calls_this_week
                  ? <WeekBars data={stats.calls_this_week} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RINGO.ink3, fontSize: 13 }}>Loadingâ€¦</div>
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
          <div className="r-dash-feed-row" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 10, minHeight: 0 }}>
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


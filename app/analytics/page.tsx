'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Sparkline } from '@/components/ringo/Sparkline';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

interface DashStats {
  total_calls: number;
  missed_calls: number;
  answered_calls: number;
  voicemail_calls: number;
  sms_sent: number;
  reply_rate: number;
  bookings_count: number;
  revenue_recovered: number;
  calls_by_day: { day: string; count: number; missed?: number }[];
}

const PERIODS = ['Today', '7 days', '30 days', '90 days'];

// ── Bar chart ──────────────────────────────────────────────────────────────

function BarChart({ bars }: { bars: { label: string; value: number; missed?: number }[] }) {
  const W = 800, H = 220, pad = { l: 38, r: 16, t: 14, b: 34 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const maxVal = Math.max(...bars.map(b => b.value), 1);
  const niceMax = Math.ceil(maxVal / 5) * 5 || 10;
  const slot = innerW / bars.length;
  const bw = Math.min(slot * 0.35, 26);

  const py = (v: number) => pad.t + innerH - (v / niceMax) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = pad.t + innerH * t;
        return (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={t === 1 ? '#d1d5e4' : '#eef0f6'} strokeWidth={1} strokeDasharray={t === 0 || t === 1 ? '' : '3 6'} />
            <text x={pad.l - 8} y={y + 3.5} textAnchor="end" fontSize="9" fontFamily={RINGO.font.mono} fill="#b8bdd4">
              {Math.round(niceMax * (1 - t))}
            </text>
          </g>
        );
      })}
      {bars.map((b, i) => {
        const cx = pad.l + slot * i + slot / 2;
        const totalH = Math.max((b.value / niceMax) * innerH, 3);
        const missedH = b.missed !== undefined ? Math.max((b.missed / niceMax) * innerH, 3) : 0;
        return (
          <g key={i}>
            <rect x={cx - bw - 2} y={py(b.value)} width={bw} height={totalH} rx={5} fill="url(#bg1)" opacity={0.88} />
            {b.missed !== undefined && (
              <rect x={cx + 2} y={py(b.missed)} width={bw} height={missedH} rx={5} fill="url(#bg2)" opacity={0.88} />
            )}
            {b.value > 0 && (
              <text x={cx - bw / 2 - 2} y={py(b.value) - 4} textAnchor="middle" fontSize="9" fontFamily={RINGO.font.mono} fill="#7d829c">{b.value}</text>
            )}
            <text x={cx} y={H - 10} textAnchor="middle" fontSize="10" fontFamily={RINGO.font.mono} fill="#7d829c">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Horizontal progress bar ────────────────────────────────────────────────

function MetricRow({ label, value, pct, color, sub }: { label: string; value: string; pct: number; color: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500, color: RINGO.ink2 }}>{label}</span>
          {sub && <span style={{ fontSize: 11.5, color: RINGO.ink3, marginLeft: 6 }}>{sub}</span>}
        </div>
        <span style={{ fontFamily: RINGO.font.head, fontSize: 14, fontWeight: 700, color: RINGO.ink }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#f1f3f9', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

// ── Donut segment helper ───────────────────────────────────────────────────

function OutcomeDonut({ answered, missed, voicemail }: { answered: number; missed: number; voicemail: number }) {
  const total = answered + missed + voicemail || 1;
  const R = 62, S = 16, C = 80;
  const slices = [
    { val: answered, color: 'url(#dG1)', label: 'Answered', bg: 'linear-gradient(135deg,#059669,#06b6d4)' },
    { val: missed, color: 'url(#dG2)', label: 'Missed', bg: 'linear-gradient(135deg,#fb923c,#fbbf24)' },
    { val: voicemail, color: '#e3e6ee', label: 'Voicemail', bg: '#e3e6ee' },
  ];
  const len = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg viewBox={`0 0 160 160`} width={160} height={160} style={{ flex: '0 0 auto' }}>
        <defs>
          <linearGradient id="dG1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="dG2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="#f1f3f9" strokeWidth={S} />
        {slices.map((s, i) => {
          const frac = s.val / total;
          const off = -(acc * len + len * 0.25);
          acc += frac;
          if (frac === 0) return null;
          return (
            <circle key={i} cx={C} cy={C} r={R} fill="none" stroke={s.color}
              strokeWidth={S} strokeDasharray={`${frac * len} ${len}`} strokeDashoffset={off}
              transform={`rotate(-90 ${C} ${C})`} strokeLinecap="butt" />
          );
        })}
        <text x={C} y={C - 6} textAnchor="middle" fontFamily={RINGO.font.head} fontWeight="700" fontSize="24" fill={RINGO.ink}>{total}</text>
        <text x={C} y={C + 14} textAnchor="middle" fontFamily={RINGO.font.ui} fontSize="11" fill={RINGO.ink3}>total calls</text>
      </svg>
      <div style={{ flex: 1 }}>
        {slices.map((s, i) => {
          const pct = Math.round((s.val / total) * 100);
          return (
            <div key={i} style={{ marginBottom: i < slices.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.bg, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: RINGO.ink2, fontWeight: 500 }}>{s.label}</span>
                </div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 14, fontWeight: 700, color: RINGO.ink }}>
                  {s.val} <span style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 400 }}>({pct}%)</span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: '#f1f3f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: s.bg }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, grad, icon, spark, delta, deltaTone = 'up' }: {
  label: string; value: string; sub: string; grad: string; icon: string;
  spark: number[]; delta: string; deltaTone?: 'up' | 'down';
}) {
  return (
    <div style={{ borderRadius: 16, padding: '18px 20px 14px', color: '#fff', background: grad, position: 'relative', overflow: 'hidden', fontFamily: RINGO.font.ui }}>
      <div style={{ position: 'absolute', right: -28, top: -28, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', filter: 'blur(1px)' }} />
      <div style={{ position: 'absolute', right: 14, bottom: 12, opacity: 0.88 }}>
        <Sparkline data={spark} width={70} height={26} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}>
          <Icon d={icon} size={14} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>{label}</div>
      </div>
      <div style={{ fontFamily: RINGO.font.head, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, opacity: 0.9 }}>
        <span style={{ padding: '2px 7px', borderRadius: 99, background: 'rgba(255,255,255,0.18)', fontWeight: 600 }}>
          {deltaTone === 'up' ? '▲' : '▼'} {delta}
        </span>
        <span>{sub}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30 days');

  const PERIOD_API: Record<string, string> = { 'Today': 'today', '7 days': '7d', '30 days': '30d', '90 days': '90d' };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setMounted(true);
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    apiFetch(`/api/dashboard/stats?period=${PERIOD_API[period] ?? '30d'}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, mounted]);

  if (!mounted) return null;

  const spark = (stats?.calls_by_day ?? []).map(d => d.count);
  const sparkSms = spark.map(v => Math.round(v * 0.78));

  const totalCalls = stats?.total_calls ?? 0;
  const missedCalls = stats?.missed_calls ?? 0;
  const smsSent = stats?.sms_sent ?? 0;
  const replyRate = stats?.reply_rate ?? 0;
  const bookings = stats?.bookings_count ?? 0;
  const revenue = stats?.revenue_recovered ?? 0;

  const answeredCalls = stats?.answered_calls ?? Math.max(totalCalls - missedCalls, 0);
  const voicemailCalls = stats?.voicemail_calls ?? 0;
  const actualMissed = Math.max(missedCalls - voicemailCalls, 0);

  function formatBarLabel(day: string): string {
    if (period === 'Today') {
      const hour = parseInt(day.split(':')[0]);
      return `${hour % 12 || 12}${hour < 12 ? 'a' : 'p'}`;
    }
    try {
      const d = new Date(day + 'T12:00:00Z');
      if (period === '7 days') return d.toLocaleDateString('en-US', { weekday: 'short' });
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return day; }
  }

  const bars = (stats?.calls_by_day ?? []).map(d => ({
    label: formatBarLabel(d.day),
    value: d.count,
    missed: d.missed ?? 0,
  }));

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="analytics" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Analytics" sub="Call volume, reply rates, and revenue recovery across your numbers." />

        {/* sub-header: period selector + export */}
        <div style={{ padding: '10px 24px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', background: RINGO.bg, padding: 3, borderRadius: 9, border: `1px solid ${RINGO.border}` }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, background: period === p ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : 'transparent', color: period === p ? '#fff' : RINGO.ink2 }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                const rows = [
                  ['Date', 'Total Calls', 'Missed Calls'],
                  ...bars.map(b => [b.label, b.value, b.missed ?? '']),
                ];
                const csv = rows.map(r => r.join(',')).join('\n');
                const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                const a = document.createElement('a');
                a.href = url; a.download = `ringo-analytics-${period.replace(' ', '-')}.csv`;
                a.click(); URL.revokeObjectURL(url);
              }}
              style={{ padding: '7px 13px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', fontFamily: RINGO.font.ui, fontSize: 12.5, color: RINGO.ink2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d={ICONS.upload} size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading analytics…</div>
          ) : (
            <>
              {/* Row 1: stat tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                <StatTile label="Total calls" value={String(totalCalls)} sub="vs last period" grad={RINGO.g1} icon={ICONS.phone} spark={spark} delta="+12%" />
                <StatTile label="Missed calls" value={String(missedCalls)} sub="handled by Ringo" grad={RINGO.g2} icon={ICONS.zap} spark={spark.map(v => Math.round(v * 0.42))} delta={`${Math.round((missedCalls / totalCalls) * 100)}%`} deltaTone="down" />
                <StatTile label="Reply rate" value={`${replyRate}%`} sub="of missed calls" grad={RINGO.g3} icon={ICONS.check} spark={sparkSms} delta="+3%" />
                <StatTile label="Revenue saved" value={`$${revenue.toLocaleString()}`} sub="estimated recovery" grad={RINGO.g4} icon={ICONS.dollar} spark={sparkSms.map(v => v * 12)} delta="+8%" />
              </div>

              {/* Row 2: main chart */}
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px 24px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 17, fontWeight: 700, color: RINGO.ink, letterSpacing: '-0.01em' }}>Calls by day</div>
                    <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 2 }}>Total vs. missed — {period}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: RINGO.ink2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'inline-block' }} /> Total
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg,#fb923c,#fbbf24)', display: 'inline-block' }} /> Missed
                    </span>
                  </div>
                </div>
                <BarChart bars={bars} />
              </div>

              {/* Row 3: outcomes + metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* call outcomes */}
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px 24px' }}>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, color: RINGO.ink, marginBottom: 4 }}>Call outcomes</div>
                  <div style={{ fontSize: 12.5, color: RINGO.ink3, marginBottom: 20 }}>How calls resolved over {period}</div>
                  <OutcomeDonut answered={answeredCalls} missed={actualMissed} voicemail={voicemailCalls} />
                </div>

                {/* key metrics */}
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px 24px' }}>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, color: RINGO.ink, marginBottom: 4 }}>Performance metrics</div>
                  <div style={{ fontSize: 12.5, color: RINGO.ink3, marginBottom: 20 }}>Key ratios for {period}</div>
                  <MetricRow label="SMS sent" value={String(smsSent)} pct={(smsSent / Math.max(missedCalls, 1)) * 100} color="linear-gradient(90deg,#7c3aed,#06b6d4)" sub={`of ${missedCalls} missed`} />
                  <MetricRow label="Bookings confirmed" value={String(bookings)} pct={(bookings / Math.max(smsSent, 1)) * 100} color="linear-gradient(90deg,#059669,#06b6d4)" sub="from SMS replies" />
                  <MetricRow label="Avg reply time" value="11s" pct={88} color="linear-gradient(90deg,#0284c7,#38bdf8)" sub="target: <15s" />
                  <MetricRow label="Revenue / booking" value={bookings ? `$${Math.round(revenue / bookings)}` : '—'} pct={72} color="linear-gradient(90deg,#d97706,#fbbf24)" />
                </div>
              </div>

              {/* Row 4: SMS funnel + sparkline trend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                {/* SMS funnel */}
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px 24px' }}>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, color: RINGO.ink, marginBottom: 4 }}>SMS funnel</div>
                  <div style={{ fontSize: 12.5, color: RINGO.ink3, marginBottom: 20 }}>From missed call to booked job</div>
                  {[
                    { l: 'Missed calls caught', v: missedCalls, color: RINGO.g1 },
                    { l: 'Auto-SMS sent', v: smsSent, color: RINGO.g2 },
                    { l: 'Customers replied', v: Math.round(smsSent * (replyRate / 100)), color: RINGO.g3 },
                    { l: 'Jobs booked', v: bookings, color: RINGO.g4 },
                  ].map((step, i, arr) => {
                    const pct = i === 0 ? 100 : Math.round((step.v / arr[0].v) * 100);
                    return (
                      <div key={i} style={{ marginBottom: i < arr.length - 1 ? 12 : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
                          <span style={{ color: RINGO.ink2, fontWeight: 500 }}>{step.l}</span>
                          <span style={{ fontFamily: RINGO.font.head, fontWeight: 700, color: RINGO.ink }}>{step.v} <span style={{ color: RINGO.ink3, fontSize: 11, fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: 8, borderRadius: 99, background: '#f1f3f9', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: step.color, borderRadius: 99 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* trend sparkline + insight */}
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px 24px' }}>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, color: RINGO.ink, marginBottom: 4 }}>Call volume trend</div>
                  <div style={{ fontSize: 12.5, color: RINGO.ink3, marginBottom: 16 }}>Rolling {spark.length}-day window</div>
                  <Sparkline data={spark} width={400} height={80} />
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Peak day', value: `${Math.max(...spark)} calls` },
                      { label: 'Daily avg', value: `${Math.round(spark.reduce((a, b) => a + b, 0) / spark.length)} calls` },
                      { label: 'Busiest time', value: '10 AM – 12 PM' },
                    ].map(({ label, value }, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${RINGO.border}` : 'none' }}>
                        <span style={{ fontSize: 12.5, color: RINGO.ink3 }}>{label}</span>
                        <span style={{ fontFamily: RINGO.font.head, fontSize: 13, fontWeight: 700, color: RINGO.ink }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

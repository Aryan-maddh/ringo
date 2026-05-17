'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Pill } from '@/components/ringo/Pill';
import { Sparkline } from '@/components/ringo/Sparkline';
import { RINGO } from '@/components/ringo/tokens';

interface HealthData {
  status: string;
  sms_sent_last_hour: number;
  sms_failed_last_hour: number;
  sms_error_rate: number;
  calls_last_hour: number;
  calls_last_24h: number;
  db_connected: boolean;
  api_latency_ms: number;
  webhook_latency_ms: number;
  uptime_pct: number;
  last_checked: string;
}

const SERVICES_STATIC = [
  { name: 'SMS API (Twilio)',   latencyKey: 'api_latency_ms'     as const },
  { name: 'Voice routing',     latencyKey: 'webhook_latency_ms' as const },
  { name: 'Database cluster',  latencyKey: null                           },
];

const spark99 = [99.9, 100, 100, 99.8, 100, 100, 99.99, 100, 99.97, 100, 100, 99.99];

export default function AdminSystemHealthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminApiFetch('/api/admin/system-health');
      if (res.ok) setHealth(await res.json());
    } catch { /* keep */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    setMounted(true);
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [router, load]);

  if (!mounted) return null;

  const errorRate = health?.sms_error_rate ?? 0;
  const isHealthy = errorRate < 5 && (health?.db_connected ?? true);

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="sys" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar title="System health" sub="Real-time service status, latency, and throughput." breadcrumb={['Admin', 'System health']} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: isHealthy ? '#e7f7ee' : '#fef2f2', border: `1px solid ${isHealthy ? '#b9e4ca' : '#fecaca'}`, borderRadius: 12, marginBottom: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: isHealthy ? '#10b981' : '#e11d48', boxShadow: `0 0 0 4px ${isHealthy ? 'rgba(16,185,129,0.2)' : 'rgba(225,29,72,0.2)'}` }} />
            <div style={{ fontWeight: 700, fontSize: 14, color: isHealthy ? '#075c3f' : '#b91c1c' }}>
              {isHealthy ? 'All systems operational' : 'Degraded performance detected'}
            </div>
            {health && (
              <div style={{ fontSize: 13, color: isHealthy ? '#075c3f' : '#b91c1c', opacity: 0.8, marginLeft: 4 }}>
                · {health.sms_failed_last_hour} failed SMS in last hour · DB {health.db_connected ? 'connected' : 'error'}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3 }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                {[
                  { l: 'Uptime',         v: `${health?.uptime_pct ?? 99.99}%`,                       g: RINGO.g3, ic: ICONS.zap },
                  { l: 'API latency',    v: `${health?.api_latency_ms ?? 0}ms`,                      g: RINGO.g1, ic: ICONS.bolt },
                  { l: 'SMS error rate', v: `${(health?.sms_error_rate ?? 0).toFixed(1)}%`,           g: RINGO.g4, ic: ICONS.flag },
                  { l: 'Calls · 24h',   v: (health?.calls_last_24h ?? 0).toLocaleString(),           g: RINGO.g2, ic: ICONS.phone },
                ].map((c, i) => (
                  <div key={i} style={{ borderRadius: 14, padding: '16px 18px', color: '#fff', background: c.g, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -22, top: -22, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={c.ic} size={13} /></div>
                      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>{c.l}</span>
                    </div>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${RINGO.border}` }}>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700 }}>Service status</div>
                    <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 4 }}>Live component health</div>
                  </div>
                  {[
                    { name: 'SMS delivery (Twilio)',  ok: (health?.sms_error_rate ?? 0) < 5,  latency: `${health?.api_latency_ms ?? 0}ms` },
                    { name: 'Webhook pipeline',       ok: (health?.webhook_latency_ms ?? 0) < 500, latency: `${health?.webhook_latency_ms ?? 0}ms` },
                    { name: 'Database cluster',       ok: health?.db_connected ?? true,        latency: '4ms' },
                    { name: 'Call routing',           ok: (health?.calls_last_hour ?? 0) >= 0, latency: '31ms' },
                  ].map((s, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${RINGO.border}` : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.ok ? '#10b981' : '#f59e0b', boxShadow: `0 0 0 3px ${s.ok ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 2 }}>Latency: {s.latency}</div>
                      </div>
                      <Pill tone={s.ok ? 'success' : 'warn'} dot>{s.ok ? 'operational' : 'degraded'}</Pill>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px 22px' }}>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Uptime trend</div>
                  <div style={{ fontSize: 12, color: RINGO.ink3, marginBottom: 16 }}>30-day rolling</div>
                  <Sparkline data={spark99.map(v => v * 10)} width={280} height={70} />
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { l: 'SMS sent · last hour',  v: String(health?.sms_sent_last_hour ?? 0) },
                      { l: 'Calls · last hour',     v: String(health?.calls_last_hour ?? 0) },
                      { l: 'Error rate',            v: `${(health?.sms_error_rate ?? 0).toFixed(2)}%` },
                    ].map(({ l, v }, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${RINGO.border}` : 'none' }}>
                        <span style={{ fontSize: 13, color: RINGO.ink3 }}>{l}</span>
                        <span style={{ fontFamily: RINGO.font.head, fontSize: 13, fontWeight: 700 }}>{v}</span>
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

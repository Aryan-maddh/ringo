'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Pill } from '@/components/ringo/Pill';
import { Sparkline } from '@/components/ringo/Sparkline';
import { RINGO } from '@/components/ringo/tokens';

interface SmsMessage {
  id: number;
  business_name: string;
  from_number: string;
  to_number: string;
  status: string;
  message: string;
  timestamp: string;
}

interface Stats {
  sent_24h: number;
  sent_7d: number;
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const spark = [120, 145, 132, 178, 165, 201, 188, 220, 197, 245, 231, 258];

export default function AdminSmsTrafficPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [stats, setStats] = useState<Stats>({ sent_24h: 0, sent_7d: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminApiFetch('/api/admin/sms-traffic?per_page=50');
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages ?? []);
        if (d.stats) setStats(d.stats);
      }
    } catch { /* keep state */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    setMounted(true);
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [router, load]);

  if (!mounted) return null;

  const failed = messages.filter(m => m.status === 'failed').length;
  const deliveryRate = messages.length > 0 ? ((messages.length - failed) / messages.length * 100).toFixed(1) : '100.0';

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="msg" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar title="SMS traffic" sub="Real-time message flow across all tenant numbers." breadcrumb={['Admin', 'SMS traffic']} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { l: 'Sent · 24h',     v: stats.sent_24h.toLocaleString(), g: RINGO.g1, ic: ICONS.msg },
              { l: 'Sent · 7 days',  v: stats.sent_7d.toLocaleString(),  g: RINGO.g3, ic: ICONS.zap },
              { l: 'Delivery rate',  v: `${deliveryRate}%`,              g: RINGO.g2, ic: ICONS.check },
              { l: 'Failed msgs',    v: String(failed),                  g: RINGO.g4, ic: ICONS.x },
            ].map((c, i) => (
              <div key={i} style={{ borderRadius: 14, padding: '16px 18px', color: '#fff', background: c.g, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -24, top: -24, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={c.ic} size={13} /></div>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>{c.l}</span>
                </div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700 }}>Message feed</div>
                  <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 2 }}>Last 50 messages · auto-refreshing every 15s</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'linear-gradient(135deg,rgba(5,150,105,0.1),rgba(6,182,212,0.08))', fontSize: 12, fontWeight: 600, color: '#059669' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', boxShadow: '0 0 0 3px rgba(5,150,105,0.2)' }} /> LIVE
                </span>
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: RINGO.ink3 }}>Loading…</div>
              ) : messages.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: RINGO.ink3 }}>No messages yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: RINGO.bg }}>
                      {['From', 'To', 'Business', 'Status', 'Time'].map((h, i) => (
                        <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${RINGO.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((m, i) => (
                      <tr key={m.id} style={{ borderBottom: i < messages.length - 1 ? `1px solid ${RINGO.border}` : 'none' }}>
                        <td style={{ padding: '12px 16px', fontFamily: RINGO.font.mono, fontSize: 12 }}>{m.from_number}</td>
                        <td style={{ padding: '12px 16px', fontFamily: RINGO.font.mono, fontSize: 12 }}>{m.to_number}</td>
                        <td style={{ padding: '12px 16px', color: RINGO.ink2 }}>{m.business_name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Pill tone={m.status === 'sent' ? 'success' : m.status === 'failed' ? 'danger' : 'neutral'} dot>{m.status}</Pill>
                        </td>
                        <td style={{ padding: '12px 16px', color: RINGO.ink3, fontSize: 12 }}>{relTime(m.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px 22px' }}>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Volume trend</div>
              <div style={{ fontSize: 12, color: RINGO.ink3, marginBottom: 16 }}>Hourly pattern (representative)</div>
              <Sparkline data={spark} width={320} height={80} />
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { l: 'Sent this week',  v: stats.sent_7d.toLocaleString() },
                  { l: 'Sent today',      v: stats.sent_24h.toLocaleString() },
                  { l: 'Failed today',    v: String(failed) },
                ].map(({ l, v }, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${RINGO.border}` : 'none' }}>
                    <span style={{ fontSize: 13, color: RINGO.ink3 }}>{l}</span>
                    <span style={{ fontFamily: RINGO.font.head, fontSize: 13, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

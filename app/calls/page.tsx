'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

interface CallLog {
  id: number;
  caller_number: string;
  caller_name: string | null;
  call_status: string;
  duration_seconds: number;
  emergency: boolean;
  created_at: string;
}

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
  missed: 'warn', answered: 'success', voicemail: 'info', incoming: 'info',
};

type CallFilter = 'all' | 'missed' | 'emergency';

export default function CallsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<CallFilter>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: CallFilter) => {
    setLoading(true);
    try {
      let url = '/api/calls?per_page=100';
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

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mounted) load(filter);
  }, [filter, load, mounted]);

  if (!mounted) return null;

  const filters: { id: CallFilter; label: string }[] = [
    { id: 'all', label: 'All calls' },
    { id: 'missed', label: 'Missed' },
    { id: 'emergency', label: 'Emergency' },
  ];

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="calls" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Call Log" sub="Every inbound call to your Ringo numbers." />

        <div style={{ padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, background: filter === f.id ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#f6f7fb', color: filter === f.id ? '#fff' : RINGO.ink2 }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: RINGO.ink3 }}>{total} calls</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
          ) : calls.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📞</div>
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
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
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
    </div>
  );
}

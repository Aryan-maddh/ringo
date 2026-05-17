'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Pill } from '@/components/ringo/Pill';
import { Avatar } from '@/components/ringo/Avatar';
import { RINGO } from '@/components/ringo/tokens';

interface AuditEvent {
  id: string;
  type: string;
  action: string;
  actor: string;
  resource: string;
  resource_id: number;
  timestamp: string;
}

const TYPE_TONE: Record<string, 'success' | 'danger' | 'info' | 'warn' | 'neutral'> = {
  call: 'info', sms: 'success',
};

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    setMounted(true);
    adminApiFetch('/api/admin/audit-log?per_page=50')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setEvents(d.events ?? []); setTotal(d.total ?? 0); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (!mounted) return null;

  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter.toLowerCase());

  function exportCsv() {
    const rows = [['ID', 'Type', 'Action', 'Actor', 'Timestamp'],
      ...events.map(e => [e.id, e.type, `"${e.action}"`, `"${e.actor}"`, e.timestamp])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv';
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="audit" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar title="Audit log" sub={`${total.toLocaleString()} events · call and SMS activity`} breadcrumb={['Admin', 'Audit log']} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ display: 'flex', background: '#fff', padding: 3, borderRadius: 9, border: `1px solid ${RINGO.border}` }}>
              {['All', 'Call', 'Sms'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, background: filter === f ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : 'transparent', color: filter === f ? '#fff' : RINGO.ink2 }}>
                  {f}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={exportCsv}
                style={{ padding: '7px 13px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', fontFamily: RINGO.font.ui, fontSize: 12.5, color: RINGO.ink2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.upload} size={13} /> Export
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3 }}>Loading…</div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: RINGO.bg }}>
                    {['Actor', 'Action', 'Type', 'Time'].map((h, i) => (
                      <th key={i} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${RINGO.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: RINGO.ink3 }}>No events found</td></tr>
                  ) : filtered.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${RINGO.border}` : 'none' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={e.actor} size={28} />
                          <span style={{ fontWeight: 600, color: RINGO.ink }}>{e.actor}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', color: RINGO.ink2, fontWeight: 500 }}>{e.action}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <Pill tone={TYPE_TONE[e.type] ?? 'neutral'}>{e.type}</Pill>
                      </td>
                      <td style={{ padding: '13px 16px', color: RINGO.ink3, fontSize: 12.5 }}>{relTime(e.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

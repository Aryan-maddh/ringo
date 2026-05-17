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

interface Contact {
  caller_number: string;
  caller_name: string | null;
  call_count: number;
  last_call_at: string;
  emergency: boolean;
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

export default function ContactsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/sms/conversations');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.conversations ?? []);
      }
    } catch { /* keep state */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    load();
  }, [router, load]);

  if (!mounted) return null;

  const filtered = contacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.caller_name ?? '').toLowerCase().includes(q) || c.caller_number.includes(q);
  });

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="contacts" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Contacts" sub="All callers who have reached your Ringo numbers." />

        <div style={{ padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 9, background: RINGO.bg, border: `1px solid ${RINGO.border}`, flex: 1, maxWidth: 360 }}>
            <Icon d={ICONS.search} size={15} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or number…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, flex: 1 }}
            />
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: RINGO.ink3 }}>{filtered.length} contacts</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: RINGO.ink, marginBottom: 6 }}>
                {search ? 'No matches found' : 'No contacts yet'}
              </div>
              <div style={{ fontSize: 13, color: RINGO.ink3 }}>Callers appear here once Ringo starts receiving calls.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: RINGO.font.ui, fontSize: 13, marginTop: 16 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: RINGO.ink3, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {['Contact', 'Phone', 'Calls', 'Last seen', 'Tags'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', borderBottom: `1px solid ${RINGO.border}`, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} style={{ color: RINGO.ink }}>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={c.caller_name || c.caller_number} size={32} />
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.caller_name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, color: RINGO.ink2, fontSize: 12.5 }}>{fmtPhone(c.caller_number)}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, color: RINGO.ink2, fontSize: 12.5 }}>{c.call_count}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, color: RINGO.ink2, fontSize: 12.5 }}>{relTime(c.last_call_at)} ago</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                      {c.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
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

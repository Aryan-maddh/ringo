'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { RINGO } from '@/components/ringo/tokens';

interface UserRow {
  id: number;
  email: string;
  created_at: string;
  businesses_count: number;
  plan: string | null;
  business_name: string | null;
  suspended: boolean;
}

function relTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const days = Math.floor(d / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    setMounted(true);
    adminApiFetch('/api/admin/users?per_page=50')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setUsers(d.users ?? []); setTotal(d.total ?? 0); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="usr" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar title="Users & roles" sub="All registered accounts and their business details." breadcrumb={['Admin', 'Users & roles']} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: RINGO.ink3 }}>
              {users.filter(u => !u.suspended).length} active · {total} total
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', borderRadius: 9, border: `1px solid ${RINGO.border}`, minWidth: 260 }}>
              <Icon d={ICONS.search} size={14} />
              <input placeholder="Search by email…"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 13, color: RINGO.ink, fontFamily: RINGO.font.ui }} />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3 }}>Loading…</div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: RINGO.font.ui, fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: RINGO.bg }}>
                    {['User', 'Business', 'Plan', 'Status', 'Joined', ''].map((h, i) => (
                      <th key={i} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${RINGO.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: RINGO.ink3 }}>No users found</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${RINGO.border}` : 'none' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Avatar name={u.email.split('@')[0]} size={34} />
                          <div>
                            <div style={{ fontWeight: 600, color: RINGO.ink }}>{u.email.split('@')[0]}</div>
                            <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 2 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: RINGO.ink2 }}>
                        {u.business_name ?? <span style={{ color: RINGO.ink4 }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {u.plan ? (
                          <Pill tone={u.plan === 'pro' ? 'violet' : u.plan === 'growth' ? 'info' : 'neutral'} dot={false}>
                            {u.plan}
                          </Pill>
                        ) : <span style={{ color: RINGO.ink4 }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Pill tone={u.suspended ? 'danger' : 'success'} dot>
                          {u.suspended ? 'suspended' : 'active'}
                        </Pill>
                      </td>
                      <td style={{ padding: '14px 18px', color: RINGO.ink3, fontSize: 13 }}>{relTime(u.created_at)}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => router.push(`/admin/businesses`)}
                          style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: RINGO.font.ui }}>
                          View
                        </button>
                      </td>
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

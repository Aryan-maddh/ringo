'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

interface ReviewRequest {
  id: number;
  caller_name: string;
  phone: string;
  platform: string;
  status: string;
  rating: number | null;
  sent_at: string;
}

const STATUS_TONE: Record<string, 'success' | 'info' | 'neutral'> = {
  opened:  'success',
  clicked: 'info',
  rated:   'success',
  sent:    'neutral',
};

const PLATFORMS = ['Google', 'Yelp', 'Facebook', 'Trustpilot'];

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

export default function ReviewsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ phone: '', caller_name: '', platform: 'Google', review_url: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setMounted(true);
    load();
  }, [router]);

  async function load() {
    try {
      const res = await apiFetch('/api/reviews');
      if (res.ok) { const d = await res.json(); setReviews(d.reviews ?? []); }
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone.trim()) { setSendError('Phone number is required'); return; }
    setSending(true); setSendError('');
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const d = await res.json();
        setReviews(prev => [d, ...prev]);
        setShowModal(false);
        setForm({ phone: '', caller_name: '', platform: 'Google', review_url: '' });
      } else {
        const d = await res.json();
        setSendError(d.error ?? 'Failed to send review request');
      }
    } catch { setSendError('Network error'); }
    finally { setSending(false); }
  }

  if (!mounted) return null;

  const opened = reviews.filter(r => r.status === 'opened' || r.status === 'rated').length;
  const rated  = reviews.filter(r => r.rating).length;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 9,
    border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui,
    fontSize: 13.5, color: RINGO.ink, background: '#fff', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="reviews" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Review Requests" sub="Review invitations sent after a completed booking." />

        <div style={{ padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 12.5, fontWeight: 600, fontFamily: RINGO.font.ui, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon d={ICONS.plus} size={13} /> Send review request
          </button>
          <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', fontSize: 12.5, color: RINGO.ink3 }}>
            <span>{reviews.length} sent</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>{opened} opened</span>
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>{rated} rated</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
          ) : reviews.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>
              No review requests yet. Send your first one above.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: RINGO.font.ui, fontSize: 13, marginTop: 16 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: RINGO.ink3, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {['Customer', 'Phone', 'Platform', 'Status', 'Sent', 'Rating'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', borderBottom: `1px solid ${RINGO.border}`, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} style={{ color: RINGO.ink }}>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={r.caller_name} size={28} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{r.caller_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, color: RINGO.ink2, fontSize: 12.5 }}>{fmtPhone(r.phone)}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, color: RINGO.ink2, fontSize: 12.5 }}>{r.platform}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                      <Pill tone={STATUS_TONE[r.status] ?? 'neutral'} dot={false}>{r.status}</Pill>
                    </td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, color: RINGO.ink2, fontSize: 12.5 }}>{relTime(r.sent_at)} ago</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                      {r.rating ? (
                        <div style={{ display: 'flex', gap: 1, color: '#fbbf24' }}>
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Icon key={i} d={ICONS.star} size={13} fill="#fbbf24" />
                          ))}
                        </div>
                      ) : <span style={{ color: RINGO.ink4, fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Send review request modal */}
      {showModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,21,53,0.45)', zIndex: 200 }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: '28px 32px', width: 440, zIndex: 201, boxShadow: '0 24px 64px -16px rgba(0,0,0,0.3)' }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, marginBottom: 6, color: RINGO.ink }}>Send review request</div>
            <div style={{ fontSize: 12.5, color: RINGO.ink3, marginBottom: 22 }}>We'll send an SMS inviting the customer to leave a review.</div>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Phone number *</label>
                <input style={inputStyle} placeholder="+1 (415) 555-0188" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Customer name</label>
                <input style={inputStyle} placeholder="Jane Smith" value={form.caller_name}
                  onChange={e => setForm(f => ({ ...f, caller_name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Platform</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.platform}
                    onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Review URL</label>
                  <input style={inputStyle} placeholder="https://g.page/…" value={form.review_url}
                    onChange={e => setForm(f => ({ ...f, review_url: e.target.value }))} />
                </div>
              </div>
              {sendError && <div style={{ fontSize: 12.5, color: '#dc2626', padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>{sendError}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, color: RINGO.ink2 }}>
                  Cancel
                </button>
                <button type="submit" disabled={sending}
                  style={{ padding: '9px 22px', borderRadius: 9, border: 'none', cursor: sending ? 'default' : 'pointer', background: sending ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600 }}>
                  {sending ? 'Sending…' : 'Send request'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

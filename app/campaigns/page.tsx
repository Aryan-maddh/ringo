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

interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'paused';
  sent: number;
  replied: number;
  booked: number;
  last_sent: string | null;
  message_template: string;
  delay_hours: number;
  trigger: string;
}

const GRADS = [RINGO.g1, RINGO.g2, RINGO.g3, RINGO.g4];
const TRIGGERS = [
  { value: 'missed_call',  label: 'Missed call' },
  { value: 'no_show',      label: 'No-show (48h)' },
  { value: 'quote_accept', label: 'Quote accepted' },
  { value: 'win_back',     label: 'Win-back (7+ days)' },
];

function relTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui,
  fontSize: 13.5, color: RINGO.ink, background: '#fff', boxSizing: 'border-box', outline: 'none',
};

export default function CampaignsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', message_template: '', delay_hours: 24, trigger: 'missed_call' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setMounted(true);
    load();
  }, [router]);

  async function load() {
    try {
      const res = await apiFetch('/api/campaigns');
      if (res.ok) { const d = await res.json(); setCampaigns(d.campaigns ?? []); }
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  }

  async function toggleStatus(c: Campaign) {
    const next = c.status === 'active' ? 'paused' : 'active';
    setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: next as 'active' | 'paused' } : x));
    try {
      await apiFetch(`/api/campaigns/${c.id}`, { method: 'PUT', body: JSON.stringify({ status: next }) });
    } catch {
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: c.status } : x));
    }
  }

  function openEdit(c: Campaign) {
    setEditId(c.id);
    setForm({ name: c.name, message_template: c.message_template, delay_hours: c.delay_hours, trigger: c.trigger });
    setFormError('');
    setShowNew(true);
  }

  function openNew() {
    setEditId(null);
    setForm({ name: '', message_template: '', delay_hours: 24, trigger: 'missed_call' });
    setFormError('');
    setShowNew(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSaving(true); setFormError('');
    try {
      let res: Response;
      if (editId) {
        res = await apiFetch(`/api/campaigns/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        res = await apiFetch('/api/campaigns', { method: 'POST', body: JSON.stringify(form) });
      }
      if (res.ok) {
        const d = await res.json();
        if (editId) {
          setCampaigns(prev => prev.map(x => x.id === editId ? d : x));
        } else {
          setCampaigns(prev => [d, ...prev]);
        }
        setShowNew(false);
      } else {
        const d = await res.json();
        setFormError(d.error ?? 'Failed to save');
      }
    } catch { setFormError('Network error'); }
    finally { setSaving(false); }
  }

  if (!mounted) return null;

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="campaigns" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Campaigns" sub="Automated follow-up sequences to win back missed customers." />

        <div style={{ padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={openNew}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 12.5, fontWeight: 600, fontFamily: RINGO.font.ui, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon d={ICONS.plus} size={13} /> New campaign
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: RINGO.ink3 }}>
            {campaigns.filter(c => c.status === 'active').length} active · {campaigns.length} total
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
          ) : campaigns.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>
              No campaigns yet. Create your first one above.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {campaigns.map((c, idx) => (
                <div key={c.id} style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <IconTile grad={GRADS[idx % GRADS.length]} size={36} radius={10}>
                      <Icon d={ICONS.zap} size={16} />
                    </IconTile>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: RINGO.ink3, marginTop: 2 }}>
                        {c.last_sent ? `Last sent ${relTime(c.last_sent)} ago` : 'Never sent'}
                      </div>
                    </div>
                    <Pill tone={c.status === 'active' ? 'success' : 'neutral'} dot>{c.status}</Pill>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {[{ l: 'Sent', v: c.sent }, { l: 'Replied', v: c.replied }, { l: 'Booked', v: c.booked }].map(({ l, v }, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700, color: RINGO.ink }}>{v}</div>
                        <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '12px 20px', borderTop: `1px solid ${RINGO.border}`, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => toggleStatus(c)}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${RINGO.border}`, background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, color: RINGO.ink2 }}
                    >
                      {c.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, color: '#fff' }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New / Edit modal */}
      {showNew && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,21,53,0.45)', zIndex: 200 }} onClick={() => setShowNew(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: '28px 32px', width: 480, zIndex: 201, boxShadow: '0 24px 64px -16px rgba(0,0,0,0.3)' }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, marginBottom: 6, color: RINGO.ink }}>
              {editId ? 'Edit campaign' : 'New campaign'}
            </div>
            <div style={{ fontSize: 12.5, color: RINGO.ink3, marginBottom: 22 }}>
              Auto-send an SMS when the trigger fires.
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Campaign name *</label>
                <input style={inputStyle} placeholder="Win-back: missed 7+ days" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Trigger</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.trigger}
                  onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}>
                  {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Delay (hours after trigger)</label>
                <input type="number" min={0} max={720} style={inputStyle} value={form.delay_hours}
                  onChange={e => setForm(f => ({ ...f, delay_hours: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Message template</label>
                <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Hi! We missed your call. Can we help you today? Reply to book."
                  value={form.message_template}
                  onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))} />
              </div>
              {formError && <div style={{ fontSize: 12.5, color: '#dc2626', padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" onClick={() => setShowNew(false)}
                  style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, color: RINGO.ink2 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '9px 22px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600 }}>
                  {saving ? 'Saving…' : (editId ? 'Save changes' : 'Create campaign')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

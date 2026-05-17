'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { RINGO } from '@/components/ringo/tokens';

interface Doc { title: string; sub: string; g: string; ic: string; updated: string; }

const INITIAL_DOCS: Doc[] = [
  { title: 'Onboarding runbook',       sub: 'How to set up new tenant accounts end-to-end', g: RINGO.iVio, ic: ICONS.bld,  updated: '2 days ago' },
  { title: 'Incident response guide',  sub: 'Steps for SMS outage, billing errors, security events', g: RINGO.iRos, ic: ICONS.flag, updated: '1 week ago' },
  { title: 'Twilio number management', sub: 'Purchasing, porting, and releasing phone numbers', g: RINGO.iSky, ic: ICONS.phone, updated: '3 days ago' },
  { title: 'A2P 10DLC guide',          sub: 'Brand and campaign registration walkthrough', g: RINGO.iEme, ic: ICONS.shld, updated: '2 weeks ago' },
  { title: 'Billing & invoicing',      sub: 'Stripe integration, proration, and refund flows', g: RINGO.iAmb, ic: ICONS.card, updated: '5 days ago' },
  { title: 'API reference',            sub: 'Internal endpoints, auth, and webhook schemas', g: RINGO.iSlt, ic: ICONS.glob, updated: '1 day ago' },
];

const EMPTY_FORM = { title: '', sub: '' };

export default function AdminDocsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  const filtered = docs
    .map((d, i) => ({ ...d, _idx: i }))
    .filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.sub.toLowerCase().includes(search.toLowerCase()));

  function openEdit(idx: number) {
    setEditForm({ title: docs[idx].title, sub: docs[idx].sub });
    setEditIdx(idx);
  }

  function saveEdit() {
    if (!editForm.title.trim() || editIdx === null) return;
    setDocs(ds => ds.map((d, i) => i === editIdx ? { ...d, title: editForm.title.trim(), sub: editForm.sub.trim(), updated: 'just now' } : d));
    setEditIdx(null);
  }

  function saveNew() {
    if (!newForm.title.trim()) return;
    setDocs(ds => [...ds, { title: newForm.title.trim(), sub: newForm.sub.trim(), g: RINGO.iVio, ic: ICONS.bld, updated: 'just now' }]);
    setNewForm(EMPTY_FORM);
    setShowNew(false);
  }

  const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: RINGO.ink2, marginBottom: 5 };

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="docs" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar title="Internal docs" sub="Runbooks, guides, and reference documentation for Ringo staff." breadcrumb={['Admin', 'Internal docs']} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, maxWidth: 440, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, border: `1px solid ${RINGO.border}`, background: '#fff' }}>
              <Icon d={ICONS.search} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs…"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink }} />
            </div>
            <button
              onClick={() => { setNewForm(EMPTY_FORM); setShowNew(true); }}
              style={{ padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: RINGO.font.ui, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon d={ICONS.plus} size={13} /> New doc
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {filtered.map((doc) => (
              <div key={doc._idx} style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(0,0,0,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <IconTile grad={doc.g} size={38} radius={10}>
                    <Icon d={doc.ic} size={17} />
                  </IconTile>
                  <div>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 15, fontWeight: 700, color: RINGO.ink }}>{doc.title}</div>
                    <div style={{ fontSize: 11.5, color: RINGO.ink3, marginTop: 2 }}>Updated {doc.updated}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: RINGO.ink2, lineHeight: 1.55 }}>{doc.sub}</div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setViewIdx(doc._idx); }}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1px solid ${RINGO.border}`, background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, color: RINGO.ink2 }}>
                    View
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(doc._idx); }}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600, color: '#fff' }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View modal */}
      {viewIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setViewIdx(null)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', width: 520, boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <IconTile grad={docs[viewIdx].g} size={42} radius={11}>
                <Icon d={docs[viewIdx].ic} size={19} />
              </IconTile>
              <div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700 }}>{docs[viewIdx].title}</div>
                <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 3 }}>Updated {docs[viewIdx].updated}</div>
              </div>
              <button onClick={() => setViewIdx(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: RINGO.ink3, fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: '16px', borderRadius: 10, background: RINGO.bg, border: `1px solid ${RINGO.border}`, fontSize: 13.5, color: RINGO.ink2, lineHeight: 1.7 }}>
              {docs[viewIdx].sub}
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setViewIdx(null)}
                style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
              <button onClick={() => { openEdit(viewIdx); setViewIdx(null); }}
                style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setEditIdx(null)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', width: 480, boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700 }}>Edit doc</div>
              <button onClick={() => setEditIdx(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: RINGO.ink3, fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title</label>
              <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Description</label>
              <textarea value={editForm.sub} onChange={e => setEditForm(f => ({ ...f, sub: e.target.value }))}
                rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditIdx(null)}
                style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEdit}
                style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New doc modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowNew(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', width: 480, boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700 }}>New doc</div>
              <button onClick={() => setShowNew(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: RINGO.ink3, fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title</label>
              <input value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Escalation playbook" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Description</label>
              <textarea value={newForm.sub} onChange={e => setNewForm(f => ({ ...f, sub: e.target.value }))}
                rows={3} placeholder="Brief description of this document…" style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNew(false)}
                style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveNew}
                style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Create doc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

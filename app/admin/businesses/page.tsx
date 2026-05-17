'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar, StatCardA2 } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { RINGO } from '@/components/ringo/tokens';

// ── Types ──────────────────────────────────────────────────────────────────

interface BizRow {
  id: number;
  n: string;
  city: string;
  plan: string;
  status: string;
  mrr: number;
  repl: number;
  since: string;
  g: string;
  owner: string;
}

type PillTone = 'success' | 'info' | 'warn' | 'neutral' | 'danger' | 'violet';

// ── Static fallback rows ───────────────────────────────────────────────────

const FALLBACK_ROWS: BizRow[] = [
  { id:1,  n:'Pacific Plumbing Co.',  city:'San Francisco · CA', plan:'Crew', status:'active',   mrr:237, repl:1842, since:'Aug 2024', g:RINGO.iEme, owner:'Marco Devereaux' },
  { id:2,  n:'Brightspark Electric',  city:'Denver · CO',        plan:'Shop', status:'active',   mrr:612, repl:3104, since:'Jan 2024', g:RINGO.iAmb, owner:'Lila Chen' },
  { id:3,  n:'Foxtail HVAC',          city:'Austin · TX',        plan:'Crew', status:'active',   mrr:237, repl:1421, since:'Mar 2024', g:RINGO.iSky, owner:'Pedro Ramírez' },
  { id:4,  n:'Salon Lume',            city:'Austin · TX',        plan:'Solo', status:'active',   mrr:87,  repl:892,  since:'Sep 2024', g:RINGO.iPnk, owner:'Yara Ahmadi' },
  { id:5,  n:'Roof & Ridge',          city:'Seattle · WA',       plan:'Crew', status:'active',   mrr:237, repl:744,  since:'Nov 2024', g:RINGO.iVio, owner:'James Holloway' },
  { id:6,  n:'Tide Cleaning Co.',     city:'Miami · FL',         plan:'Solo', status:'trial',    mrr:0,   repl:612,  since:'Apr 2026', g:RINGO.iRos, owner:'Sofia Martinez' },
  { id:7,  n:'Glasshouse Windows',    city:'Portland · OR',      plan:'Crew', status:'active',   mrr:237, repl:521,  since:'Feb 2025', g:RINGO.iEme, owner:'David Kang' },
  { id:8,  n:'Bowery Barbers',        city:'Brooklyn · NY',      plan:'Solo', status:'past_due', mrr:87,  repl:498,  since:'Oct 2024', g:RINGO.iAmb, owner:'Anika Patel' },
  { id:9,  n:'Mesa Locksmith',        city:'Phoenix · AZ',       plan:'Solo', status:'active',   mrr:87,  repl:412,  since:'May 2025', g:RINGO.iSky, owner:'Tomás Reyes' },
  { id:10, n:'Greenline Landscaping', city:'Atlanta · GA',       plan:'Crew', status:'active',   mrr:237, repl:401,  since:'Jul 2024', g:RINGO.iPnk, owner:'Hannah Brooks' },
  { id:11, n:'Cobalt Garage Doors',   city:'San Diego · CA',     plan:'Crew', status:'paused',   mrr:0,   repl:387,  since:'Jun 2024', g:RINGO.iVio, owner:'Aaron Schultz' },
  { id:12, n:'Stone & Hearth Tile',   city:'Boston · MA',        plan:'Shop', status:'active',   mrr:612, repl:362,  since:'Dec 2023', g:RINGO.iRos, owner:'Olu Adeyemi' },
  { id:13, n:'Bayou Tree Service',    city:'New Orleans · LA',   plan:'Solo', status:'active',   mrr:87,  repl:341,  since:'Mar 2026', g:RINGO.iEme, owner:'Marc Thibodeaux' },
  { id:14, n:'Pinecrest Veterinary',  city:'Boulder · CO',       plan:'Crew', status:'active',   mrr:237, repl:298,  since:'Aug 2024', g:RINGO.iAmb, owner:'Dr. Reema Sahni' },
  { id:15, n:'Echo Ridge Carpentry',  city:'Nashville · TN',     plan:'Solo', status:'churned',  mrr:0,   repl:284,  since:'Mar 2024', g:RINGO.iSky, owner:'Will Carlton' },
  { id:16, n:'Maplewood Movers',      city:'Minneapolis · MN',   plan:'Crew', status:'active',   mrr:237, repl:271,  since:'Apr 2025', g:RINGO.iPnk, owner:'Greg Ostlund' },
];

const STATUS_MAP: Record<string, { tone: PillTone; label: string }> = {
  active:   { tone: 'success', label: 'Active' },
  trial:    { tone: 'info',    label: 'Trial' },
  past_due: { tone: 'warn',    label: 'Past due' },
  paused:   { tone: 'neutral', label: 'Paused' },
  churned:  { tone: 'danger',  label: 'Churned' },
};

const DOT_COLORS: Record<string, string> = {
  neutral: '#7d829c', success: '#10b981', info: '#0ea5e9',
  warn: '#fb923c', danger: '#e11d48', violet: '#7c3aed',
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminBusinesses() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<BizRow[]>(FALLBACK_ROWS);
  const [total, setTotal] = useState(4470);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', email: '', plan: 'starter', business_type: '' });
  const [newSaving, setNewSaving] = useState(false);
  const [newError, setNewError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    async function load() {
      try {
        const res = await adminApiFetch('/api/admin/businesses?per_page=16');
        if (!res.ok) return;
        const d = await res.json();
        setTotal(d.total ?? FALLBACK_ROWS.length);
        if (d.businesses?.length) {
          const gradients = [RINGO.iEme, RINGO.iAmb, RINGO.iSky, RINGO.iPnk, RINGO.iVio, RINGO.iRos];
          setRows(d.businesses.map((b: Record<string, unknown>, i: number) => ({
            id: b.id as number,
            n: b.name as string,
            city: (b.business_type as string) ?? '—',
            plan: 'Solo',
            status: 'active',
            mrr: 87,
            repl: 0,
            since: new Date(b.created_at as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            g: gradients[i % gradients.length],
            owner: `User #${b.user_id}`,
          })));
        }
      } catch { /* keep fallback */ }
    }
    load();
  }, [router]);

  async function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.email.trim()) { setNewError('Name and email are required'); return; }
    setNewSaving(true); setNewError('');
    try {
      const res = await adminApiFetch('/api/admin/businesses', { method: 'POST', body: JSON.stringify(newForm) });
      if (res.ok) {
        const d = await res.json();
        const gradients = [RINGO.iEme, RINGO.iAmb, RINGO.iSky, RINGO.iPnk, RINGO.iVio, RINGO.iRos];
        const newRow: BizRow = {
          id: d.id, n: d.name, city: d.business_type ?? '—', plan: d.plan,
          status: 'active', mrr: 87, repl: 0,
          since: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          g: gradients[rows.length % gradients.length], owner: d.user?.email ?? newForm.email,
        };
        setRows(prev => [newRow, ...prev]);
        setTotal(t => t + 1);
        setShowNew(false);
        setNewForm({ name: '', email: '', plan: 'starter', business_type: '' });
      } else {
        const d = await res.json(); setNewError(d.error ?? 'Failed to create');
      }
    } catch { setNewError('Network error'); }
    finally { setNewSaving(false); }
  }

  if (!mounted) return null;

  const nfInputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 9,
    border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui,
    fontSize: 13.5, color: RINGO.ink, background: '#fff', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div className="r-app-shell" style={{ display: 'flex', minHeight: '100vh', background: RINGO.bg,
      fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="biz" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminTopbar
          title="Businesses"
          sub={`${total.toLocaleString()} total · 184 trials · 56 past-due · 12 paused`}
          breadcrumb={['Admin', 'Businesses']} />

        <div style={{ flex: 1, padding: '20px 28px 28px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Snapshot */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <StatCardA2 grad={RINGO.g1} label="Total accounts" value={total.toLocaleString()}
              delta="+218" sub="this month" icon={ICONS.bld} />
            <StatCardA2 grad={RINGO.g3} label="Activation rate" value="78.4%"
              delta="+3.1pp" sub="trial → paid" icon={ICONS.zap} />
            <StatCardA2 grad={RINGO.g2} label="Past due" value="56"
              delta="−14" sub="auto-retry runs Friday" icon={ICONS.flag} />
            <StatCardA2 grad="linear-gradient(135deg,#d97706,#fbbf24)"
              label="Avg MRR / acct" value="$36.12" delta="+$2.40"
              sub="vs last month" icon={ICONS.dollar} />
          </div>

          {/* Filters */}
          <div style={{ background: '#f6f7fb', borderRadius: 14, padding: 8,
            display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${RINGO.border}`,
            flexWrap: 'wrap' }}>
            {[
              { l: 'All', c: total.toLocaleString(), active: true, tone: 'none' },
              { l: 'Active',   c: '4,218', tone: 'success' },
              { l: 'Trial',    c: '184',   tone: 'info' },
              { l: 'Past due', c: '56',    tone: 'warn' },
              { l: 'Paused',   c: '12',    tone: 'neutral' },
              { l: 'Churned',  c: '312',   tone: 'danger' },
            ].map((f, i) => (
              <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 12px', borderRadius: 9, cursor: 'pointer',
                fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600,
                background: f.active ? '#fff' : 'transparent',
                border: f.active ? `1px solid ${RINGO.borderStrong}` : '1px solid transparent',
                color: f.active ? RINGO.ink : RINGO.ink2,
                boxShadow: f.active ? '0 2px 6px -2px rgba(15,21,53,0.1)' : 'none' }}>
                {f.tone !== 'none' && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%',
                    background: DOT_COLORS[f.tone] ?? '#7d829c' }} />
                )}
                {f.l}
                <span style={{ padding: '1px 7px', borderRadius: 99, background: '#f1f3f9',
                  color: RINGO.ink3, fontSize: 11, fontFamily: RINGO.font.mono }}>{f.c}</span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: '#fff', borderRadius: 9, border: `1px solid ${RINGO.border}`,
              minWidth: 280 }}>
              <Icon d={ICONS.search} size={14} stroke={2} />
              <input placeholder="Search by name, owner, phone…"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1,
                  fontSize: 13, color: RINGO.ink, fontFamily: RINGO.font.ui }} />
            </div>
            <button
              onClick={() => { setNewError(''); setShowNew(true); }}
              style={{ padding: '8px 12px', borderRadius: 9,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', border: 'none', color: '#fff',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 8px 18px -8px rgba(124,58,237,0.55)' }}>
              <Icon d={ICONS.plus} size={13} /> New business
            </button>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${RINGO.border}`,
              display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" style={{ accentColor: '#7c3aed' }} />
              <div style={{ fontSize: 13, color: RINGO.ink2 }}>
                <span style={{ fontWeight: 700, color: RINGO.ink }}>{rows.length}</span> shown ·
                showing 1–{rows.length} of {total.toLocaleString()}
              </div>
              <div style={{ flex: 1 }} />
              <button style={{ padding: '6px 10px', borderRadius: 7, background: '#fff',
                border: `1px solid ${RINGO.border}`, cursor: 'pointer', fontSize: 12,
                color: RINGO.ink2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.upload} size={12} /> Export
              </button>
            </div>

            {/* Header */}
            <div style={{ display: 'grid',
              gridTemplateColumns: '40px 2.4fr 1.2fr 0.9fr 1.1fr 1fr 0.9fr 1fr 50px',
              gap: 14, padding: '12px 18px', fontSize: 11, fontWeight: 700, color: RINGO.ink3,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              borderBottom: `1px solid ${RINGO.border}`, background: '#fafbff' }}>
              <span /><span>Business ↓</span><span>Owner</span><span>Plan</span>
              <span>Status</span><span style={{ textAlign: 'right' }}>MRR</span>
              <span style={{ textAlign: 'right' }}>Replies · 30d</span>
              <span>Customer since</span><span />
            </div>

            {/* Rows */}
            {rows.map((r, i) => {
              const statusInfo = STATUS_MAP[r.status] ?? { tone: 'neutral' as PillTone, label: r.status };
              return (
                <div key={r.id} style={{ display: 'grid',
                  gridTemplateColumns: '40px 2.4fr 1.2fr 0.9fr 1.1fr 1fr 0.9fr 1fr 50px',
                  gap: 14, padding: '12px 18px', alignItems: 'center',
                  borderBottom: `1px solid ${RINGO.border}`,
                  background: i === 0 ? '#fafbff' : 'transparent' }}>
                  <input type="checkbox" style={{ accentColor: '#7c3aed' }} />
                  <div style={{ display: 'flex', gap: 11, alignItems: 'center', minWidth: 0 }}>
                    <IconTile grad={r.g} size={32} radius={8}>
                      <Icon d={ICONS.bld} size={14} />
                    </IconTile>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: RINGO.ink,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.n}
                      </div>
                      <div style={{ fontSize: 11.5, color: RINGO.ink3,
                        fontFamily: RINGO.font.mono }}>{r.city}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                    <Avatar name={r.owner} size={26} />
                    <div style={{ fontSize: 13, color: RINGO.ink, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.owner}</div>
                  </div>
                  <Pill tone={r.plan === 'Shop' ? 'violet' : r.plan === 'Crew' ? 'info' : 'neutral'}
                    dot={false}>{r.plan}</Pill>
                  <Pill tone={statusInfo.tone}>{statusInfo.label}</Pill>
                  <div style={{ textAlign: 'right', fontFamily: RINGO.font.head,
                    fontWeight: 700, color: RINGO.ink }}>${r.mrr}</div>
                  <div style={{ textAlign: 'right', fontFamily: RINGO.font.mono,
                    fontWeight: 600, color: RINGO.ink2 }}>{r.repl.toLocaleString()}</div>
                  <div style={{ fontSize: 12.5, color: RINGO.ink2,
                    fontFamily: RINGO.font.mono }}>{r.since}</div>
                  <button
                    onClick={() => router.push(`/admin/businesses/${r.id}`)}
                    style={{ width: 30, height: 30, borderRadius: 7, border: 'none',
                      background: 'transparent', cursor: 'pointer', color: RINGO.ink3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginLeft: 'auto' }}>
                    <Icon d={ICONS.more} size={16} />
                  </button>
                </div>
              );
            })}

            {/* Pagination */}
            <div style={{ padding: '14px 18px', borderTop: `1px solid ${RINGO.border}`,
              display: 'flex', alignItems: 'center', gap: 10, background: '#fafbff' }}>
              <span style={{ fontSize: 12.5, color: RINGO.ink3 }}>Rows per page: 16</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12.5, color: RINGO.ink2, fontFamily: RINGO.font.mono }}>
                1 / {Math.ceil(total / 16)}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['‹‹','‹','1','2','3','…','›','››'].map((p, i) => (
                  <button key={i} style={{ minWidth: 30, height: 30, borderRadius: 7,
                    border: p === '1' ? 'none' : `1px solid ${RINGO.border}`,
                    background: p === '1' ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#fff',
                    color: p === '1' ? '#fff' : RINGO.ink2,
                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: '0 8px',
                    fontFamily: RINGO.font.mono }}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNew && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,21,53,0.45)', zIndex: 200 }} onClick={() => setShowNew(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: '28px 32px', width: 460, zIndex: 201, boxShadow: '0 24px 64px -16px rgba(0,0,0,0.3)' }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, marginBottom: 6, color: RINGO.ink }}>Add new business</div>
            <div style={{ fontSize: 12.5, color: RINGO.ink3, marginBottom: 22 }}>Creates a user account and business. Temporary password: <code>changeme123</code></div>
            <form onSubmit={handleCreateBusiness} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Business name *</label>
                <input style={nfInputStyle} placeholder="Pacific Plumbing Co." value={newForm.name}
                  onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Owner email *</label>
                <input style={nfInputStyle} type="email" placeholder="owner@business.com" value={newForm.email}
                  onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Plan</label>
                  <select style={{ ...nfInputStyle, cursor: 'pointer' }} value={newForm.plan}
                    onChange={e => setNewForm(f => ({ ...f, plan: e.target.value }))}>
                    <option value="starter">Starter ($29)</option>
                    <option value="growth">Growth ($79)</option>
                    <option value="pro">Pro ($149)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, display: 'block', marginBottom: 6 }}>Business type</label>
                  <input style={nfInputStyle} placeholder="Plumbing" value={newForm.business_type}
                    onChange={e => setNewForm(f => ({ ...f, business_type: e.target.value }))} />
                </div>
              </div>
              {newError && <div style={{ fontSize: 12.5, color: '#dc2626', padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>{newError}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" onClick={() => setShowNew(false)}
                  style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, color: RINGO.ink2 }}>
                  Cancel
                </button>
                <button type="submit" disabled={newSaving}
                  style={{ padding: '9px 22px', borderRadius: 9, border: 'none', cursor: newSaving ? 'default' : 'pointer', background: newSaving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600 }}>
                  {newSaving ? 'Creating…' : 'Create business'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

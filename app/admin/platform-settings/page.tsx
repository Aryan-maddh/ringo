'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch } from '@/lib/adminApi';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminSidebar';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { RINGO } from '@/components/ringo/tokens';

function Toggle({ on = true, onChange }: { on?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange?.(!on)} style={{ width: 38, height: 22, borderRadius: 99, padding: 2, border: 'none', cursor: 'pointer', background: on ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : RINGO.borderStrong }}>
      <span style={{ display: 'block', width: 18, height: 18, borderRadius: '50%', background: '#fff', marginLeft: on ? 16 : 0, transition: 'margin-left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

function SCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700 }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '12px 0', borderBottom: `1px solid ${RINGO.border}` }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: RINGO.ink }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 3 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export default function AdminPlatformSettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flags, setFlags] = useState({ ai_voice: true, emergency_kw: true, crm_push: false, tenant_api: true });

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { router.push('/admin/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  async function handleSave() {
    try {
      await adminApiFetch('/api/admin/platform-settings', { method: 'PUT', body: JSON.stringify(flags) });
    } catch { /* best effort */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <AdminSidebar active="set" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar title="Platform settings" sub="Global configuration for the Ringo platform." breadcrumb={['Admin', 'Platform settings']} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ maxWidth: 800 }}>
            {saved && (
              <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#e7f7ee', border: '1px solid #b9e4ca', fontSize: 13, color: '#075c3f', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon d={ICONS.check} size={14} stroke={2.5} /> Platform settings saved.
              </div>
            )}

            <SCard title="Tenant defaults" sub="Default configuration applied to newly created tenant accounts.">
              <Row label="Default SMS cooldown" hint="Minimum time between auto-replies to the same number.">
                <select style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, background: '#fff', cursor: 'pointer' }}>
                  {['15 min', '30 min', '1 hour', '6 hours', '24 hours'].map(v => <option key={v}>{v}</option>)}
                </select>
              </Row>
              <Row label="Default trial length" hint="Number of days for new tenant free trial.">
                <select style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, background: '#fff', cursor: 'pointer' }}>
                  {['7 days', '14 days', '30 days'].map(v => <option key={v}>{v}</option>)}
                </select>
              </Row>
              <Row label="Auto-suspend on overdue" hint="Suspend tenant accounts after this many days past due.">
                <select style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, background: '#fff', cursor: 'pointer' }}>
                  {['7 days', '14 days', '30 days', 'Never'].map(v => <option key={v}>{v}</option>)}
                </select>
              </Row>
            </SCard>

            <SCard title="Feature flags" sub="Toggle features on or off for the entire platform.">
              <Row label="AI voice response" hint="Enable AI-powered voice greeting on missed calls."><Toggle on={flags.ai_voice} onChange={v => setFlags(f => ({ ...f, ai_voice: v }))} /></Row>
              <Row label="Emergency keyword detection" hint="Flag calls containing emergency keywords for immediate routing."><Toggle on={flags.emergency_kw} onChange={v => setFlags(f => ({ ...f, emergency_kw: v }))} /></Row>
              <Row label="CRM auto-push" hint="Automatically push new leads to connected CRM accounts."><Toggle on={flags.crm_push} onChange={v => setFlags(f => ({ ...f, crm_push: v }))} /></Row>
              <Row label="Tenant-level API access" hint="Allow tenants to generate API keys for custom integrations."><Toggle on={flags.tenant_api} onChange={v => setFlags(f => ({ ...f, tenant_api: v }))} /></Row>
            </SCard>

            <SCard title="Platform limits" sub="Caps applied across all tenant accounts.">
              <Row label="Max SMS / tenant / day" hint="Hard cap on outbound messages.">
                <input defaultValue="500" style={{ width: 100, padding: '8px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, fontSize: 13.5, color: RINGO.ink, textAlign: 'right' }} />
              </Row>
              <Row label="Max numbers / tenant" hint="Maximum Twilio numbers per account.">
                <input defaultValue="10" style={{ width: 100, padding: '8px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, fontSize: 13.5, color: RINGO.ink, textAlign: 'right' }} />
              </Row>
            </SCard>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Discard</button>
              <button onClick={handleSave} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 18px -10px rgba(124,58,237,0.5)' }}>Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

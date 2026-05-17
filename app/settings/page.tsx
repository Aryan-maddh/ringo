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

// ── Types ──────────────────────────────────────────────────────────────────

interface Settings {
  id: number;
  name: string;
  business_type: string | null;
  twilio_number: string | null;
  twilio_number_sid: string | null;
  whatsapp_number: string | null;
  whatsapp_number_sid: string | null;
  owner_phone: string | null;
  timezone: string;
  call_forwarding_enabled: boolean;
  auto_sms_enabled: boolean;
  auto_whatsapp_enabled: boolean;
  voice_message: string | null;
  sms_message: string | null;
  whatsapp_message: string | null;
  booking_url: string | null;
  emergency_keywords: string[] | null;
  business_hours: Record<string, { open: string; close: string; enabled: boolean }> | null;
  sms_count_this_month: number;
  plan: string;
}

interface AvailableNumber { phone_number: string; friendly_name: string; locality: string; region: string; }

// ── UI primitives ──────────────────────────────────────────────────────────

function Toggle({ on = true, onChange }: { on?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange?.(!on)}
      style={{ width: 40, height: 23, borderRadius: 99, padding: 2, border: 'none', cursor: 'pointer', background: on ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : RINGO.borderStrong, flexShrink: 0 }}>
      <span style={{ display: 'block', width: 19, height: 19, borderRadius: '50%', background: '#fff', marginLeft: on ? 17 : 0, transition: 'margin-left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

function SCard({ title, sub, children, footer }: { title: string; sub?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${RINGO.border}`, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700, color: RINGO.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 4, lineHeight: 1.55 }}>{sub}</div>}
      </div>
      <div style={{ padding: '18px 22px' }}>{children}</div>
      {footer && (
        <div style={{ padding: '14px 22px', background: '#f9fafc', borderTop: `1px solid ${RINGO.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, padding: '13px 0', borderBottom: `1px solid ${RINGO.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: RINGO.ink3, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`,
  fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, background: '#fff', boxSizing: 'border-box',
  outline: 'none',
};

// ── Tabs ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'biz',    l: 'Business info',  g: RINGO.iVio, ic: ICONS.bld },
  { id: 'number', l: 'Your number',    g: RINGO.iEme, ic: ICONS.phone },
  { id: 'sms',    l: 'SMS & Voice',    g: RINGO.iRos, ic: ICONS.msg },
  { id: 'whatsapp', l: 'WhatsApp',   g: 'linear-gradient(135deg, #22c55e, #16a34a)', ic: 'whatsapp' },
  { id: 'notify', l: 'Notifications',  g: RINGO.iAmb, ic: ICONS.bell },
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
];

const STATE_AREA_CODES: Record<string, string[]> = {
  'California':  ['213','310','408','415','424','510','562','619','626','650','714','747','760','805','818','858','909','916','925','949'],
  'New York':    ['212','315','347','516','518','585','607','631','646','716','718','845','914','929'],
  'Texas':       ['210','214','281','325','469','512','682','713','737','806','817','830','832','903','915','936','940','956','972'],
  'Florida':     ['239','305','321','352','386','407','561','727','754','772','786','813','850','863','904','941','954'],
  'Illinois':    ['217','224','309','312','331','618','630','708','773','815','847','872'],
  'Pennsylvania':['215','267','412','484','570','610','717','724','814'],
  'Ohio':        ['216','234','330','419','440','513','567','614','740','937'],
  'Michigan':    ['231','248','269','313','517','586','616','734','810'],
  'Georgia':     ['229','404','470','478','678','706','762','770','912'],
  'North Carolina':['252','336','704','828','910','919','980','984'],
  'New Jersey':  ['201','551','609','732','848','856','862','908','973'],
  'Washington':  ['206','253','360','425','509'],
  'Arizona':     ['480','520','602','623','928'],
  'Massachusetts':['339','351','413','508','617','774','781','857','978'],
  'Colorado':    ['303','719','720','970'],
  'Virginia':    ['276','434','540','571','703','757','804'],
  'Tennessee':   ['423','615','629','731','865','901','931'],
  'Minnesota':   ['218','320','507','612','651','763','952'],
};

// ── Settings page ──────────────────────────────────────────────────────────

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState('biz');
  const [notifyPrefs, setNotifyPrefs] = useState<Record<string, boolean>>({
    emergency_alerts: true,
    new_booking: true,
    daily_summary: true,
    weekly_report: false,
    missed_digest: false,
  });

  // Number-change flow
  const [showSearch, setShowSearch] = useState(false);
  const [srState, setSrState] = useState('');
  const [srAreaCode, setSrAreaCode] = useState('');
  const [srSearching, setSrSearching] = useState(false);
  const [srNumbers, setSrNumbers] = useState<AvailableNumber[]>([]);
  const [srSelected, setSrSelected] = useState('');
  const [srProvisioning, setSrProvisioning] = useState(false);
  const [srError, setSrError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    setMounted(true);
    apiFetch('/api/settings').then(r => r.ok ? r.json() : null).then(d => { if (d) setSettings(d); }).catch(() => {});
    const saved = localStorage.getItem('notifyPrefs');
    if (saved) { try { setNotifyPrefs(JSON.parse(saved)); } catch { /* ignore */ } }
  }, [router]);

  async function handleSave(fields?: Partial<Settings>) {
    if (!settings) return;
    setSaving(true); setSaveStatus('idle');
    try {
      const body = fields ?? {
        name: settings.name, business_type: settings.business_type,
        owner_phone: settings.owner_phone, timezone: settings.timezone,
        call_forwarding_enabled: settings.call_forwarding_enabled,
        auto_sms_enabled: settings.auto_sms_enabled,
        auto_whatsapp_enabled: settings.auto_whatsapp_enabled,
        sms_message: settings.sms_message, booking_url: settings.booking_url,
        whatsapp_message: settings.whatsapp_message,
        voice_message: settings.voice_message, emergency_keywords: settings.emergency_keywords,
        business_hours: settings.business_hours,
      };
      const res = await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(body) });
      if (res.ok) { const d = await res.json(); setSettings(d); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); }
      else setSaveStatus('error');
    } catch { setSaveStatus('error'); }
    finally { setSaving(false); }
  }

  async function handleNumberSearch() {
    if (!srAreaCode) { setSrError('Select an area code first'); return; }
    setSrSearching(true); setSrNumbers([]); setSrSelected(''); setSrError('');
    try {
      const res = await apiFetch(`/api/numbers/search?areacode=${srAreaCode}`);
      const data = await res.json();
      if (!res.ok) { setSrError(data.error ?? 'Search failed'); return; }
      if (!data.numbers?.length) { setSrError(`No numbers available in area code ${srAreaCode}.`); return; }
      setSrNumbers(data.numbers);
    } catch { setSrError('Network error'); }
    finally { setSrSearching(false); }
  }

  async function handleNumberProvision() {
    if (!srSelected) return;
    setSrProvisioning(true); setSrError('');
    try {
      const res = await apiFetch('/api/numbers/provision', { method: 'POST', body: JSON.stringify({ phone_number: srSelected }) });
      const data = await res.json();
      if (!res.ok) { setSrError(data.error ?? 'Provisioning failed'); return; }
      setSettings(prev => prev ? { ...prev, twilio_number: data.phone_number, twilio_number_sid: data.sid } : prev);
      setShowSearch(false); setSrNumbers([]); setSrSelected(''); setSrState(''); setSrAreaCode('');
    } catch { setSrError('Network error'); }
    finally { setSrProvisioning(false); }
  }

  if (!mounted) return null;

  const selStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
  const areaCodes = srState ? STATE_AREA_CODES[srState] ?? [] : [];

  const SaveBar = (
    <>
      {saveStatus === 'success' && (
        <div style={{ padding: '11px 16px', borderRadius: 10, background: '#e7f7ee', border: '1px solid #b9e4ca', fontSize: 13, color: '#075c3f', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Icon d={ICONS.check} size={14} stroke={2.5} /> Settings saved.
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{ padding: '11px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#b91c1c', marginBottom: 14 }}>
          Failed to save. Please try again.
        </div>
      )}
    </>
  );

  return (
    <div className="r-app-shell" style={{ display: 'flex', minHeight: '100vh', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="set" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar title="Settings" sub="Configure your Ringo number, SMS templates, and business hours." />

        {/* Tab bar */}
        <div style={{ padding: '0 28px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 2 }}>
          {TABS.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setShowSearch(false); }}
                style={{ padding: '13px 16px', borderRadius: 0, border: 'none', cursor: 'pointer', background: 'transparent', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? (t.id === 'whatsapp' ? '#16a34a' : '#7c3aed') : RINGO.ink2, borderBottom: on ? `2px solid ${t.id === 'whatsapp' ? '#16a34a' : '#7c3aed'}` : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTile grad={t.g} size={22} radius={6}>
                  {t.ic === 'whatsapp' ? <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width={12} height={12} style={{ filter: 'invert(1)' }} alt="wa" /> : <Icon d={t.ic} size={11} />}
                </IconTile>
                {t.l}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 860 }}>
            {SaveBar}

            {/* ── Tab 1: Business info ─────────────────────────────────────── */}
            {tab === 'biz' && (
              <SCard title="Business info" sub="Your business name and type as shown in SMS replies."
                footer={
                  <button type="button" onClick={() => handleSave()} disabled={saving}
                    style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                }>
                <Field label="Business name" hint="Shown in auto-replies.">
                  <input style={inputStyle} value={settings?.name ?? ''} onChange={e => setSettings(s => s ? { ...s, name: e.target.value } : s)} />
                </Field>
                <Field label="Business type">
                  <select style={selStyle} value={settings?.business_type ?? ''} onChange={e => setSettings(s => s ? { ...s, business_type: e.target.value } : s)}>
                    {['Plumbing', 'Electrical', 'HVAC', 'Salon / Spa', 'Auto repair', 'Roofing', 'Cleaning', 'Landscaping', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Owner / contact phone" hint="Your real mobile number. Used for emergency alerts and call forwarding.">
                  <input style={inputStyle} value={settings?.owner_phone ?? ''} placeholder="+1 (415) 555-0188" onChange={e => setSettings(s => s ? { ...s, owner_phone: e.target.value } : s)} />
                </Field>
                <Field label="Time zone" hint="Used for business hours and quiet-hour calculations.">
                  <select style={selStyle} value={settings?.timezone ?? 'America/New_York'} onChange={e => setSettings(s => s ? { ...s, timezone: e.target.value } : s)}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
                  </select>
                </Field>
                <Field label="Booking URL" hint="Appended to every SMS reply so customers can self-schedule.">
                  <input style={inputStyle} value={settings?.booking_url ?? ''} placeholder="https://calendly.com/yourname" onChange={e => setSettings(s => s ? { ...s, booking_url: e.target.value } : s)} />
                </Field>
              </SCard>
            )}

            {/* ── Tab 2: Your number ───────────────────────────────────────── */}
            {tab === 'number' && (
              <>
                <SCard title="Your Ringo number" sub="This is the number Ringo uses to answer missed calls and send SMS replies.">
                  {settings?.twilio_number ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                      <IconTile grad={RINGO.iEme} size={42} radius={12}><Icon d={ICONS.phone} size={18} /></IconTile>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: RINGO.font.mono, fontSize: 20, fontWeight: 700, color: RINGO.ink }}>{settings.twilio_number}</div>
                        <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 3 }}>Provisioned from master Twilio account · included in your {settings.plan} plan</div>
                      </div>
                      <Pill tone="success" dot>Active</Pill>
                      <button onClick={() => setShowSearch(true)} style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Change number</button>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', borderRadius: 12, background: RINGO.bg, border: `1px dashed ${RINGO.borderStrong}` }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: RINGO.ink2, marginBottom: 8 }}>No number provisioned yet</div>
                      <button onClick={() => setShowSearch(true)} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Icon d={ICONS.plus} size={14} /> Search & provision a number
                      </button>
                    </div>
                  )}
                </SCard>

                {/* Number search panel */}
                {showSearch && (
                  <SCard title="Search available numbers" sub="Find a local number in your area. We'll buy it from our master Twilio account.">
                    {srError && <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#b91c1c' }}>{srError}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, marginBottom: 6 }}>State</div>
                        <select style={selStyle} value={srState} onChange={e => { setSrState(e.target.value); setSrAreaCode(''); setSrNumbers([]); }}>
                          <option value="">Select state…</option>
                          {Object.keys(STATE_AREA_CODES).sort().map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, marginBottom: 6 }}>Area code</div>
                        <select style={{ ...selStyle, opacity: srState ? 1 : 0.5 }} value={srAreaCode} onChange={e => { setSrAreaCode(e.target.value); setSrNumbers([]); }} disabled={!srState}>
                          <option value="">Select…</option>
                          {areaCodes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <button onClick={handleNumberSearch} disabled={!srAreaCode || srSearching}
                        style={{ padding: '10px 18px', borderRadius: 9, border: 'none', cursor: srAreaCode ? 'pointer' : 'default', background: srAreaCode ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#d1d5e4', color: '#fff', fontSize: 13, fontWeight: 600, height: 42 }}>
                        {srSearching ? 'Searching…' : 'Search'}
                      </button>
                    </div>
                    {srNumbers.length > 0 && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                          {srNumbers.map((n, i) => (
                            <label key={i} onClick={() => setSrSelected(n.phone_number)}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: srSelected === n.phone_number ? '2px solid #7c3aed' : `1px solid ${RINGO.border}`, background: srSelected === n.phone_number ? 'rgba(124,58,237,0.04)' : '#fff', cursor: 'pointer' }}>
                              <span style={{ width: 16, height: 16, borderRadius: '50%', border: srSelected === n.phone_number ? '5px solid #7c3aed' : `2px solid ${RINGO.borderStrong}`, flexShrink: 0 }} />
                              <span style={{ fontFamily: RINGO.font.mono, fontSize: 15, fontWeight: 700, flex: 1 }}>{n.friendly_name}</span>
                              {n.locality && <span style={{ fontSize: 12, color: RINGO.ink3 }}>{n.locality}{n.region ? `, ${n.region}` : ''}</span>}
                              {srSelected === n.phone_number && <Pill tone="violet" dot={false}>Selected</Pill>}
                            </label>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => { setShowSearch(false); setSrNumbers([]); setSrSelected(''); }} style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                          <button onClick={handleNumberProvision} disabled={!srSelected || srProvisioning}
                            style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: srSelected ? 'pointer' : 'default', background: srSelected ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#d1d5e4', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                            {srProvisioning ? 'Provisioning…' : 'Claim this number'}
                          </button>
                        </div>
                      </>
                    )}
                  </SCard>
                )}

                <SCard title="Call forwarding" sub="Forward calls to your mobile before Ringo picks up."
                  footer={
                    <button type="button" onClick={() => handleSave({ call_forwarding_enabled: settings?.call_forwarding_enabled, owner_phone: settings?.owner_phone })} disabled={saving}
                      style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  }>
                  <Field label="Enable call forwarding" hint="Ringo will ring your mobile first — if you don't answer, it sends the SMS.">
                    <Toggle on={settings?.call_forwarding_enabled ?? false} onChange={v => setSettings(s => s ? { ...s, call_forwarding_enabled: v } : s)} />
                  </Field>
                  <Field label="Forward to" hint="Your real mobile number. Leave blank to skip forwarding.">
                    <input style={inputStyle} value={settings?.owner_phone ?? ''} placeholder="+1 (415) 555-0188" onChange={e => setSettings(s => s ? { ...s, owner_phone: e.target.value } : s)} />
                  </Field>
                </SCard>
              </>
            )}

            {/* ── Tab 3: SMS & Voice ───────────────────────────────────────── */}
            {tab === 'sms' && (
              <>
                <SCard title="Auto SMS" sub="Ringo texts callers back automatically within 12 seconds of a missed call."
                  footer={
                    <button type="button" onClick={() => handleSave()} disabled={saving}
                      style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  }>
                  <Field label="Auto-reply enabled" hint="Turn off to pause all outbound SMS — calls still logged.">
                    <Toggle on={settings?.auto_sms_enabled ?? true} onChange={v => setSettings(s => s ? { ...s, auto_sms_enabled: v } : s)} />
                  </Field>
                  <Field label="SMS template" hint="Sent to every missed caller. Use {{caller_name}} as a placeholder.">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }}
                        value={settings?.sms_message ?? ''}
                        onChange={e => setSettings(s => s ? { ...s, sms_message: e.target.value } : s)} />
                      <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f6f7fb', border: `1px solid ${RINGO.border}` }}>
                        <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                        <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 13, lineHeight: 1.5, color: RINGO.ink }}>
                          {settings?.sms_message || 'Your message will appear here…'}
                        </div>
                        <div style={{ fontSize: 11, color: RINGO.ink3, marginTop: 6 }}>{settings?.name || 'Your business'} · just now</div>
                      </div>
                    </div>
                  </Field>
                  <Field label="Voice greeting" hint="What Ringo says when it answers the phone. Keep it under 20 words.">
                    <input style={inputStyle}
                      value={settings?.voice_message ?? ''}
                      placeholder={`Hi, you've reached ${settings?.name || 'us'}. We're unavailable — describe your issue and we'll text you right back.`}
                      onChange={e => setSettings(s => s ? { ...s, voice_message: e.target.value } : s)} />
                  </Field>
                </SCard>

                <SCard title="Emergency keywords" sub="If a caller's speech contains any of these words, their SMS is flagged as urgent.">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {(settings?.emergency_keywords ?? ['emergency', 'urgent', 'flood', 'burst', 'leak', 'no power', 'fire']).map((kw, i) => (
                      <span key={i} style={{ padding: '5px 12px', borderRadius: 99, background: 'linear-gradient(135deg,rgba(225,29,72,0.1),rgba(251,146,60,0.08))', border: '1px solid rgba(225,29,72,0.2)', fontSize: 13, color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {kw}
                        <button onClick={() => setSettings(s => s ? { ...s, emergency_keywords: (s.emergency_keywords ?? []).filter((_, j) => j !== i) } : s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#b91c1c', display: 'flex' }}>
                          <Icon d={ICONS.x} size={11} stroke={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input id="kw-input" style={{ ...inputStyle, maxWidth: 260 }} placeholder="Add keyword…" onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) { setSettings(s => s ? { ...s, emergency_keywords: [...(s.emergency_keywords ?? []), val] } : s); (e.target as HTMLInputElement).value = ''; }
                      }
                    }} />
                    <button onClick={() => handleSave()} style={{ padding: '9px 14px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: RINGO.ink3 }}>Press Enter to add. Changes take effect immediately.</div>
                </SCard>
              </>
            )}

            {/* ── Tab: WhatsApp ────────────────────────────────────────────── */}
            {tab === 'whatsapp' && (
              <>
                <SCard title="Your WhatsApp number" sub="This is the number Ringo uses to send WhatsApp replies.">
                  {settings?.twilio_number ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                      <IconTile grad="linear-gradient(135deg, #22c55e, #16a34a)" size={42} radius={12}>
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width={22} height={22} style={{ filter: 'invert(1)' }} alt="wa" />
                      </IconTile>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: RINGO.font.mono, fontSize: 20, fontWeight: 700, color: RINGO.ink }}>{settings.twilio_number}</div>
                        <div style={{ fontSize: 12.5, color: RINGO.ink3, marginTop: 3 }}>Sharing your primary Ringo number for WhatsApp</div>
                      </div>
                      <Pill tone="success" dot>Active</Pill>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', borderRadius: 12, background: RINGO.bg, border: `1px dashed ${RINGO.borderStrong}` }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: RINGO.ink2, marginBottom: 8 }}>No primary number provisioned</div>
                      <div style={{ fontSize: 13, color: RINGO.ink3, marginBottom: 12 }}>Please go to the "Your number" tab to provision a number first. Ringo will automatically use it for WhatsApp too.</div>
                      <button onClick={() => setTab('number')} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        Go to Your number
                      </button>
                    </div>
                  )}
                </SCard>

                <SCard title="Auto WhatsApp" sub="Ringo sends WhatsApp messages automatically within 12 seconds of a missed call."
                  footer={
                    <button type="button" onClick={() => handleSave()} disabled={saving}
                      style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  }>
                  <Field label="Auto-reply enabled" hint="Turn off to pause all outbound WhatsApp replies.">
                    <Toggle on={settings?.auto_whatsapp_enabled ?? false} onChange={v => setSettings(s => s ? { ...s, auto_whatsapp_enabled: v } : s)} />
                  </Field>
                  <Field label="WhatsApp template" hint="Sent to every missed caller on WhatsApp.">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }}
                        value={settings?.whatsapp_message ?? ''}
                        onChange={e => setSettings(s => s ? { ...s, whatsapp_message: e.target.value } : s)} />
                      <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f6f7fb', border: `1px solid ${RINGO.border}` }}>
                        <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                        <div style={{ padding: '10px 14px', borderRadius: '4px 18px 18px 18px', background: '#e1ffd4', border: `1px solid #bbf7d0`, fontSize: 13, lineHeight: 1.5, color: '#064e3b' }}>
                          {settings?.whatsapp_message || 'Your WhatsApp message will appear here…'}
                        </div>
                        <div style={{ fontSize: 11, color: RINGO.ink3, marginTop: 6 }}>{settings?.name || 'Your business'} · just now</div>
                      </div>
                    </div>
                  </Field>
                </SCard>
              </>
            )}

            {/* ── Tab 4: Notifications ─────────────────────────────────────── */}
            {tab === 'notify' && (
              <SCard title="Notification preferences" sub="Choose when and how Ringo alerts you."
                footer={
                  <button type="button" onClick={() => {
                    localStorage.setItem('notifyPrefs', JSON.stringify(notifyPrefs));
                    handleSave();
                  }} disabled={saving}
                    style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: saving ? 'default' : 'pointer', background: saving ? '#6b7280' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    {saving ? 'Saving…' : 'Save preferences'}
                  </button>
                }>
                {([
                  { l: 'Emergency alerts',         h: 'Immediate SMS to your phone when emergency keyword detected.', key: 'emergency_alerts' },
                  { l: 'New booking notifications', h: 'Alert when a caller books via your booking URL.',             key: 'new_booking' },
                  { l: 'Daily summary email',       h: 'Morning recap of calls, replies, and bookings.',              key: 'daily_summary' },
                  { l: 'Weekly report',             h: 'Friday digest with trends and revenue recovered.',            key: 'weekly_report' },
                  { l: 'Missed-call digest',        h: 'End-of-day list of unanswered calls.',                        key: 'missed_digest' },
                ] as { l: string; h: string; key: string }[]).map((item) => (
                  <Field key={item.key} label={item.l} hint={item.h}>
                    <Toggle on={notifyPrefs[item.key] ?? false} onChange={v => setNotifyPrefs(p => ({ ...p, [item.key]: v }))} />
                  </Field>
                ))}
                <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: RINGO.bg, border: `1px solid ${RINGO.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink2, marginBottom: 8 }}>Notification destination</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input style={{ ...inputStyle, maxWidth: 300 }} defaultValue={settings?.owner_phone ?? ''} placeholder="+1 (415) 555-0188" />
                    <input style={{ ...inputStyle, maxWidth: 300 }} defaultValue="" placeholder="email@example.com" />
                  </div>
                </div>
              </SCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

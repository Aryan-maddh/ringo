'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, saveToken } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Pill } from '@/components/ringo/Pill';
import { IconTile } from '@/components/ringo/IconTile';
import { RingoLogo } from '@/components/ringo/RingoLogo';
import { Field } from '@/components/ringo/Field';

// ── Progress dots ──────────────────────────────────────────────────────────

const STEP_LABELS = ['Business', 'Number', 'Voice', 'Hours', 'Test'];

function ProgressDots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {STEP_LABELS.map((l, i) => {
        const done = i < step, on = i === step;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: RINGO.font.head, fontSize: 11, fontWeight: 700,
                background: done ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#fff',
                color: done ? '#fff' : on ? RINGO.ink : RINGO.ink3,
                border: on ? '2px solid #7c3aed' : done ? 'none' : `1px solid ${RINGO.border}`,
              }}>
                {done ? <Icon d={ICONS.check} size={11} stroke={3} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: on ? 700 : 500, color: done || on ? RINGO.ink : RINGO.ink3 }}>{l}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: '0 0 28px', height: 2, background: i < step ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : RINGO.border, borderRadius: 2 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Card shell ─────────────────────────────────────────────────────────────

interface OnbCardProps {
  step: number;
  title: string;
  sub: string;
  children: React.ReactNode;
  primary?: string;
  back?: boolean;
  loading?: boolean;
  error?: string;
  onNext: () => void;
  onBack: () => void;
  onExit?: () => void;
}

function OnbCard({ step, title, sub, children, primary = 'Continue', back = true, loading, error, onNext, onBack, onExit }: OnbCardProps) {
  return (
    <div className="r-onb-card" style={{ padding: '40px 48px 36px', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="r-onb-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <RingoLogo size={26} />
        <ProgressDots step={step} />
        <button type="button" onClick={onExit} style={{ padding: '7px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2, fontFamily: RINGO.font.ui, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save &amp; exit</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Step {step + 1} of 5
        </div>
        <h1 style={{ fontFamily: RINGO.font.head, fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: RINGO.ink, margin: '8px 0' }}>{title}</h1>
        <div style={{ fontSize: 14, color: RINGO.ink3, maxWidth: 560, lineHeight: 1.55, marginBottom: 28 }}>{sub}</div>
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#b91c1c' }}>
            {error}
          </div>
        )}
        {children}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <button type="button" onClick={onBack} style={{ padding: '11px 16px', borderRadius: 10, border: `1px solid ${back ? RINGO.border : 'transparent'}`, background: '#fff', color: back ? RINGO.ink2 : 'transparent', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, cursor: back ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon d={ICONS.arrowL} size={14} /> Back
        </button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" onClick={onNext} style={{ padding: '11px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: RINGO.ink3, fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Skip for now</button>
          <button type="button" onClick={onNext} disabled={loading} style={{ padding: '12px 22px', borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer', background: loading ? '#a78bfa' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: 600, boxShadow: '0 10px 22px -10px rgba(124,58,237,0.6)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading ? 'Saving…' : <>{primary} <Icon d={ICONS.arrow} size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 1 ─────────────────────────────────────────────────────────────────

const TRADE_OPTIONS = ['Plumbing', 'Electrical', 'HVAC', 'Salon / Spa', 'Auto repair', 'Roofing', 'Cleaning', 'Something else'];
const TRADE_GRADS = [RINGO.iEme, RINGO.iAmb, RINGO.iSky, RINGO.iPnk, RINGO.iRos, RINGO.iSlt, RINGO.iVio, RINGO.iSlt];

interface Step1Props {
  onNext: () => void;
  onBack: () => void;
  onExit?: () => void;
  loading?: boolean;
  error?: string;
  businessName: string; setBusinessName: (v: string) => void;
  businessType: string; setBusinessType: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
}

function Step1({ onNext, onBack, onExit, loading, error, businessName, setBusinessName, businessType, setBusinessType, email, setEmail, password, setPassword }: Step1Props) {
  return (
    <OnbCard step={0} title="Tell us about your business" sub="We'll use this to personalize the SMS replies your callers receive — your name and trade make it sound like you, not a bot." onNext={onNext} onBack={onBack} back={false} loading={loading} error={error} onExit={onExit}>
      <div className="r-onb-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Business name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Pacific Plumbing Co." />
        <Field label="Work email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="min. 8 characters" />
        <Field label="Owner / point of contact" placeholder="Marco Reyes" />
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12, color: RINGO.ink2, fontWeight: 600, marginBottom: 8 }}>
          What do you do? <span style={{ color: RINGO.ink3, fontWeight: 500 }}>(pick the closest match — drives our reply templates)</span>
        </div>
        <div className="r-onb-trades" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {TRADE_OPTIONS.map((t, i) => (
            <button key={i} type="button" onClick={() => setBusinessType(t)} style={{ padding: '14px', borderRadius: 12, cursor: 'pointer', background: '#fff', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, border: businessType === t ? '2px solid #7c3aed' : `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, color: RINGO.ink }}>
              <IconTile grad={TRADE_GRADS[i]} size={28} radius={8}><Icon d={ICONS.bld} size={13} /></IconTile>
              {t}
            </button>
          ))}
        </div>
      </div>
    </OnbCard>
  );
}

// ── Step 2 — number search & provision ────────────────────────────────────

const STATE_AREA_CODES: Record<string, string[]> = {
  'California':     ['213','310','323','408','415','424','510','562','619','626','650','714','747','760','805','818','858','909','916','925','949'],
  'New York':       ['212','315','332','347','516','518','585','607','631','646','716','718','845','914','929'],
  'Texas':          ['210','214','254','281','325','361','409','432','469','512','682','713','737','806','817','830','832','903','915','936','940','956','972','979'],
  'Florida':        ['239','305','321','352','386','407','561','727','754','772','786','813','850','863','904','941','954'],
  'Illinois':       ['217','224','309','312','331','618','630','708','773','815','847','872'],
  'Pennsylvania':   ['215','267','412','484','570','610','717','724','814','878'],
  'Ohio':           ['216','220','234','330','419','440','513','567','614','740','937'],
  'Michigan':       ['231','248','269','313','517','586','616','734','810','989'],
  'Georgia':        ['229','404','470','478','678','706','762','770','912'],
  'North Carolina': ['252','336','704','828','910','919','980','984'],
  'New Jersey':     ['201','551','609','732','848','856','862','908','973'],
  'Virginia':       ['276','434','540','571','703','757','804'],
  'Washington':     ['206','253','360','425','509'],
  'Arizona':        ['480','520','602','623','928'],
  'Massachusetts':  ['339','351','413','508','617','774','781','857','978'],
  'Tennessee':      ['423','615','629','731','865','901','931'],
  'Colorado':       ['303','719','720','970'],
  'Minnesota':      ['218','320','507','612','651','763','952'],
  'Wisconsin':      ['262','414','608','715','920'],
  'Maryland':       ['240','301','410','443','667'],
  'Nevada':         ['702','725','775'],
  'Oregon':         ['458','503','541','971'],
  'Connecticut':    ['203','475','860','959'],
  'Utah':           ['385','435','801'],
  'Louisiana':      ['225','318','337','504','985'],
  'Kentucky':       ['270','502','606','859'],
  'Alabama':        ['205','251','256','334'],
  'Oklahoma':       ['405','539','580','918'],
  'Missouri':       ['314','417','573','636','816'],
  'Indiana':        ['219','260','317','574','765','812'],
  'South Carolina': ['803','843','864'],
  'Kansas':         ['316','620','785','913'],
  'New Mexico':     ['505','575'],
  'Nebraska':       ['308','402','531'],
  'Idaho':          ['208'],
  'New Hampshire':  ['603'],
  'Hawaii':         ['808'],
  'Maine':          ['207'],
  'Rhode Island':   ['401'],
  'Alaska':         ['907'],
};

const STATES = Object.keys(STATE_AREA_CODES).sort();

interface AvailableNumber { phone_number: string; friendly_name: string; locality: string; region: string; }

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
  onExit?: () => void;
  onProvisioned: (num: string) => void;
}

function Step2({ onNext, onBack, onExit, onProvisioned }: Step2Props) {
  const [state, setState] = React.useState('');
  const [areaCode, setAreaCode] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [numbers, setNumbers] = React.useState<AvailableNumber[]>([]);
  const [selected, setSelected] = React.useState('');
  const [provisioning, setProvisioning] = React.useState(false);
  const [provisioned, setProvisioned] = React.useState('');
  const [err, setErr] = React.useState('');

  const areaCodes = state ? STATE_AREA_CODES[state] ?? [] : [];

  async function handleSearch() {
    if (!areaCode) { setErr('Select an area code first'); return; }
    setSearching(true); setNumbers([]); setSelected(''); setErr('');
    try {
      const res = await apiFetch(`/api/numbers/search?areacode=${areaCode}`);
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? 'Search failed'); return; }
      if (!data.numbers?.length) { setErr(`No numbers available in area code ${areaCode}. Try another.`); return; }
      setNumbers(data.numbers);
    } catch { setErr('Network error — is the backend running?'); }
    finally { setSearching(false); }
  }

  async function handleContinue() {
    if (provisioned) { onNext(); return; }
    if (!selected) { setErr('Select a number first'); return; }
    setProvisioning(true); setErr('');
    try {
      const res = await apiFetch('/api/numbers/provision', {
        method: 'POST',
        body: JSON.stringify({ phone_number: selected }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? 'Provisioning failed'); return; }
      setProvisioned(data.friendly_name || data.phone_number);
      onProvisioned(data.phone_number);
    } catch { setErr('Network error — is the backend running?'); }
    finally { setProvisioning(false); }
  }

  const selStyle = { width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, background: '#fff', cursor: 'pointer', boxSizing: 'border-box' as const };

  if (provisioned) {
    return (
      <OnbCard step={1} title="Your number is ready!" sub="Call it now — hang up before the third ring and we'll send you an SMS back in under 12 seconds." primary="Continue" back={false} onNext={handleContinue} onBack={onBack} onExit={onExit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '28px', borderRadius: 18, background: 'radial-gradient(120% 100% at 0% 0%,#2a1659 0%,#0f3460 60%,#06081a 100%)', color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Your Ringo number</div>
            <div style={{ fontFamily: RINGO.font.mono, fontSize: 28, fontWeight: 700, letterSpacing: '0.04em' }}>{provisioned}</div>
            <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>
              Calls to this number are answered by Ringo when you&apos;re unavailable.<br />
              Give it a test call — hang up and watch for a text.
            </div>
          </div>
          <div className="r-onb-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: ICONS.phone, label: 'Local number', sub: 'Matches your area code' },
              { icon: ICONS.zap,   label: '< 12s reply',   sub: 'SMS sent instantly' },
              { icon: ICONS.shld,  label: 'A2P compliant', sub: 'Carrier-registered' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 12, border: `1px solid ${RINGO.border}`, background: '#fff', textAlign: 'center' }}>
                <div style={{ margin: '0 auto 10px', width: 'fit-content' }}>
                  <IconTile grad={i === 0 ? RINGO.iVio : i === 1 ? RINGO.iEme : RINGO.iSky} size={32} radius={9}>
                    <Icon d={item.icon} size={15} />
                  </IconTile>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: RINGO.ink }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: RINGO.ink3, marginTop: 3 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </OnbCard>
    );
  }

  return (
    <OnbCard step={1}
      title="Pick your business number"
      sub="We'll provision a real local number from our Twilio account — no setup required on your end."
      primary={provisioning ? 'Claiming…' : selected ? 'Claim this number' : 'Select a number first'}
      loading={provisioning}
      error={err}
      onNext={handleContinue}
      onBack={onBack}
      onExit={onExit}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* State + area code selectors */}
        <div className="r-onb-search-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, marginBottom: 6 }}>State</div>
            <select value={state} onChange={e => { setState(e.target.value); setAreaCode(''); setNumbers([]); setSelected(''); }} style={selStyle}>
              <option value="">Select state…</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, marginBottom: 6 }}>Area code</div>
            <select value={areaCode} onChange={e => { setAreaCode(e.target.value); setNumbers([]); setSelected(''); }} disabled={!state} style={{ ...selStyle, opacity: state ? 1 : 0.5 }}>
              <option value="">Select area code…</option>
              {areaCodes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={!areaCode || searching}
            style={{ padding: '10px 18px', borderRadius: 9, border: 'none', cursor: areaCode && !searching ? 'pointer' : 'default', background: areaCode ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#d1d5e4', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', height: 42 }}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Results */}
        {numbers.length > 0 && (
          <div style={{ padding: '16px 18px', borderRadius: 14, border: `1px solid ${RINGO.border}`, background: '#fff' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink2, marginBottom: 10 }}>
              {numbers.length} numbers available in area code {areaCode} — pick one:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {numbers.map((n, i) => (
                <label key={i} onClick={() => setSelected(n.phone_number)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: selected === n.phone_number ? '2px solid #7c3aed' : `1px solid ${RINGO.border}`, background: selected === n.phone_number ? 'linear-gradient(135deg,rgba(124,58,237,0.05),rgba(6,182,212,0.05))' : '#fff', cursor: 'pointer' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: selected === n.phone_number ? '5px solid #7c3aed' : `2px solid ${RINGO.borderStrong}`, flexShrink: 0 }} />
                  <span style={{ fontFamily: RINGO.font.mono, fontSize: 15, fontWeight: 700, color: RINGO.ink, flex: 1 }}>{n.friendly_name}</span>
                  {n.locality && <span style={{ fontSize: 12, color: RINGO.ink3 }}>{n.locality}{n.region ? `, ${n.region}` : ''}</span>}
                  {selected === n.phone_number && <Pill tone="violet" dot={false}>Selected</Pill>}
                </label>
              ))}
            </div>
          </div>
        )}

        {numbers.length === 0 && !searching && (
          <div style={{ padding: '24px', borderRadius: 14, border: `1px dashed ${RINGO.border}`, background: '#f9fafc', textAlign: 'center', color: RINGO.ink3, fontSize: 13.5 }}>
            {areaCode ? 'Click Search to find available local numbers.' : 'Select a state and area code above, then click Search.'}
          </div>
        )}

        <div style={{ padding: '11px 14px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 12.5, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon d={ICONS.shld} size={14} />
          Numbers are provisioned from our master Twilio account — $1.15/mo included in your plan. No Twilio account needed.
        </div>
      </div>
    </OnbCard>
  );
}

// ── Step 3 ─────────────────────────────────────────────────────────────────

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
  onExit?: () => void;
  loading?: boolean;
  error?: string;
  smsMessage: string;
  setSmsMessage: (v: string) => void;
}

function Step3({ onNext, onBack, onExit, loading, error, smsMessage, setSmsMessage }: Step3Props) {
  const voices = [
    { l: 'Professional', g: RINGO.iSky, on: true,  ex: '"Hi! This is Pacific Plumbing — sorry we missed you. Can I grab the issue and address?"' },
    { l: 'Warm & casual', g: RINGO.iRos,            ex: '"Hey! Marco from Pacific here 🛠️ Just stepped away — what\'s going on?"' },
    { l: 'Concise',       g: RINGO.iEme,            ex: '"Pacific Plumbing — what\'s the address & issue? We\'ll text a quote."' },
  ];
  return (
    <OnbCard step={2} title="Pick a reply voice" sub="This is the tone Ringo uses when texting your callers. You can fine-tune any template later." onNext={onNext} onBack={onBack} loading={loading} error={error} onExit={onExit}>
      <div className="r-onb-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
        {voices.map((v, i) => (
          <div key={i} style={{ padding: '18px', borderRadius: 14, cursor: 'pointer', border: v.on ? '2px solid #7c3aed' : `1px solid ${RINGO.border}`, background: v.on ? 'linear-gradient(135deg,rgba(124,58,237,0.05),rgba(6,182,212,0.05))' : '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <IconTile grad={v.g} size={30} radius={8}><Icon d={ICONS.msg} size={14} /></IconTile>
              <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, fontSize: 14 }}>{v.l}</div>
              {v.on && <Pill tone="violet" dot={false}>Selected</Pill>}
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f6f7fb', border: `1px solid ${RINGO.border}`, fontSize: 12.5, lineHeight: 1.55, color: RINGO.ink2 }}>{v.ex}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '18px 20px', borderRadius: 14, border: `1px solid ${RINGO.border}`, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, fontSize: 14, color: RINGO.ink }}>First-touch SMS preview</div>
          <Pill tone="info" dot={false}>Sent &lt;12s after a missed call</Pill>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 18 }}>
          <textarea
            value={smsMessage}
            onChange={e => setSmsMessage(e.target.value)}
            style={{ minHeight: 140, padding: '12px 14px', borderRadius: 10, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 13.5, lineHeight: 1.55, color: RINGO.ink, outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ padding: 14, borderRadius: 14, background: '#f6f7fb', border: `1px solid ${RINGO.border}` }}>
            <div style={{ fontSize: 11, color: RINGO.ink3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>iMessage preview</div>
            <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 13, lineHeight: 1.5, color: RINGO.ink, maxWidth: 280 }}>
              {smsMessage || 'Your message preview will appear here…'}
            </div>
            <div style={{ fontSize: 11, color: RINGO.ink3, marginTop: 6 }}>Your business · just now</div>
          </div>
        </div>
      </div>
    </OnbCard>
  );
}

// ── Step 4 ─────────────────────────────────────────────────────────────────

const HOURS_DATA: [string, string, string, boolean][] = [
  ['Mon', '7:00a', '6:00p', true],
  ['Tue', '7:00a', '6:00p', true],
  ['Wed', '7:00a', '6:00p', true],
  ['Thu', '7:00a', '6:00p', true],
  ['Fri', '7:00a', '6:00p', true],
  ['Sat', '9:00a', '2:00p', true],
  ['Sun', '—',     '—',     false],
];

function Step4({ onNext, onBack, onExit, loading, error }: { onNext: () => void; onBack: () => void; onExit?: () => void; loading?: boolean; error?: string }) {
  return (
    <OnbCard step={3} title="When are you on the clock?" sub="Ringo only auto-replies when you're not picking up. Outside hours, callers get a different message you control." onNext={onNext} onBack={onBack} loading={loading} error={error} onExit={onExit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <div style={{ padding: '20px 22px', borderRadius: 14, border: `1px solid ${RINGO.border}`, background: '#fff' }}>
          <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Business hours</div>
          {HOURS_DATA.map(([d, o, c, on]) => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: `1px solid ${RINGO.border}` }}>
              <div style={{ width: 50, fontWeight: 600, fontSize: 13 }}>{d}</div>
              <button type="button" style={{ width: 38, height: 22, borderRadius: 99, padding: 2, border: 'none', cursor: 'pointer', background: on ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : RINGO.borderStrong }}>
                <span style={{ display: 'block', width: 18, height: 18, borderRadius: '50%', background: '#fff', marginLeft: on ? 16 : 0 }} />
              </button>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input readOnly value={o} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, fontSize: 13, color: on ? RINGO.ink : RINGO.ink4, background: '#fff' }} />
                <span style={{ alignSelf: 'center', color: RINGO.ink3 }}>—</span>
                <input readOnly value={c} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, fontSize: 13, color: on ? RINGO.ink : RINGO.ink4, background: '#fff' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '18px 20px', borderRadius: 14, background: 'linear-gradient(135deg,#fff4e0,#fde8ec)', border: '1px solid #fcd9b0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <IconTile grad={RINGO.iRos} size={28} radius={8}><Icon d={ICONS.zap} size={13} /></IconTile>
              <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, fontSize: 14, color: '#7a2515' }}>After-hours emergencies</div>
            </div>
            <div style={{ fontSize: 12.5, color: '#7a2515', lineHeight: 1.55, marginBottom: 10 }}>
              If a caller texts <span style={{ fontFamily: RINGO.font.mono, fontWeight: 700 }}>&ldquo;emergency&rdquo;</span>, &ldquo;leak&rdquo;, or &ldquo;no power&rdquo;, we&rsquo;ll page you on:
            </div>
            <input defaultValue="+1 (415) 555-0188 · Marco's cell" style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #fcd9b0', background: '#fff', fontFamily: RINGO.font.mono, fontSize: 13, color: RINGO.ink, boxSizing: 'border-box' }} />
          </div>
          <div style={{ padding: '18px 20px', borderRadius: 14, background: '#fff', border: `1px solid ${RINGO.border}` }}>
            <div style={{ fontFamily: RINGO.font.head, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Time zone</div>
            <button type="button" style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}`, background: '#fff', fontFamily: RINGO.font.ui, fontSize: 13, color: RINGO.ink, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              America / Los Angeles · PT
              <Icon d={ICONS.chev} size={14} />
            </button>
          </div>
        </div>
      </div>
    </OnbCard>
  );
}

// ── Step 5 ─────────────────────────────────────────────────────────────────

function Step5({ onNext, onBack, onExit, loading, provisionedNumber }: { onNext: () => void; onBack: () => void; onExit?: () => void; loading?: boolean; provisionedNumber?: string }) {
  const displayNumber = provisionedNumber || '+1 (___) ___-____';
  const checks: [string, boolean][] = [
    ['Number provisioned',    !!provisionedNumber],
    ['SMS sender warmed up',  true],
    ['Voice template loaded', true],
    ['First test call',       false],
  ];
  return (
    <OnbCard step={4} title="One test call and you're live" primary="Activate Ringo" sub="Call your Ringo number from any phone, hang up before the third ring, and we'll text you back within 12 seconds." onNext={onNext} onBack={onBack} loading={loading} onExit={onExit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ padding: '24px', borderRadius: 16, background: 'radial-gradient(120% 100% at 0% 0%, #2a1659 0%, #0f3460 60%, #06081a 100%)', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: 280 }}>
          <div style={{ position: 'absolute', right: -80, bottom: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(6,182,212,0.45),transparent)', filter: 'blur(8px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Step 1</div>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 6 }}>Call your Ringo number</div>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <Icon d={ICONS.phone} size={20} />
              <span style={{ fontFamily: RINGO.font.mono, fontSize: provisionedNumber ? 18 : 14, fontWeight: 600 }}>{displayNumber}</span>
            </div>
            <div style={{ marginTop: 16, fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>Hang up before voicemail. Ringo will detect the missed call and text you back in under 12 seconds.</div>
          </div>
        </div>
        <div style={{ padding: '18px 20px', borderRadius: 16, background: '#fff', border: `1px solid ${RINGO.border}` }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: RINGO.ink3 }}>Step 2 · waiting</div>
          <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4, color: RINGO.ink }}>Listening for your test call…</div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center', padding: '14px 16px', borderRadius: 12, background: '#f6f7fb', border: `1px dashed ${RINGO.borderStrong}` }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 6px rgba(16,185,129,0.18)' }} />
            <span style={{ fontSize: 13, color: RINGO.ink2 }}>Forwarding active · waiting for ring</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checks.map(([l, d], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: d ? RINGO.ink : RINGO.ink3 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: d ? 'linear-gradient(135deg,#059669,#06b6d4)' : '#f1f3f9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {d ? <Icon d={ICONS.check} size={11} stroke={3} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: RINGO.ink4 }} />}
                </span>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </OnbCard>
  );
}

// ── Onboarding page ────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — registration data
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Plumbing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 — provisioned number (set by Step2 after /api/numbers/provision)
  const [provisionedNumber, setProvisionedNumber] = useState('');

  // Step 3 — SMS message
  const [smsMessage, setSmsMessage] = useState(
    `Hi {{caller_first_name}}, this is ${businessName || 'our team'} 👋\nSorry we missed your call — can you reply with the address and what's going on? We'll send a quote within 15 min and call you back.`
  );

  const advance = () => setStep(s => Math.min(s + 1, 4));
  const back = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  async function handleStep1Next() {
    if (!email || !password || !businessName) {
      setError('Business name, email, and password are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, business_name: businessName, business_type: businessType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Registration failed');
        return;
      }
      saveToken(data.access_token);
      advance();
    } catch {
      setError('Network error — is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleSettingsNext(fields: Record<string, unknown>) {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to save settings');
        return;
      }
      advance();
    } catch {
      setError('Network error — is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleActivate() {
    router.push('/dashboard');
  }

  function handleExit() {
    router.push('/dashboard');
  }

  const steps = [
    <Step1 key={0}
      businessName={businessName} setBusinessName={setBusinessName}
      businessType={businessType} setBusinessType={setBusinessType}
      email={email} setEmail={setEmail}
      password={password} setPassword={setPassword}
      loading={loading} error={error}
      onNext={handleStep1Next} onBack={back} onExit={handleExit}
    />,
    <Step2 key={1}
      onNext={advance}
      onBack={back}
      onExit={handleExit}
      onProvisioned={setProvisionedNumber}
    />,
    <Step3 key={2}
      smsMessage={smsMessage} setSmsMessage={setSmsMessage}
      loading={loading} error={error}
      onNext={() => handleSettingsNext({ sms_message: smsMessage })} onBack={back} onExit={handleExit}
    />,
    <Step4 key={3}
      loading={loading} error={error}
      onNext={() => handleSettingsNext({})} onBack={back} onExit={handleExit}
    />,
    <Step5 key={4} loading={loading} onNext={handleActivate} onBack={back} onExit={handleExit} provisionedNumber={provisionedNumber} />,
  ];

  return (
    <div style={{ background: '#fff', fontFamily: RINGO.font.ui, color: RINGO.ink, minHeight: '100vh' }}>
      {steps[step]}
    </div>
  );
}

'use client';

import React from 'react';
import { Bot, Check, Shield, Lock, Zap, Calendar, MessageSquare, Bell, CreditCard, Settings, ArrowRight } from 'lucide-react';
import { RINGO } from '@/components/ringo/tokens';
import { SiteNav } from '@/components/ringo/SiteNav';
import { SiteFooter } from '@/components/ringo/SiteFooter';
import { openInquiry } from '@/components/ringo/InquiryModal';

// ── Scroll-reveal hook ─────────────────────────────────────────────────────

function useFadeUp(delay = 0) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, style: { opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(36px)', transition: `opacity 0.7s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.7s ${delay}ms cubic-bezier(0.16,1,0.3,1)` } as React.CSSProperties };
}

// ── Hero mock inbox ────────────────────────────────────────────────────────

function HeroInboxMock() {
  const convos = [
    { initials: 'JH', grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)', name: 'Jenna Holcomb', snippet: 'kitchen sink leak, need someone today', status: 'BOOKED', statusBg: '#ecfdf5', statusCol: '#059669', channel: 'SMS', channelCol: '#7c3aed' },
    { initials: 'SK', grad: 'linear-gradient(135deg,#25d366,#128c7e)',  name: 'Sarah Kowalski', snippet: 'Water heater leaking, can you come?', status: 'REPLYING', statusBg: '#f5f3ff', statusCol: '#7c3aed', channel: 'WA', channelCol: '#25d366' },
    { initials: 'MP', grad: 'linear-gradient(135deg,#dd2a7b,#8134af)', name: '@marcoplumb', snippet: 'Do you do gas line work?', status: 'REPLIED', statusBg: '#eff6ff', statusCol: '#1d4ed8', channel: 'IG', channelCol: '#dd2a7b' },
  ];
  return (
    <div style={{
      width: '100%',
      maxWidth: 800,
      margin: '0 auto',
      borderRadius: 20,
      background: 'linear-gradient(180deg,#1a1240 0%,#0d1030 100%)',
      overflow: 'hidden',
      boxShadow: '0 60px 120px -32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
    }}>
      {/* Gradient header bar */}
      <div style={{ height: 4, background: 'linear-gradient(90deg,#7c3aed,#06b6d4,#059669)' }} />
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={18} color="#fff" strokeWidth={2.2} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: RINGO.font.head }}>Ripe Lead Inbox</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>3 active conversations</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em' }}>LIVE</span>
        </div>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {convos.map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c.grad }} />
            <div style={{ width: 40, height: 40, borderRadius: 12, background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: RINGO.font.head, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{c.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{c.name}</span>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', fontSize: 9, fontWeight: 700, color: c.channelCol, letterSpacing: '0.06em' }}>{c.channel}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.snippet}</div>
            </div>
            <span style={{ padding: '3px 8px', borderRadius: 6, background: c.statusBg, color: c.statusCol, fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', flexShrink: 0 }}>{c.status}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'space-between' }}>
        {[{ label: 'Replied', value: '3/3' }, { label: 'Booked', value: '1' }, { label: 'Avg time', value: '9s' }].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feature section mockups ────────────────────────────────────────────────

function MockVoiceProfile() {
  return (
    <div style={{
      borderRadius: 20,
      background: 'linear-gradient(160deg,#1a1040 0%,#0d1c3a 60%,#061224 100%)',
      padding: 28,
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 40px 80px -24px rgba(0,0,0,0.5)',
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Voice Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800 }}>P</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Pacific Plumbing</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>Custom voice · Plumber</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em' }}>ACTIVE</span>
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Tone settings</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['Friendly', 'Direct', 'Local'].map((t, i) => (
            <span key={t} style={{ padding: '6px 12px', borderRadius: 99, background: i === 0 ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)', border: i === 0 ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, color: i === 0 ? '#a78bfa' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>{t}</span>
          ))}
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Sample reply</div>
        <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            "Yep — shut your angle stops first. We can be there 1–2 PM, $95 trip fee applied to repair. ✓?"
          </div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Sent by Ripe Lead · 11s response</div>
        </div>
      </div>
    </div>
  );
}

function MockInboxChannels() {
  const channels = [
    { ch: 'SMS', grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)', name: 'Jenna Holcomb', msg: 'kitchen sink leak, 2204 folsom', status: 'BOOKED', statusBg: '#ecfdf5', statusCol: '#059669' },
    { ch: 'WA',  grad: 'linear-gradient(135deg,#25d366,#128c7e)', name: 'Sarah K.',       msg: 'Can you do tomorrow morning?', status: 'REPLYING', statusBg: '#f5f3ff', statusCol: '#7c3aed' },
    { ch: 'IG',  grad: 'linear-gradient(135deg,#dd2a7b,#8134af)', name: '@marcoplumb',   msg: 'Hey do you do gas lines?',    status: 'REPLIED',  statusBg: '#eff6ff', statusCol: '#1d4ed8' },
    { ch: 'FB',  grad: 'linear-gradient(135deg,#1877f2,#00b2ff)', name: 'Mike Brennan',  msg: 'Need a water heater quote',  status: 'BOOKED',   statusBg: '#ecfdf5', statusCol: '#059669' },
  ];
  return (
    <div style={{ borderRadius: 20, background: '#f6f7fb', padding: 20, border: `1px solid ${RINGO.border}`, boxShadow: '0 40px 80px -24px rgba(15,21,53,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>R</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: RINGO.ink }}>Ripe Lead Inbox</div>
          <div style={{ fontSize: 10, color: RINGO.ink3 }}>All channels unified</div>
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: '#ecfdf5', fontSize: 9, fontWeight: 700, color: '#059669' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669' }} /> LIVE
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {channels.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderRadius: 12, border: `1px solid ${RINGO.border}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c.grad }} />
            <span style={{ width: 28, height: 28, borderRadius: 8, background: c.grad, color: '#fff', fontSize: 9, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.02em', flexShrink: 0 }}>{c.ch}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
              <div style={{ fontSize: 10, color: RINGO.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.msg}</div>
            </div>
            <span style={{ padding: '2px 7px', borderRadius: 6, background: c.statusBg, color: c.statusCol, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.06em', flexShrink: 0 }}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCalendar() {
  const slots = [
    { time: '9:00 AM', name: 'Sarah K.', job: 'Water heater install', booked: true, grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)' },
    { time: '11:30 AM', name: '-', job: 'Available', booked: false, grad: '' },
    { time: '1:00 PM', name: 'Jenna Holcomb', job: 'Sink repair · 2204 Folsom', booked: true, grad: 'linear-gradient(135deg,#059669,#06b6d4)' },
    { time: '2:30 PM', name: '-', job: 'Available', booked: false, grad: '' },
    { time: '4:00 PM', name: 'Mike Brennan', job: 'Water heater quote', booked: true, grad: 'linear-gradient(135deg,#1877f2,#06b6d4)' },
  ];
  return (
    <div style={{ borderRadius: 20, background: 'linear-gradient(160deg,#f5f3ff 0%,#ecfdf5 100%)', padding: 22, border: `1px solid ${RINGO.border}`, boxShadow: '0 40px 80px -24px rgba(15,21,53,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', borderRadius: 12, border: `1px solid ${RINGO.border}`, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#4285f4,#34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>G</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink }}>Google Calendar</div>
          <div style={{ fontSize: 9.5, color: RINGO.ink3 }}>Today · Auto-sync on</div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6 }}>SYNCED</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slots.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: s.booked ? '#fff' : 'rgba(255,255,255,0.5)', borderRadius: 12, border: s.booked ? `1px solid ${RINGO.border}` : '1px dashed #d1d5e4', position: 'relative', overflow: 'hidden', opacity: s.booked ? 1 : 0.6 }}>
            {s.booked && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: s.grad }} />}
            <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, width: 54, flexShrink: 0 }}>{s.time}</div>
            {s.booked ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink }}>{s.name}</div>
                <div style={{ fontSize: 10, color: RINGO.ink3 }}>{s.job}</div>
              </div>
            ) : (
              <div style={{ flex: 1, fontSize: 12, color: RINGO.ink4 }}>Available</div>
            )}
            {s.booked && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" stroke="#22c55e" strokeWidth="1.2"/><path d="M4.5 7l2 2 3.5-3" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '8px 14px', background: 'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(6,182,212,0.08))', borderRadius: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>3 jobs auto-booked while you slept</span>
      </div>
    </div>
  );
}

// ── Feature section ────────────────────────────────────────────────────────

interface FeatureSectionProps {
  eyebrow: string;
  headline: string;
  body: string;
  bullets: string[];
  mockup: React.ReactNode;
  flip?: boolean;
}

function FeatureSection({ eyebrow, headline, body, bullets, mockup, flip = false }: FeatureSectionProps) {
  const textFade = useFadeUp(0);
  const mockFade = useFadeUp(120);
  return (
    <div className="r-mk-feature-row" style={{ borderBottom: `1px solid ${RINGO.border}` }}>
      <div ref={textFade.ref} style={{ ...textFade.style, order: flip ? 1 : 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{eyebrow}</div>
        <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.08, color: RINGO.ink, margin: '0 0 18px' }}>{headline}</h2>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: RINGO.ink3, margin: '0 0 28px' }}>{body}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Check size={12} strokeWidth={3} />
              </span>
              <span style={{ fontSize: 15, color: RINGO.ink2, lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={mockFade.ref} className="r-mk-feature-mockup" style={{ ...mockFade.style, order: flip ? 0 : 1 }}>
        {mockup}
      </div>
    </div>
  );
}

// ── Integration tile ───────────────────────────────────────────────────────

interface IntTileProps { name: string; icon: React.ReactNode; grad: string; desc: string; delay: number; }

function IntTile({ name, icon, grad, desc, delay }: IntTileProps) {
  const fade = useFadeUp(delay);
  return (
    <div ref={fade.ref} style={{
      ...fade.style,
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '28px 16px', borderRadius: 18, background: '#fff', border: `1px solid ${RINGO.border}`,
      boxShadow: '0 8px 24px -16px rgba(15,21,53,0.15)', gap: 12,
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 24px -8px rgba(0,0,0,0.2)' }}>{icon}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: RINGO.ink }}>{name}</div>
      <div style={{ fontSize: 12, color: RINGO.ink3, lineHeight: 1.45 }}>{desc}</div>
    </div>
  );
}

// ── Product page ───────────────────────────────────────────────────────────

export default function ProductPage() {
  const heroFade = useFadeUp(0);
  const heroCta = useFadeUp(150);
  const heroMock = useFadeUp(250);

  const integrations = [
    { name: 'Calendar',     icon: <Calendar size={24} />,      grad: 'linear-gradient(135deg,#4285f4,#34a853)', desc: 'Auto-book appointments' },
    { name: 'Automations',  icon: <Zap size={24} />,           grad: 'linear-gradient(135deg,#ff4a00,#ff9b00)', desc: 'Connect any workflow' },
    { name: 'Alerts',       icon: <Bell size={24} />,          grad: 'linear-gradient(135deg,#e01e5a,#ecb22e)', desc: 'Real-time notifications' },
    { name: 'Messaging',    icon: <MessageSquare size={24} />, grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)', desc: 'Every channel, one place' },
    { name: 'Payments',     icon: <CreditCard size={24} />,    grad: 'linear-gradient(135deg,#635bff,#9b8cff)', desc: 'Collect deposits in-chat' },
    { name: 'Settings',     icon: <Settings size={24} />,      grad: 'linear-gradient(135deg,#475569,#94a3b8)', desc: 'Customize everything' },
  ];

  const stats = [
    { value: '2.4M+', label: 'Calls answered' },
    { value: '180K+', label: 'Jobs booked' },
    { value: '11s',   label: 'Avg reply time' },
    { value: '$18M+', label: 'Revenue recovered' },
  ];

  return (
    <div style={{ background: '#fff', color: RINGO.ink, fontFamily: RINGO.font.ui, overflowX: 'hidden' }}>
      <SiteNav transparent />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: '#0d0e1c',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(120px, 14vw, 180px) clamp(16px, 4vw, 48px) clamp(80px, 8vw, 120px)',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        {/* Gradient mesh background */}
        <div aria-hidden style={{ position: 'absolute', left: '30%', top: '-10%', width: 700, height: 700, background: 'radial-gradient(closest-side,rgba(124,58,237,0.22),transparent)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', right: '20%', bottom: '-10%', width: 500, height: 500, background: 'radial-gradient(closest-side,rgba(6,182,212,0.15),transparent)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div ref={heroFade.ref} style={{ ...heroFade.style, position: 'relative', maxWidth: 860, width: '100%' }}>
          {/* Eyebrow pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 99, background: 'transparent', border: '1px solid rgba(124,58,237,0.5)', fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>
            THE AI ENGINE
          </div>

          {/* Massive headline */}
          <h1 style={{
            fontFamily: RINGO.font.head,
            fontSize: 'clamp(48px, 7vw, 80px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            margin: '0 0 28px',
          }}>
            <span style={{ color: '#fff', display: 'block' }}>Every lead, captured.</span>
            <span style={{ display: 'block', backgroundImage: 'linear-gradient(120deg,#a78bfa 0%,#22d3ee 55%,#34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every reply, instant.</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 40px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            The AI engine behind Ripe Lead — built for the trades, tuned to your voice, live in 4 minutes.
          </p>
        </div>

        <div ref={heroCta.ref} className="r-mk-hero-cta" style={{ ...heroCta.style, position: 'relative', marginBottom: 72 }}>
          <button onClick={openInquiry} className="r-mk-cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: RINGO.font.ui, boxShadow: '0 20px 48px -12px rgba(124,58,237,0.65)' }}>
            Inquiry Now <ArrowRight size={16} />
          </button>
          <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
            See how it works
          </a>
        </div>

        <div ref={heroMock.ref} style={{ ...heroMock.style, width: '100%', maxWidth: 860, position: 'relative' }}>
          <HeroInboxMock />
        </div>
      </section>

      {/* ── Feature sections (white bg, alternating) ─────────────────────── */}
      <section id="features" style={{ padding: '0 clamp(16px,4vw,48px)', maxWidth: 1180, margin: '0 auto' }}>
        <FeatureSection
          eyebrow="Custom voice training"
          headline="AI that speaks your trade"
          body="Most AI sounds like a chatbot. Ripe Lead learns your trade, your pricing, your tone — so customers can't tell the difference. They just think you're unusually fast."
          bullets={[
            'Train once on your trade, prices, and service area',
            'Detects emergency keywords: "leak", "no power", "burst pipe"',
            'Same voice at 2 PM or 2 AM — never off-brand',
            'Handles price inquiries, scheduling, and objections',
          ]}
          mockup={<MockVoiceProfile />}
          flip={false}
        />
        <FeatureSection
          eyebrow="Unified messaging"
          headline="One inbox, every channel"
          body="SMS, WhatsApp, Instagram DMs, Facebook Messenger — all in one place, all replied to in under 11 seconds. No tab-switching, no missed messages, no lead falling through the cracks."
          bullets={[
            'SMS, WhatsApp Business API, Instagram DMs, Facebook Messenger',
            'Every reply under 11 seconds regardless of channel',
            'Full conversation history across every channel',
            'Spam and robocall detection built in',
          ]}
          mockup={<MockInboxChannels />}
          flip={true}
        />
        <FeatureSection
          eyebrow="Smart scheduling"
          headline="Books jobs automatically"
          body="Ripe Lead doesn't just reply — it books the appointment, syncs to your calendar, and sends the confirmation. You wake up to a full day already scheduled."
          bullets={[
            'Integrates with Google Calendar and Jobber out of the box',
            'Sends booking confirmations and reminders automatically',
            'Handles reschedules and cancellations via SMS',
            'Re-engages no-shows 48 hours later with one-touch reschedule',
          ]}
          mockup={<MockCalendar />}
          flip={false}
        />
      </section>

      {/* ── Integrations ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,8vw,108px) clamp(16px,4vw,48px)', background: '#f6f7fb', borderTop: `1px solid ${RINGO.border}`, borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Integrations</div>
            <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', color: RINGO.ink, margin: 0 }}>
              Works with everything you use
            </h2>
          </div>
          <div className="r-mk-grid-6">
            {integrations.map((int, i) => (
              <IntTile key={int.name} name={int.name} icon={int.icon} grad={int.grad} desc={int.desc} delay={i * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0d0e1c 0%,#12103a 50%,#0a1628 100%)', padding: 'clamp(56px,6vw,80px) clamp(16px,4vw,48px)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 70% at 80% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="r-mk-stats-4" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          {stats.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="r-mk-stat-cell" style={{ flex: 1, textAlign: 'center', padding: 'clamp(16px, 3vw, 40px)' }}>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 10 }}>{s.label}</div>
              </div>
              {i < stats.length - 1 && <div className="r-mk-stat-divider" style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px,8vw,108px) clamp(16px,4vw,48px)', background: 'radial-gradient(120% 100% at 0% 0%,#2a1659 0%,#0f3460 60%,#06081a 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', right: -120, top: -140, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.55),transparent)', filter: 'blur(22px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', left: -120, bottom: -180, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(6,182,212,0.45),transparent)', filter: 'blur(22px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 18px', lineHeight: 1.08 }}>
            Start answering leads in 4 minutes
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', margin: '0 0 36px', lineHeight: 1.6 }}>
            The first job Ripe Lead saves usually pays for the year.
          </p>
          <button onClick={openInquiry} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 40px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: RINGO.font.ui, boxShadow: '0 24px 56px -12px rgba(124,58,237,0.65)' }}>
            Inquiry Now <ArrowRight size={18} />
          </button>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
            {['Keep your number', 'Live in 4 min', 'No long-term contracts'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={12} color="rgba(255,255,255,0.4)" strokeWidth={3} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

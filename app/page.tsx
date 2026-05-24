'use client';

import React, { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { IconTile } from '@/components/ringo/IconTile';
import { RingoLogo } from '@/components/ringo/RingoLogo';
import { SiteNav } from '@/components/ringo/SiteNav';
import { SiteFooter } from '@/components/ringo/SiteFooter';
import { openInquiry } from '@/components/ringo/InquiryModal';
import { CHANNEL_META, ChannelGlyph, ChannelTile, type ChannelKey } from '@/components/ringo/ChannelLogos';

// ── LazyMount: reveal section on scroll into view ─────────────────────────

function subscribeToMobileQuery(callback: () => void) {
  const mq = window.matchMedia('(max-width: 680px)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getMobileQuerySnapshot() {
  return window.matchMedia('(max-width: 680px)').matches;
}

function getServerMobileQuerySnapshot() {
  return false;
}

function LazyMount({ children, threshold = 0 }: { children: React.ReactNode; threshold?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) { setVisible(true); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }

    // If already in/near viewport on mount, reveal immediately (no flash)
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh + 400) { setVisible(true); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } });
    }, { threshold, rootMargin: '400px 0px 400px 0px' });
    io.observe(el);

    // Safety fallback: if observer never fires (browser quirk, scroll restore race),
    // reveal after a short delay so content never stays invisible.
    const fallback = setTimeout(() => setVisible(true), 600);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, [threshold]);
  return <div ref={ref} className={`r-lazy${visible ? ' is-visible' : ''}`}>{children}</div>;
}

// ── Hero ───────────────────────────────────────────────────────────────────

function HeroBackdrop() {
  return (
    <div className="r-hero-bg">
      <div className="r-hero-aurora" />
      <div className="r-hero-bg-grid" />
      <div className="r-hero-noise" />
    </div>
  );
}

// 3-phase phone: ringing/notif → reply → booked. Phase 0 differs by channel kind:
//   • 'call'  = traditional phone call ringing (you actually missed it)
//   • 'msg'   = incoming message notification banner (no ringing — Twilio SMS / WA / IG / FB DM)
type Phase = 0 | 1 | 2;
type LeadKind = 'call' | 'msg';
type Lead = { ch: ChannelKey; kind: LeadKind; name: string; handle: string; msg: string; reply: string; bookTime: string };

const LEADS: Lead[] = [
  // The classic Ringo flow: phone rings, you can't pick up, Ringo texts them back
  { ch: 'call', kind: 'call', name: 'Jenna Holcomb', handle: '+1 (415) 555-0136', msg: 'kitchen sink leak, 2204 folsom #3', reply: 'Got it — we can be there 1–2 PM today, $95 trip applied to repair. ✓?', bookTime: '1:00 PM' },
  // WhatsApp: incoming message, never a call
  { ch: 'wa',   kind: 'msg',  name: 'Sarah Kowalski', handle: 'WhatsApp', msg: 'Can you do tomorrow morning? Water heater leaking 😬', reply: 'Yes — 9 AM works, we\'ll swing by with a new T&P valve. Confirm?', bookTime: '9:00 AM tomorrow' },
  // Instagram DM
  { ch: 'ig',   kind: 'msg',  name: '@marcoplumb', handle: 'Instagram DM', msg: 'Hey — do you do gas line work? Got a smell in the kitchen', reply: 'Yes! That\'s urgent — shut your gas valve. We can be there in 45 min, $0 trip if we find a leak.', bookTime: 'in 45 min' },
  // Facebook Messenger
  { ch: 'fb',   kind: 'msg',  name: 'Mike Brennan', handle: 'Facebook Messenger', msg: 'Need a quote for new 50-gal water heater install', reply: 'Quote: $1,650 installed (40-gal) or $1,890 (50-gal) — both include haul-away. Want to schedule?', bookTime: 'Thursday 10 AM' },
  // SMS text — also a message, not a call (real Twilio inbound SMS)
  { ch: 'sms',  kind: 'msg',  name: 'Lina Park', handle: '+1 (415) 555-0192', msg: 'fuse keeps tripping in the kitchen, breaker box is buzzing', reply: 'Sounds urgent — turn off the main if you smell anything burning. We can be over in 30 min. Confirm?', bookTime: 'in 30 min' },
];

function HeroPhone() {
  const [leadIdx, setLeadIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>(0);

  // Phase durations: signal 3s, reply 5s, booked 2.5s -> 10.5s per lead
  useEffect(() => {
    const seq: { ph: Phase; ms: number }[] = [
      { ph: 0, ms: 3000 },
      { ph: 1, ms: 5000 },
      { ph: 2, ms: 2500 },
    ];
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;
    seq.forEach(({ ph, ms }) => {
      timeouts.push(setTimeout(() => setPhase(ph), acc));
      acc += ms;
    });
    const advance = setTimeout(() => setLeadIdx(i => (i + 1) % LEADS.length), acc);
    timeouts.push(advance);
    return () => timeouts.forEach(clearTimeout);
  }, [leadIdx]);

  const lead = LEADS[leadIdx];
  const meta = CHANNEL_META[lead.ch];

  return (
    <div style={{ position: 'relative' }}>
      {/* halo behind phone */}
      <div aria-hidden style={{ position: 'absolute', inset: '-30px', borderRadius: '50%', background: `radial-gradient(closest-side, ${meta.ring}, transparent 70%)`, filter: 'blur(40px)', opacity: 0.7, transition: 'background 0.8s ease' }} />

      <div style={{
        position: 'relative',
        width: 296,
        borderRadius: 44,
        background: 'linear-gradient(180deg,#1a2150,#06081a)',
        padding: 7,
        boxShadow: '0 60px 120px -32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 80px -16px rgba(124,58,237,0.5)',
      }}>
        {/* notch */}
        <div style={{ position: 'absolute', left: '50%', top: 14, transform: 'translateX(-50%)', width: 92, height: 22, borderRadius: 99, background: '#06081a', zIndex: 3 }} />

        <div style={{ borderRadius: 37, background: phase === 0 ? 'linear-gradient(180deg,#0f1535,#1a2150)' : '#f6f7fb', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 560, position: 'relative', transition: 'background 0.5s ease', color: RINGO.ink }}>

          {/* PHASE 0a: INCOMING CALL (only for phone-call channel) */}
          {phase === 0 && lead.kind === 'call' && (
            <div key={`p0c-${leadIdx}`} className="r-anim-fade-up" style={{ flex: 1, padding: '40px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', fontWeight: 700, marginTop: 8 }}>INCOMING CALL</div>
              <div style={{ position: 'relative', width: 110, height: 110, marginTop: 38, marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="r-anim-call-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: meta.grad }} />
                <span className="r-anim-call-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: meta.grad, animationDelay: '0.7s' }} />
                <div style={{ position: 'relative', width: 82, height: 82, borderRadius: '50%', background: meta.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 14px 36px -10px ${meta.ring}` }}>
                  <span className="r-anim-shake-h" style={{ display: 'inline-flex' }}>
                    <ChannelGlyph ch="call" size={36} />
                  </span>
                </div>
              </div>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 4 }}>{lead.name}</div>
              <div style={{ fontFamily: RINGO.font.mono, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{lead.handle}</div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: 32, paddingTop: 28 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(135deg)', boxShadow: '0 8px 20px -6px rgba(220,38,38,0.5)' }}>
                  <Icon d={ICONS.phone} size={22} />
                </div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  <Icon d={ICONS.phone} size={22} />
                </div>
              </div>
            </div>
          )}

          {/* PHASE 0b: INCOMING MESSAGE NOTIFICATION (SMS / WhatsApp / IG / FB) */}
          {phase === 0 && lead.kind === 'msg' && (
            <div key={`p0m-${leadIdx}`} style={{ flex: 1, padding: '36px 14px 18px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
              {/* faux lockscreen wallpaper */}
              <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(80% 60% at 50% 100%, ${meta.ring}, transparent 70%), linear-gradient(180deg,#0f1535,#1a2150)` }} />

              {/* clock */}
              <div style={{ position: 'relative', textAlign: 'center', color: '#fff', marginTop: 6, marginBottom: 14 }}>
                <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 600, letterSpacing: '0.06em' }}>SATURDAY · 11 NOV</div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 56, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 4 }}>11:42</div>
              </div>

              {/* notification banner */}
              <div className="r-anim-banner-in" style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 12px 12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', boxShadow: `0 20px 40px -16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.5), 0 0 30px -10px ${meta.ring}`, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: meta.grad }} />
                <span style={{ width: 32, height: 32, borderRadius: 8, background: meta.grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flex: '0 0 auto', boxShadow: `0 6px 14px -6px ${meta.ring}` }}>
                  <ChannelGlyph ch={lead.ch} size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: RINGO.ink, letterSpacing: '-0.005em' }}>{meta.label}</span>
                    <span style={{ fontSize: 9.5, color: RINGO.ink3, fontWeight: 600 }}>· now</span>
                  </div>
                  <div style={{ fontSize: 11, color: RINGO.ink2, fontWeight: 700, marginBottom: 2 }}>{lead.name}</div>
                  <div style={{ fontSize: 11, color: RINGO.ink3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lead.msg}</div>
                </div>
              </div>

              {/* small "Ringo handling" hint */}
              <div className="r-anim-fade-up" style={{ position: 'relative', display: 'inline-flex', alignSelf: 'center', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', marginTop: 'auto', animationDelay: '0.6s' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.25)' }} />
                RIPE LEAD IS REPLYING…
              </div>
            </div>
          )}

          {/* PHASES 1 & 2: SMS thread */}
          {phase >= 1 && (
            <>
              <div style={{ padding: '34px 14px 12px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={lead.name.replace(/^@/, '')} size={32} />
                  <span style={{ position: 'absolute', right: -3, bottom: -3, width: 14, height: 14, borderRadius: '50%', background: meta.grad, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>
                    <ChannelGlyph ch={lead.ch} size={8} />
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: RINGO.ink }}>{lead.name}</div>
                  <div style={{ fontSize: 10, color: RINGO.ink3 }}>active · {phase === 1 ? '11s ago' : 'just now'}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 99, background: 'linear-gradient(135deg,#ecfeff,#f5f3ff)', fontSize: 9, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.06em' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed' }} /> RIPE LEAD
                </span>
              </div>

              <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="r-anim-fade-up" style={{ alignSelf: 'center', padding: '3px 9px', borderRadius: 99, background: '#fee2e2', color: '#991b1b', fontSize: 9.5, fontWeight: 800, letterSpacing: '0.05em' }}>
                  ✕ MISSED · {meta.label.toUpperCase()}
                </div>

                {/* customer message */}
                <div key={`um-${leadIdx}-${phase}`} className="r-anim-fade-up" style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: '9px 12px', borderRadius: '14px 14px 4px 14px', background: meta.grad, color: '#fff', fontSize: 11.5, lineHeight: 1.45, animationDelay: '0.1s' }}>
                  {lead.msg}
                </div>

                {/* typing → bot reply */}
                {phase === 1 && (
                  <div key={`typ-${leadIdx}`} className="r-anim-fade-up" style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, display: 'inline-flex', alignItems: 'center', animationDelay: '1.2s' }}>
                    <span className="r-dot" /><span className="r-dot" /><span className="r-dot" />
                  </div>
                )}

                {phase === 2 && (
                  <>
                    <div key={`br-${leadIdx}`} className="r-anim-fade-up" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '9px 12px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 11.5, lineHeight: 1.45 }}>
                      {lead.reply}
                    </div>
                    <div key={`bk-${leadIdx}`} className="r-anim-pop-in" style={{ alignSelf: 'center', marginTop: 6, padding: '7px 14px', borderRadius: 99, background: 'linear-gradient(135deg,#059669,#06b6d4)', color: '#fff', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.05em', boxShadow: '0 10px 24px -10px rgba(5,150,105,0.6)', animationDelay: '0.4s', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      ✓ BOOKED · {lead.bookTime}
                    </div>
                  </>
                )}
              </div>

              <div style={{ padding: '10px 14px', background: '#fff', borderTop: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                {phase === 1 ? (
                  <>
                    <span style={{ display: 'inline-flex' }}>
                      <span className="r-dot" /><span className="r-dot" /><span className="r-dot" />
                    </span>
                    <span style={{ fontSize: 10.5, color: RINGO.ink2, fontWeight: 600 }}>
                      Ripe Lead is replying…
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#06b6d4)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>✓</span>
                    <span style={{ fontSize: 10.5, color: RINGO.ink2, fontWeight: 600 }}>
                      Synced to <span style={{ color: '#0f1535', fontWeight: 700 }}>Google Calendar</span>
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* phase progress dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 22 }}>
        {[0, 1, 2].map(p => (
          <span key={p} className={`r-phase-dot${phase === p ? ' is-on' : ''}`} />
        ))}
      </div>
      <div style={{ marginTop: 10, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>
        {phase === 0 ? (lead.kind === 'call' ? `Missed call · ${lead.handle.split(' ')[0]}` : `New ${meta.label} message`) : phase === 1 ? 'Ripe Lead replying' : 'Booked'}
      </div>
    </div>
  );
}

// ── Animated KPI counter for the laptop dashboard ──────────────────────────

function useViewportCount(target: number, decimals = 0, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const startedRef = React.useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const t0 = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(parseFloat((eased * target).toFixed(decimals)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };
    if (typeof IntersectionObserver === 'undefined') { start(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, decimals, duration]);

  return { ref, val };
}

function KPI({ prefix = '', value, decimals = 0, label, delta }: { prefix?: string; value: number; decimals?: number; label: string; delta: string }) {
  const { ref, val } = useViewportCount(value, decimals);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toString();
  return (
    <div className="r-dash-stat">
      <div className="r-dash-stat-label">{label}</div>
      <div className="r-dash-stat-value" ref={ref}>{prefix}{display}</div>
      <div className="r-dash-stat-delta">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden><path d="M2 6.5L4.5 3.5L7 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {delta}
      </div>
    </div>
  );
}

// ── Laptop dashboard ────────────────────────────────────────────────────────

type ConvStatus = 'replying' | 'replied' | 'booked';
interface DashConv {
  initials: string; grad: string;
  name: string; ch: string; chColor: string;
  msg: string;
  status: ConvStatus;
}

const DASH_CONVS_BASE: DashConv[] = [
  { initials: 'SK', grad: 'linear-gradient(135deg,#25d366,#128c7e)', name: 'Sarah Kowalski', ch: 'WA',  chColor: '#25d366', msg: 'Water heater leaking, can you come?', status: 'replying' },
  { initials: 'MP', grad: 'linear-gradient(135deg,#dd2a7b,#8134af)', name: '@marcoplumb',    ch: 'IG',  chColor: '#dd2a7b', msg: 'Hey — do you do gas line work?',     status: 'replied'  },
  { initials: 'JH', grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)', name: 'Jenna Holcomb',  ch: 'SMS', chColor: '#7c3aed', msg: 'kitchen sink leak, 2204 folsom #3',   status: 'booked'   },
];

const DASH_INCOMING: DashConv[] = [
  { initials: 'MB', grad: 'linear-gradient(135deg,#1877f2,#00b2ff)', name: 'Mike Brennan',   ch: 'FB',  chColor: '#1877f2', msg: 'Need a quote for new water heater',   status: 'replying' },
  { initials: 'LP', grad: 'linear-gradient(135deg,#25d366,#128c7e)', name: 'Lina Park',      ch: 'WA',  chColor: '#25d366', msg: 'water in basement again 😬',          status: 'replying' },
  { initials: 'AP', grad: 'linear-gradient(135deg,#4285f4,#34a853)', name: 'Aisha Patel',    ch: 'GBM', chColor: '#4285f4', msg: 'Saturday emergency call possible?',   status: 'replying' },
  { initials: 'TV', grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)', name: 'Tony Vega',      ch: 'SMS', chColor: '#7c3aed', msg: 'roof leak after the storm last night',status: 'replying' },
  { initials: 'DC', grad: 'linear-gradient(135deg,#0284c7,#38bdf8)', name: 'Dre Whitfield',  ch: 'SMS', chColor: '#0284c7', msg: 'breaker box is buzzing, urgent',      status: 'replying' },
  { initials: 'MT', grad: 'linear-gradient(135deg,#dd2a7b,#8134af)', name: '@drmeit',        ch: 'IG',  chColor: '#dd2a7b', msg: 'After-hours emergency tooth pain',    status: 'replying' },
];

function HeroLaptop() {
  const [convs, setConvs] = useState<DashConv[]>(DASH_CONVS_BASE);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const incomingIdxRef = React.useRef(0);

  // Every ~3.6s: highlight the top "replying" card and flip it to "booked",
  // then drop the oldest card off the bottom and slide a brand-new lead in at the top.
  useEffect(() => {
    const id = setInterval(() => {
      setHighlight(0);
      setConvs(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], status: 'booked' };
        return updated;
      });
      setTimeout(() => {
        setConvs(prev => {
          const incoming = DASH_INCOMING[incomingIdxRef.current % DASH_INCOMING.length];
          incomingIdxRef.current += 1;
          // new lead arrives at top in "replying" state, oldest (last) falls off
          return [incoming, ...prev.slice(0, -1)];
        });
        setHighlight(null);
        setTick(t => t + 1);
      }, 1500);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="r-hero-laptop-wrap">
      <div className="r-laptop-bezel">
        <div className="r-laptop-camera" aria-hidden />
        <div className="r-laptop-screen">
          <div className="r-dash">
            {/* Top bar */}
            <div className="r-dash-topbar">
              <div className="r-dash-logo">R</div>
              <div style={{ minWidth: 0 }}>
                <div className="r-dash-title">Ripe Lead Dashboard</div>
                <div className="r-dash-subtitle">Today · Sat Nov 11</div>
              </div>
              <span className="r-dash-live">LIVE</span>
            </div>

            {/* Stats */}
            <div className="r-dash-stats">
              <KPI value={47}   label="Calls"   delta="+18 today" />
              <KPI value={23}   label="Booked"  delta="+12 today" />
              <KPI prefix="$" value={4830} label="Saved" delta="+34%" />
            </div>

            {/* Conversation feed */}
            <div className="r-dash-feed">
              <div className="r-dash-feed-title">
                <span>Live conversations</span>
                <span style={{ color: '#a78bfa', textTransform: 'none', letterSpacing: 0 }}>● {convs.length} active</span>
              </div>
              {convs.map((c, i) => (
                <div
                  key={`${c.initials}-${tick}-${i}`}
                  className={`r-dash-conv${highlight === i ? ' is-highlighted' : ''}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="r-dash-conv-side" style={{ background: c.grad }} />
                  <div className="r-dash-conv-ava" style={{ background: c.grad }}>{c.initials}</div>
                  <div className="r-dash-conv-body">
                    <div className="r-dash-conv-name">
                      <span>{c.name}</span>
                      <span className="r-dash-conv-ch-tag" style={{ color: c.chColor }}>{c.ch}</span>
                      <span className={`r-dash-conv-pill is-${c.status}`}>{c.status === 'booked' ? '✓ BOOKED' : c.status === 'replied' ? 'REPLIED' : 'REPLYING'}</span>
                    </div>
                    <div className="r-dash-conv-msg">{c.msg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="r-laptop-base" aria-hidden />
    </div>
  );
}

function Hero() {
  return (
    <section className="r-land-section r-hero-dark r-hero-section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 80, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <HeroBackdrop />

      <div className="r-land-hero-grid" style={{ position: 'relative', zIndex: 1, alignItems: 'center', width: '100%' }}>
        <div>
          <div className="r-hero-eyebrow">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#a78bfa,#22d3ee)' }} />
            New · SMS · WhatsApp · Instagram · Facebook — one inbox
          </div>

          <h1 className="r-land-hero-h1" style={{ fontFamily: RINGO.font.head, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, margin: '18px 0 18px', color: '#fff' }}>
            Every missed call,
            <br />
            <span style={{ backgroundImage: 'linear-gradient(120deg,#a78bfa 0%,#22d3ee 50%,#34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              answered in 11s.
            </span>
          </h1>

          <div className="r-hero-mute" style={{ fontSize: 16.5, lineHeight: 1.55, maxWidth: 480, marginBottom: 26 }}>
            Ripe Lead replies to missed calls, WhatsApp pings, Instagram DMs &amp; Facebook messages — instantly, in your voice — books the job, lands the lead in one inbox.
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
            <button onClick={openInquiry} className="r-hover-lift" style={{ padding: '14px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 14.5, fontWeight: 700, fontFamily: RINGO.font.ui, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 14px 28px -10px rgba(124,58,237,0.7)' }}>
              Inquiry Now <Icon d={ICONS.arrow} size={14} />
            </button>
            <button onClick={openInquiry} style={{ padding: '14px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', fontSize: 14.5, fontWeight: 600, fontFamily: RINGO.font.ui, cursor: 'pointer' }}>
              Book a demo
            </button>
          </div>

          {/* compact channel strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, fontSize: 12 }}>
            <span className="r-hero-mute2" style={{ fontWeight: 700, letterSpacing: '0.08em', fontSize: 10.5 }}>WORKS ON</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['sms', 'wa', 'ig', 'fb', 'msgr', 'gbm'] as ChannelKey[]).map(ch => (
                <span key={ch} data-name={CHANNEL_META[ch].label} className="r-hover-channel" style={{ width: 28, height: 28, borderRadius: 8, background: CHANNEL_META[ch].grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 14px -6px ${CHANNEL_META[ch].ring}` }}>
                  <ChannelGlyph ch={ch} size={14} />
                </span>
              ))}
            </div>
          </div>

          <div className="r-hero-mute2" style={{ display: 'flex', gap: 20, fontSize: 12.5, flexWrap: 'wrap' }}>
            {['Keep your number', 'Live in 4 minutes', 'No long-term contracts'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.check} size={14} stroke={3} /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Composition: laptop dashboard + overlapping animated phone */}
        <div className="r-hero-stage">
          <HeroLaptop />
          <div className="r-hero-phone-wrap">
            <div className="r-hero-phone-scale">
              <HeroPhone />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Logo strip ─────────────────────────────────────────────────────────────

const TRUST_BADGES: { label: string; icon: React.ReactNode; grad: string }[] = [
  { label: 'Twilio Partner',     grad: 'linear-gradient(135deg,#f22f46,#e91e63)', icon: <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: 12 }}>tw</span> },
  { label: 'Stripe Verified',    grad: 'linear-gradient(135deg,#635bff,#9b8cff)', icon: <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: 13 }}>S</span> },
  { label: 'A2P 10DLC Certified', grad: 'linear-gradient(135deg,#0f766e,#22d3a8)', icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'SOC 2 Type II',      grad: 'linear-gradient(135deg,#0284c7,#38bdf8)', icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4Z" stroke="#fff" strokeWidth={2} strokeLinejoin="round"/></svg> },
  { label: 'HIPAA Ready',        grad: 'linear-gradient(135deg,#dc2626,#fb923c)', icon: <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: 10 }}>HH</span> },
  { label: 'Google Cloud',       grad: 'linear-gradient(135deg,#4285f4,#ea4335)', icon: <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: 12 }}>G</span> },
  { label: 'Jobber Integration', grad: 'linear-gradient(135deg,#22d3a8,#0ea5e9)', icon: <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: 11 }}>JB</span> },
  { label: 'Zapier Compatible',  grad: 'linear-gradient(135deg,#ff4a00,#ff9b00)', icon: <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: 11 }}>Z</span> },
  { label: 'Google Calendar',    grad: 'linear-gradient(135deg,#4285f4,#34a853)', icon: <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: 11 }}>GC</span> },
  { label: 'TCPA Compliant',     grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)', icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" stroke="#fff" strokeWidth={2} strokeLinejoin="round"/></svg> },
];

function LogoStrip() {
  // Duplicate the list so the marquee can loop seamlessly with -50% translate
  const items = [...TRUST_BADGES, ...TRUST_BADGES];
  return (
    <section className="r-land-pad" style={{ paddingTop: 56, paddingBottom: 56, textAlign: 'center', background: '#fff' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 22 }}>
        Trusted infrastructure · built on the rails you already know
      </div>
      <div className="r-marquee" style={{ width: '100%' }}>
        <div className="r-marquee-track">
          {items.map((b, i) => (
            <span key={i} className="r-trust-badge">
              <span className="r-trust-badge-icon" style={{ background: b.grad }}>{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats Counter ──────────────────────────────────────────────────────────

interface StatDef {
  prefix: string;
  end: number;
  decimals: number;
  suffix: string;
  label: string;
  duration: number;
}

const STAT_ITEMS: StatDef[] = [
  { prefix: '',  end: 2.4,  decimals: 1, suffix: 'M+', label: 'Missed calls answered',    duration: 1800 },
  { prefix: '',  end: 180,  decimals: 0, suffix: 'K+', label: 'Jobs booked for customers', duration: 2000 },
  { prefix: '',  end: 11,   decimals: 0, suffix: 's',  label: 'Avg AI response time',      duration: 1400 },
  { prefix: '$', end: 18,   decimals: 0, suffix: 'M+', label: 'Revenue recovered',         duration: 2200 },
];

function useCountUp(end: number, decimals: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0);
  const rafRef = React.useRef<number>(0);
  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, end, decimals, duration]);
  return val;
}

function StatItem({ stat, active, last, mobile }: { stat: StatDef; active: boolean; last: boolean; mobile: boolean }) {
  const count = useCountUp(stat.end, stat.decimals, stat.duration, active);
  const display = stat.decimals > 0 ? count.toFixed(stat.decimals) : Math.floor(count).toString();

  return (
    <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'stretch', minWidth: mobile ? '45%' : 0 }}>
      <div style={{ flex: 1, padding: mobile ? '28px 20px' : '0 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
        <div style={{
          fontFamily: RINGO.font.head,
          fontWeight: 800,
          fontSize: mobile ? 44 : 'clamp(48px, 5.5vw, 76px)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: '#fff',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {stat.prefix}{display}{stat.suffix}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {stat.label}
        </div>
      </div>
      {!last && (
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', flexShrink: 0 }} />
      )}
    </div>
  );
}

function StatsCounter() {
  const [active, setActive] = useState(false);
  const mobile = useSyncExternalStore(subscribeToMobileQuery, getMobileQuerySnapshot, getServerMobileQuerySnapshot);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); io.disconnect(); } },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section style={{ background: 'linear-gradient(135deg, #0d0e1c 0%, #12103a 50%, #0a1628 100%)', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 70% at 80% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div className="r-land-pad" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 56, marginTop: 0 }}>
          Ripe Lead by the numbers
        </p>

        <div ref={ref} style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: 'stretch', flexWrap: mobile ? 'wrap' : 'nowrap' }}>
          {STAT_ITEMS.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} active={active} last={i === STAT_ITEMS.length - 1} mobile={mobile} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works (animated) ────────────────────────────────────────────────

function AnimatedPhone({ step }: { step: number }) {
  return (
    <div style={{ width: 280, height: 560, borderRadius: 42, background: '#0f1535', padding: 8, boxShadow: '0 40px 80px -28px rgba(15,21,53,0.45), 0 0 0 1px rgba(255,255,255,0.04)', position: 'relative' }}>
      {/* notch */}
      <div style={{ position: 'absolute', left: '50%', top: 14, transform: 'translateX(-50%)', width: 90, height: 22, borderRadius: 99, background: '#06081a', zIndex: 2 }} />
      <div style={{ width: '100%', height: '100%', borderRadius: 35, background: step === 0 ? 'linear-gradient(180deg,#0f1535,#1a2150)' : '#f6f7fb', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'background 0.6s ease' }}>
        {step === 0 && (
          <div key="ring" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 32, letterSpacing: '0.06em' }}>INCOMING CALL</div>
            <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="r-anim-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }} />
              <span className="r-anim-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', animationDelay: '0.6s' }} />
              <div style={{ position: 'relative', width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px -8px rgba(124,58,237,0.6)' }}>
                <span className="r-anim-shake" style={{ display: 'inline-flex' }}>
                  <Icon d={ICONS.phone} size={28} stroke={2.5} />
                </span>
              </div>
            </div>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Jenna Holcomb</div>
            <div style={{ fontFamily: RINGO.font.mono, fontSize: 13, opacity: 0.65 }}>+1 (415) 555-0136</div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 36, paddingTop: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(135deg)' }}>
                <Icon d={ICONS.phone} size={20} />
              </div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.45 }}>
                <Icon d={ICONS.phone} size={20} />
              </div>
            </div>
          </div>
        )}

        {step >= 1 && (
          <>
            <div style={{ padding: '34px 16px 10px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name="Pacific Plumbing" size={30} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Pacific Plumbing</div>
                <div style={{ fontSize: 10, color: RINGO.ink3 }}>active · 11s ago</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 99, background: 'linear-gradient(135deg,#ecfeff,#f5f3ff)', fontSize: 9.5, fontWeight: 700, color: '#7c3aed' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />  RIPE LEAD
              </div>
            </div>
            <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
              <div className="r-anim-bubble" style={{ alignSelf: 'center', padding: '3px 9px', borderRadius: 99, background: '#fee2e2', color: '#991b1b', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em' }}>
                ✕ MISSED CALL · just now
              </div>
              <div key={`b1-${step}`} className="r-anim-bubble" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '9px 12px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 11.5, lineHeight: 1.45, animationDelay: '0.15s' }}>
                Hi Jenna! This is Pacific Plumbing — sorry we missed you. What&rsquo;s going on?
              </div>

              {step >= 2 && (
                <>
                  <div key={`b2-${step}`} className="r-anim-bubble" style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: '9px 12px', borderRadius: '14px 14px 4px 14px', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 11.5, lineHeight: 1.45 }}>
                    kitchen sink leak. 2204 folsom #3 🙏
                  </div>
                  <div key={`b3-${step}`} className="r-anim-bubble" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '9px 12px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 11.5, lineHeight: 1.45, animationDelay: '0.4s' }}>
                    Got it — we can be there <strong>1–2 PM today</strong>, $95 trip applied to repair. ✓?
                  </div>
                  <div key={`b4-${step}`} className="r-anim-pop" style={{ alignSelf: 'center', marginTop: 4, padding: '6px 12px', borderRadius: 99, background: 'linear-gradient(135deg,#059669,#06b6d4)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', boxShadow: '0 8px 20px -8px rgba(5,150,105,0.6)', animationDelay: '0.75s' }}>
                    ✓ BOOKED · 1:00 PM · GOOGLE CALENDAR
                  </div>
                </>
              )}

              {step === 1 && (
                <div key={`typing-${step}`} className="r-anim-bubble" style={{ alignSelf: 'flex-end', padding: '8px 12px', borderRadius: '14px 14px 4px 14px', background: '#eef0f5', display: 'inline-flex', alignItems: 'center', animationDelay: '0.6s' }}>
                  <span className="r-dot" /><span className="r-dot" /><span className="r-dot" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HowItWorks() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 3), 3600);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { n: '01', g: RINGO.g1, ic: ICONS.phone, t: 'Customer rings — you can\'t pick up', d: 'A 30-second carrier code routes unanswered calls to Ripe Lead. Real calls still ring your phone first.' },
    { n: '02', g: RINGO.g3, ic: ICONS.ai,    t: 'Ripe Lead texts back in 11 seconds',     d: 'The model writes a friendly, on-brand reply — gathering address, issue, and urgency before the lead cools off.' },
    { n: '03', g: RINGO.g4, ic: ICONS.check, t: 'You wake up to a booked job',        d: 'Confirmed appointments land on your calendar; quotes and leads land in your inbox. Pick the cherries.' },
  ];

  return (
    <section className="r-land-section" style={{ paddingTop: 40, paddingBottom: 80, background: '#fff', borderTop: `1px solid ${RINGO.border}`, borderBottom: `1px solid ${RINGO.border}` }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>How Ripe Lead works</div>
        <h2 className="r-land-h2" style={{ fontFamily: RINGO.font.head, fontWeight: 700, letterSpacing: '-0.025em', margin: '10px 0 6px', color: RINGO.ink }}>Watch a missed call become a booked job.</h2>
        <div style={{ fontSize: 15, color: RINGO.ink3, maxWidth: 580, margin: '0 auto' }}>Three steps. Four-minute setup. No new phone, no new number.</div>
      </div>

      <div className="r-land-demo-grid" style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((s, i) => {
            const active = step === i;
            return (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="r-hover-lift"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: '22px 24px',
                  borderRadius: 16,
                  border: `1px solid ${active ? 'transparent' : RINGO.border}`,
                  background: active ? '#fff' : 'transparent',
                  boxShadow: active ? '0 22px 44px -24px rgba(15,21,53,0.28)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                  position: 'relative',
                  overflow: 'hidden',
                  fontFamily: 'inherit',
                  color: 'inherit',
                }}
              >
                {active && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: s.g }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: s.g, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 14px 28px -12px rgba(15,21,53,0.4)' : 'none', transition: 'all 0.3s ease', opacity: active ? 1 : 0.7 }}>
                    <Icon d={s.ic} size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: RINGO.font.mono, fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.06em' }}>STEP {s.n}</div>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 2 }}>{s.t}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: RINGO.ink3, marginTop: 10, paddingLeft: 60 }}>{s.d}</div>
              </button>
            );
          })}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ width: step === i ? 22 : 6, height: 6, borderRadius: 99, background: step === i ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : RINGO.border, transition: 'all 0.4s ease' }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
          <AnimatedPhone step={step} />
        </div>
      </div>
    </section>
  );
}

// ── Channels (every channel, one inbox) ────────────────────────────────────

const CHANNEL_LIST: { ch: ChannelKey; tag: string }[] = [
  { ch: 'sms',  tag: 'SMS & MMS · A2P 10DLC' },
  { ch: 'wa',   tag: 'WhatsApp Business API' },
  { ch: 'ig',   tag: 'Instagram DMs & comments' },
  { ch: 'fb',   tag: 'Facebook Messenger' },
  { ch: 'gbm',  tag: 'Google Business chat' },
];

const CHANNELS_PHONE_POOL: { ch: ChannelKey; name: string; msg: string; time: string; status?: 'replying' | 'booked' | 'waiting' }[] = [
  { ch: 'wa',   name: 'Sarah K.',        msg: 'Can you do tomorrow morning?',     time: '11:42', status: 'booked' },
  { ch: 'ig',   name: '@marcoplumb',     msg: 'Hey — do you do gas lines?',       time: '11:38', status: 'replying' },
  { ch: 'sms',  name: 'Jenna Holcomb',   msg: 'kitchen sink leak, 2204 folsom',   time: '11:31', status: 'booked' },
  { ch: 'fb',   name: 'Mike Brennan',    msg: 'Need a quote for water heater',    time: '11:18', status: 'replying' },
  { ch: 'wa',   name: 'Lina Park',       msg: 'water in basement again 😬',       time: '10:44', status: 'waiting' },
  { ch: 'gbm',  name: 'Aisha Patel',     msg: 'Saturday emergency call possible?', time: '10:12', status: 'booked' },
];

function ChannelsConvergence() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const leftRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const rightRef = React.useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ ch: ChannelKey; d: string }[]>([]);
  const [dims, setDims] = useState({ w: 1080, h: 460 });

  useEffect(() => {
    const compute = () => {
      const c = containerRef.current;
      const r = rightRef.current;
      if (!c || !r) return;
      const cb = c.getBoundingClientRect();
      setDims({ w: cb.width, h: cb.height });
      const rb = r.getBoundingClientRect();
      const endX = rb.left - cb.left + 8;             // inbox card left edge
      const endY = rb.top - cb.top + rb.height / 2;   // inbox card vertical center
      const newPaths = CHANNEL_LIST.map((cl, i) => {
        const lr = leftRefs.current[i];
        if (!lr) return null;
        const lb = lr.getBoundingClientRect();
        const startX = lb.right - cb.left - 8;
        const startY = lb.top - cb.top + lb.height / 2;
        const dx = endX - startX;
        const c1x = startX + dx * 0.55;
        const c2x = endX - dx * 0.45;
        return { ch: cl.ch, d: `M ${startX} ${startY} C ${c1x} ${startY}, ${c2x} ${endY}, ${endX} ${endY}` };
      }).filter(Boolean) as { ch: ChannelKey; d: string }[];
      setPaths(newPaths);
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', compute);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', padding: '8px 0' }}>
      {/* SVG curves layer — coordinates derived from real card positions */}
      <svg
        className="r-channels-svg"
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        aria-hidden
      >
        <defs>
          {(['sms','wa','ig','fb','gbm'] as ChannelKey[]).map(k => {
            const [c1, c2] = [
              k === 'sms' ? '#7c3aed' : k === 'wa' ? '#25d366' : k === 'ig' ? '#dd2a7b' : k === 'fb' ? '#1877f2' : '#4285f4',
              k === 'sms' ? '#06b6d4' : k === 'wa' ? '#128c7e' : k === 'ig' ? '#8134af' : k === 'fb' ? '#00b2ff' : '#34a853',
            ];
            return (
              <linearGradient key={k} id={`r-curve-${k}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={c1} stopOpacity="0.85" />
                <stop offset="1" stopColor={c2} stopOpacity="0.4" />
              </linearGradient>
            );
          })}
        </defs>
        {paths.map((p, i) => {
          const dashColor = p.ch === 'sms' ? '#06b6d4' : p.ch === 'wa' ? '#128c7e' : p.ch === 'ig' ? '#8134af' : p.ch === 'fb' ? '#00b2ff' : '#34a853';
          return (
            <g key={i}>
              <path d={p.d} stroke={`url(#r-curve-${p.ch})`} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d={p.d} stroke={dashColor} strokeWidth="3.2" strokeLinecap="round" fill="none" strokeDasharray="3 12" opacity="0.85">
                <animate attributeName="stroke-dashoffset" from="0" to="-150" dur={`${2.4 + i * 0.2}s`} repeatCount="indefinite" />
              </path>
            </g>
          );
        })}
      </svg>

      <div className="r-channels-grid" style={{ position: 'relative', zIndex: 1 }}>
        {/* Channel input cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {CHANNEL_LIST.map((c, i) => {
            const meta = CHANNEL_META[c.ch];
            return (
              <div key={c.ch} ref={el => { leftRefs.current[i] = el; }} className="r-hover-lift" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderRadius: 14,
                background: '#fff',
                border: `1px solid ${RINGO.border}`,
                boxShadow: '0 14px 28px -22px rgba(15,21,53,0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: meta.grad }} />
                <ChannelTile ch={c.ch} size={36} radius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: RINGO.ink }}>{meta.label}</div>
                  <div style={{ fontSize: 10, color: RINGO.ink3 }}>{c.tag}</div>
                </div>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.16)' }} />
              </div>
            );
          })}
        </div>

        {/* spacer for SVG */}
        <div />

        {/* Central inbox card */}
        <div ref={rightRef} style={{
          padding: 18,
          borderRadius: 22,
          background: 'linear-gradient(180deg,#fff,#fafbff)',
          border: `1px solid ${RINGO.border}`,
          boxShadow: '0 40px 80px -32px rgba(15,21,53,0.3), 0 0 0 8px rgba(124,58,237,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: RINGO.font.head, fontWeight: 800, fontSize: 13 }}>R</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>Ripe Lead Inbox</div>
              <div style={{ fontSize: 10, color: RINGO.ink3 }}>Today · 6 conversations</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, background: 'linear-gradient(135deg,#ecfdf5,#dbeafe)', fontSize: 9.5, fontWeight: 700, color: '#059669', letterSpacing: '0.06em' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669' }} />
              LIVE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CHANNELS_PHONE_POOL.map((c, i) => {
              const meta = CHANNEL_META[c.ch];
              const statusMap = {
                booked:   { bg: '#ecfdf5', col: '#059669', txt: 'BOOKED' },
                replying: { bg: '#f5f3ff', col: '#7c3aed', txt: 'REPLYING' },
                waiting:  { bg: '#fef3c7', col: '#92400e', txt: 'WAITING' },
              } as const;
              const s = statusMap[c.status ?? 'waiting'];
              return (
                <div key={i} className="r-hover-inbox-row" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px 8px 12px',
                  borderRadius: 10,
                  background: '#fff',
                  border: `1px solid ${RINGO.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: meta.grad }} />
                  <div style={{ position: 'relative', flex: '0 0 auto' }}>
                    <Avatar name={c.name.replace(/^@/, '')} size={28} />
                    <span style={{ position: 'absolute', right: -2, bottom: -2, width: 13, height: 13, borderRadius: '50%', background: meta.grad, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>
                      <ChannelGlyph ch={c.ch} size={7} />
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: RINGO.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: RINGO.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.msg}</div>
                  </div>
                  <span style={{ padding: '2px 6px', borderRadius: 6, background: s.bg, color: s.col, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.06em', flex: '0 0 auto' }}>{s.txt}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${RINGO.border}` }}>
            {[
              { label: 'Replied', value: '6/6' },
              { label: 'Booked',  value: '3' },
              { label: 'Avg',     value: '9s' },
            ].map(s => (
              <div key={s.label} style={{ padding: '6px 8px', borderRadius: 8, background: '#f6f7fb' }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 800, color: RINGO.ink, letterSpacing: '-0.02em' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pill strip below */}
      <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {(['sms', 'wa', 'ig', 'fb', 'msgr', 'gbm', 'call', 'vm'] as ChannelKey[]).map(ch => (
          <span key={ch} className="r-ch-pill">
            <span className="r-ch-pill-dot" style={{ background: CHANNEL_META[ch].grad, boxShadow: `0 6px 14px -8px ${CHANNEL_META[ch].ring}` }}>
              <ChannelGlyph ch={ch} size={13} />
            </span>
            {CHANNEL_META[ch].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Channels() {
  return (
    <section className="r-land-section" style={{ paddingTop: 72, paddingBottom: 96, background: 'linear-gradient(180deg,#fff,#f6f7fb)', borderTop: `1px solid ${RINGO.border}`, borderBottom: `1px solid ${RINGO.border}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '50%', top: -100, width: 600, height: 400, transform: 'translateX(-50%)', borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.10),transparent)', filter: 'blur(20px)' }} />
      <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>One inbox</div>
        <h2 className="r-land-h2" style={{ fontFamily: RINGO.font.head, fontWeight: 700, letterSpacing: '-0.025em', margin: '10px 0 8px', color: RINGO.ink }}>
          Every channel.{' '}
          <span style={{ backgroundImage: 'linear-gradient(120deg,#7c3aed,#06b6d4 45%,#059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            One Ripe Lead.
          </span>
        </h2>
        <div style={{ fontSize: 15, color: RINGO.ink3, maxWidth: 580, margin: '0 auto', lineHeight: 1.55 }}>
          SMS, WhatsApp, Instagram DMs, Facebook Messenger, Google Business chat — every customer message lands in one place and gets a reply in 11 seconds.
        </div>
      </div>

      <ChannelsConvergence />
    </section>
  );
}

// ── Feature row (upgraded with mini mockups) ──────────────────────────────

function FeatureCardSpeaks() {
  return (
    <div style={{ position: 'relative', padding: 14, height: 168, background: 'linear-gradient(180deg,#f5f3ff,#eef0ff)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(124,58,237,0.06) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '78%', padding: '7px 11px', borderRadius: '12px 12px 12px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 10.5, color: RINGO.ink2 }}>
          got a leak under sink, can u come today
        </div>
        <div className="r-anim-bubble" style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: '8px 12px', borderRadius: '12px 12px 4px 12px', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 10.5, lineHeight: 1.4, fontWeight: 500 }}>
          Yep! Shut your angle stops first. We can be there 1–2 PM, $95 trip applied to repair. ✓?
        </div>
        <div className="r-anim-bubble" style={{ alignSelf: 'flex-start', padding: '6px 10px', borderRadius: '12px 12px 12px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, display: 'inline-flex', alignItems: 'center', animationDelay: '0.3s' }}>
          <span className="r-dot" /><span className="r-dot" /><span className="r-dot" />
        </div>
      </div>
    </div>
  );
}

function FeatureCardTCPA() {
  return (
    <div style={{ position: 'relative', padding: 14, height: 168, background: 'linear-gradient(180deg,#ecfdf5,#e0f2fe)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div className="r-anim-pulse-soft" style={{ width: 64, height: 78, position: 'relative' }}>
        <svg viewBox="0 0 64 78" width="64" height="78">
          <defs>
            <linearGradient id="shGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#10b981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path d="M32 2 L60 12 V40 C60 58 32 74 32 74 C32 74 4 58 4 40 V12 Z" fill="url(#shGrad)" />
          <path d="M20 38 L29 47 L46 28" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['A2P 10DLC', 'Opt-out', 'Quiet hours'].map(t => (
          <span key={t} style={{ padding: '4px 8px', borderRadius: 99, background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 9.5, fontWeight: 700, color: RINGO.ink2 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function FeatureCardSpam() {
  return (
    <div style={{ position: 'relative', padding: 14, height: 168, background: 'linear-gradient(180deg,#fff1f2,#ffedd5)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderRadius: 10, border: `1px solid ${RINGO.border}`, opacity: 0.55 }}>
        <span style={{ position: 'relative', width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#fb923c,#fbbf24)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <ChannelGlyph ch="call" size={14} />
          <span style={{ position: 'absolute', inset: -2, borderRadius: 10, border: '2px solid #e11d48' }} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink, textDecoration: 'line-through' }}>Auto Warranty Co.</div>
          <div style={{ fontSize: 9.5, color: RINGO.ink3 }}>+1 (555) 010-…</div>
        </div>
        <span style={{ padding: '3px 7px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 9, fontWeight: 800, letterSpacing: '0.04em' }}>BLOCKED</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderRadius: 10, border: `1px solid ${RINGO.border}` }}>
        <ChannelTile ch="call" size={30} radius={8} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink }}>Jenna Holcomb</div>
          <div style={{ fontSize: 9.5, color: RINGO.ink3 }}>real customer · drain repair</div>
        </div>
        <span style={{ padding: '3px 7px', borderRadius: 6, background: '#ecfdf5', color: '#059669', fontSize: 9, fontWeight: 800, letterSpacing: '0.04em' }}>REPLIED</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 'auto', paddingTop: 4 }}>
        <span style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 800, color: RINGO.ink, letterSpacing: '-0.02em' }}>142</span>
        <span style={{ fontSize: 11, color: RINGO.ink3 }}>spam calls blocked this month</span>
      </div>
    </div>
  );
}

function FeatureCardTools() {
  const tools = [
    { name: 'Google Cal',  g: 'linear-gradient(135deg,#4285f4,#34a853)', glyph: 'GC' },
    { name: 'Jobber',      g: 'linear-gradient(135deg,#22d3a8,#0ea5e9)', glyph: 'JB' },
    { name: 'Slack',       g: 'linear-gradient(135deg,#e01e5a,#ecb22e)', glyph: 'SL' },
    { name: 'Zapier',      g: 'linear-gradient(135deg,#ff4a00,#ff9b00)', glyph: 'ZP' },
  ];
  return (
    <div style={{ position: 'relative', padding: 14, height: 168, background: 'linear-gradient(180deg,#fff7ed,#fef3c7)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(217,119,6,0.06) 1px,transparent 1px), linear-gradient(90deg,rgba(217,119,6,0.06) 1px,transparent 1px)', backgroundSize: '14px 14px' }} />
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, height: '100%' }}>
        {tools.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#fff', borderRadius: 10, border: `1px solid ${RINGO.border}` }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: t.g, color: '#fff', fontFamily: RINGO.font.mono, fontWeight: 800, fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.02em' }}>{t.glyph}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink }}>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureRow() {
  const features = [
    { card: <FeatureCardSpeaks />, t: 'Speaks like you',        d: 'A model fine-tuned on your trade. No "as an AI" — just a plumber, electrician, or stylist who answers fast.' },
    { card: <FeatureCardTCPA />,   t: 'TCPA-clean by default',  d: 'A2P 10DLC registration, opt-out handling, and quiet hours — all built in. No fines, no headaches.' },
    { card: <FeatureCardSpam />,   t: 'Spam & robocall guard',  d: 'Ripe Lead silently ignores known spam numbers so your inbox stays full of real customers, not warranty calls.' },
    { card: <FeatureCardTools />,  t: 'Works with your tools',  d: 'Drops bookings into Google Calendar and Jobber, fires Slack alerts, and Zapiers everywhere else.' },
  ];
  return (
    <section className="r-land-section r-land-cols-4" style={{ paddingTop: 80, paddingBottom: 80, maxWidth: 1320, margin: '0 auto' }}>
      {features.map((f, i) => (
        <div key={i} className="r-hover-lift" style={{ padding: 14, borderRadius: 18, background: '#fff', border: `1px solid ${RINGO.border}`, boxShadow: '0 18px 36px -28px rgba(15,21,53,0.2)' }}>
          {f.card}
          <div style={{ fontFamily: RINGO.font.head, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: '14px 4px 6px' }}>{f.t}</div>
          <div style={{ fontSize: 13, color: RINGO.ink3, lineHeight: 1.55, margin: '0 4px' }}>{f.d}</div>
        </div>
      ))}
    </section>
  );
}

// ── Live demo ──────────────────────────────────────────────────────────────

function LiveDemo() {
  const bullets = [
    'Detects emergency keywords like "leak", "no power", "burst"',
    'Pulls service area from ZIP — politely declines out-of-area calls',
    'Confirms appointments and adds them to your calendar',
    'Re-engages no-shows 48h later with a one-touch reschedule link',
  ];
  return (
    <section className="r-land-section" style={{ paddingTop: 40, paddingBottom: 80, background: '#fff', borderTop: `1px solid ${RINGO.border}`, borderBottom: `1px solid ${RINGO.border}` }}>
      <div className="r-land-demo-grid" style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Built for the trades</div>
          <h2 className="r-land-h2" style={{ fontFamily: RINGO.font.head, fontWeight: 700, letterSpacing: '-0.025em', margin: '10px 0 14px', color: RINGO.ink }}>
            Replies that sound like you wrote them at 11:43 AM between jobs.
          </h2>
          <div style={{ fontSize: 15, color: RINGO.ink3, lineHeight: 1.6, marginBottom: 20 }}>
            Templates are tuned per trade — emergency keywords, trip-charge handling, calendar holds, parts-ordering disclaimers. Drop in your prices and tone once; Ripe Lead speaks fluent plumber from then on.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: RINGO.ink2 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#06b6d4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: 1 }}>
                  <Icon d={ICONS.check} size={11} stroke={3} />
                </span>
                {b}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 18, borderRadius: 18, background: '#f6f7fb', border: `1px solid ${RINGO.border}`, boxShadow: '0 30px 60px -28px rgba(15,21,53,0.2)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['Plumbing', 'Electrical', 'HVAC', 'Salon'].map((t, i) => (
              <button key={t} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: i === 0 ? 'none' : `1px solid ${RINGO.border}`, background: i === 0 ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#fff', color: i === 0 ? '#fff' : RINGO.ink2, cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ alignSelf: 'center', padding: '3px 10px', borderRadius: 99, background: '#eef0f5', fontSize: 11, color: RINGO.ink3, fontWeight: 600 }}>11:42 AM · missed call from +1 (415) 555-0117</div>
            <div style={{ alignSelf: 'flex-start', maxWidth: '78%', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 13.5 }}>
              Hi Jenna! This is Pacific Plumbing 👋 sorry we missed you — Marco&rsquo;s on a job. What&rsquo;s going on, &amp; what&rsquo;s the address?
            </div>
            <div style={{ alignSelf: 'flex-end', maxWidth: '78%', padding: '10px 14px', borderRadius: '14px 14px 4px 14px', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 13.5 }}>
              sink leaking under cabinet. 2204 folsom #3
            </div>
            <div style={{ alignSelf: 'flex-start', maxWidth: '78%', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: `1px solid ${RINGO.border}`, fontSize: 13.5 }}>
              Got it. Shut the angle stops below the basin first. We can be there <strong>1–2 PM today</strong> — $95 trip applied to repair. ✓?
            </div>
            <div style={{ alignSelf: 'flex-end', maxWidth: '78%', padding: '10px 14px', borderRadius: '14px 14px 4px 14px', background: 'linear-gradient(135deg,#059669,#06b6d4)', color: '#fff', fontSize: 13.5 }}>
              yes!! 🙏
            </div>
            <div style={{ alignSelf: 'center', padding: '4px 10px', borderRadius: 99, background: 'linear-gradient(135deg,#e7f7ee,#e0f2fe)', color: '#075c3f', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
              ✓ BOOKED · 1:00 PM · added to Google Calendar
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    { name: 'Solo', price: '29', g: null, tag: 'For one-truck operators', cta: 'Inquiry Now', popular: false,
      fs: ['1 number', '100 AI replies / mo', 'Google Calendar sync', 'Spam guard', 'SMS & voicemail'] },
    { name: 'Crew', price: '79', g: 'radial-gradient(120% 100% at 0% 0%, #1f1f3a 0%, #06081a 100%)', tag: 'Most owners pick this', cta: 'Inquiry Now', popular: true,
      fs: ['3 numbers + after-hours line', 'Unlimited AI replies', 'Jobber, Slack & Zapier', 'Lead scoring + AI brief', 'Team inbox · 5 seats'] },
    { name: 'Shop', price: '149', g: null, tag: 'For multi-location teams', cta: 'Talk to sales', popular: false,
      fs: ['Unlimited numbers', 'Multi-location routing', 'Custom voice training', 'SOC 2 + DPA', 'Priority human support'] },
  ];
  return (
    <section className="r-land-section" style={{ paddingTop: 80, paddingBottom: 80, background: RINGO.bg, textAlign: 'center' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Pricing</div>
      <h2 className="r-land-h2" style={{ fontFamily: RINGO.font.head, fontWeight: 700, letterSpacing: '-0.025em', margin: '10px 0 32px' }}>Pay for jobs saved. Not seats.</h2>
      <div className="r-land-cols-3" style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'left' }}>
        {plans.map((p, i) => (
          <div key={i} className="r-hover-lift" style={{ padding: '28px 26px', borderRadius: 20, background: p.popular ? p.g! : '#fff', color: p.popular ? '#fff' : RINGO.ink, border: p.popular ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${RINGO.border}`, position: 'relative', overflow: 'hidden', boxShadow: p.popular ? '0 30px 60px -20px rgba(124,58,237,0.4)' : 'none' }}>
            {p.popular && (
              <>
                <div style={{ position: 'absolute', right: -80, top: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.5),transparent)', filter: 'blur(8px)' }} />
                <div style={{ position: 'absolute', right: 18, top: 18, padding: '4px 10px', borderRadius: 99, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Most popular</div>
              </>
            )}
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: p.popular ? 'rgba(255,255,255,0.65)' : RINGO.ink3, marginTop: 2 }}>{p.tag}</div>
              <div style={{ margin: '18px 0 14px', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: RINGO.font.head, fontSize: 48, fontWeight: 800, letterSpacing: '-0.025em' }}>${p.price}</span>
                <span style={{ fontSize: 14, color: p.popular ? 'rgba(255,255,255,0.6)' : RINGO.ink3 }}>/ mo, billed monthly</span>
              </div>
              <button onClick={openInquiry} style={{ width: '100%', padding: '12px 16px', borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: 600, marginBottom: 18, background: p.popular ? '#fff' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: p.popular ? RINGO.ink : '#fff' }}>{p.cta}</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {p.fs.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: p.popular ? 'rgba(255,255,255,0.85)' : RINGO.ink2 }}>
                    <Icon d={ICONS.check} size={14} stroke={3} /><span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: 13, color: RINGO.ink3 }}>All plans include carrier &amp; A2P fees. Cancel anytime.</div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    { q: "Booked $4,200 in jobs my first weekend on Ripe Lead. Clients have no clue it's automated — they just think I'm fast.", n: 'Marco Reyes',   r: 'Pacific Plumbing · SF',          g: RINGO.g1 },
    { q: "I run my salon alone between cuts. Ripe Lead replies while I have scissors in my hand. Easily 15 saved bookings a month.", n: 'Lina Park',    r: 'Salon Lume · Austin',            g: RINGO.g2 },
    { q: "The TCPA stuff used to terrify me. Ripe Lead set up our 10DLC in a day and I haven't thought about it since.", n: 'Dre Whitfield', r: 'Brightspark Electric · Denver',  g: RINGO.g3 },
    { q: "Used to lose 4–5 leads a week to voicemail. Now my mornings start with a list of booked jobs, not missed calls.",       n: 'Aisha Patel',   r: 'Patel HVAC · Phoenix',           g: RINGO.g4 },
    { q: "The replies sound exactly like me. Customers reply back thinking they're texting my cell — and I never have to lift a finger.", n: 'Tony Vega',     r: 'Vega Roofing · San Diego',       g: RINGO.g1 },
    { q: "Setup took less than coffee. By lunch Ripe Lead had already booked an emergency call I would've missed in surgery.",        n: 'Dr. Mei Tanaka', r: 'Tanaka Dental · Seattle',        g: RINGO.g2 },
  ];
  // Duplicate so the marquee loops seamlessly with -50% translate
  const items = [...testimonials, ...testimonials];
  return (
    <section className="r-land-section" style={{ paddingTop: 72, paddingBottom: 72, background: '#fff', borderTop: `1px solid ${RINGO.border}` }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Customers</div>
        <h2 className="r-land-h2" style={{ fontFamily: RINGO.font.head, fontWeight: 700, letterSpacing: '-0.025em', margin: '10px 0 6px', color: RINGO.ink }}>Loved by the builders of America.</h2>
        <div style={{ fontSize: 15, color: RINGO.ink3, maxWidth: 560, margin: '0 auto' }}>Real shops, real revenue saved — from solo plumbers to multi-truck fleets.</div>
      </div>
      <div className="r-marquee" style={{ width: '100%' }}>
        <div className="r-marquee-track r-testimonial-track">
          {items.map((t, i) => (
            <div key={i} className="r-testimonial-card" style={{ padding: '24px', borderRadius: 18, border: `1px solid ${RINGO.border}`, background: '#fff', boxShadow: '0 14px 30px -22px rgba(15,21,53,0.18)' }}>
              <div style={{ width: 32, height: 6, borderRadius: 3, background: t.g, marginBottom: 14 }} />
              <div style={{ fontSize: 15, lineHeight: 1.55, color: RINGO.ink, fontFamily: RINGO.font.head, fontWeight: 500, letterSpacing: '-0.005em' }}>&ldquo;{t.q}&rdquo;</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${RINGO.border}` }}>
                <Avatar name={t.n} size={36} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.n}</div>
                  <div style={{ fontSize: 11.5, color: RINGO.ink3 }}>{t.r}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 1, color: '#fbbf24' }}>
                  {[1, 2, 3, 4, 5].map(s => <Icon key={s} d={ICONS.star} size={12} fill="#fbbf24" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="r-land-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px)', borderRadius: 30, background: 'radial-gradient(120% 100% at 0% 0%, #2a1659 0%, #0f3460 60%, #06081a 100%)', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 40px 80px -36px rgba(15,21,53,0.45)' }}>
        <div style={{ position: 'absolute', right: -120, top: -140, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.55),transparent)', filter: 'blur(22px)' }} />
        <div style={{ position: 'absolute', left: -120, bottom: -180, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(6,182,212,0.45),transparent)', filter: 'blur(22px)' }} />
        <div className="r-land-cta-grid" style={{ position: 'relative', gap: 44 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.25)' }} />
              Live in the same day
            </div>
            <h2 className="r-land-cta-h2" style={{ fontFamily: RINGO.font.head, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.04, margin: '0 0 16px' }}>Stop bleeding jobs to voicemail.</h2>
            <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', maxWidth: 500, lineHeight: 1.55 }}>Set up takes 4 minutes. The first job Ripe Lead saves usually pays for the year.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={openInquiry} style={{ padding: '18px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#fff', color: RINGO.ink, fontFamily: RINGO.font.ui, fontSize: 15.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 16px 32px -12px rgba(0,0,0,0.35)' }}>
              Inquiry Now <Icon d={ICONS.arrow} size={16} />
            </button>
            <button onClick={openInquiry} style={{ padding: '18px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 15.5, fontWeight: 600, cursor: 'pointer' }}>
              Book a demo
            </button>
            <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.65)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Keep your number', 'Live in 4 min', 'Cancel anytime'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon d={ICONS.check} size={13} stroke={3} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  const cols: [string, string[]][] = [
    ['Product',   ['Features', 'Pricing', 'Integrations', 'Changelog', 'Status']],
    ['Trades',    ['Plumbing', 'Electrical', 'HVAC', 'Salons', 'Cleaning']],
    ['Company',   ['About', 'Customers', 'Careers', 'Contact', 'Press']],
    ['Resources', ['Docs', 'API', 'Compliance', 'Playbook', 'Help center']],
  ];
  return (
    <footer className="r-land-pad" style={{ paddingTop: 48, paddingBottom: 32, background: '#0f1535', color: 'rgba(255,255,255,0.7)', fontFamily: RINGO.font.ui }}>
      <div className="r-land-footer-grid" style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div>
          <RingoLogo size={26} light />
          <div style={{ fontSize: 13, marginTop: 14, lineHeight: 1.55, maxWidth: 280 }}>Missed-call autoresponder for plumbers, electricians, salons, and the rest of the builders of America.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, fontSize: 11 }}>
            <Pill tone="neutral" dot={false}>SOC 2 Type II</Pill>
            <Pill tone="neutral" dot={false}>TCPA · A2P 10DLC</Pill>
          </div>
        </div>
        {cols.map(([h, xs]) => (
          <div key={h}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>{h}</div>
            {xs.map(x => <a key={x} href="#" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '5px 0' }}>{x}</a>)}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1320, margin: '40px auto 0', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', fontSize: 12 }}>
        <div>© 2026 Ripe Lead, Inc. · 548 Market St, San Francisco</div>
        <div style={{ display: 'flex', gap: 18 }}>
          {['Privacy', 'Terms', 'DPA'].map(l => <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>)}
        </div>
      </div>
    </footer>
  );
}

// ── Landing page ───────────────────────────────────────────────────────────

export default function Landing() {
  // Always start at top on mount (browser scroll restoration off)
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="r-land-root" style={{ background: '#fff', color: RINGO.ink, fontFamily: RINGO.font.ui, overflowX: 'hidden' }}>
      <SiteNav transparent={true} />
      <Hero />
      <LazyMount><LogoStrip /></LazyMount>
      <LazyMount><StatsCounter /></LazyMount>
      <div id="how-it-works"><LazyMount><HowItWorks /></LazyMount></div>
      <div id="channels"><LazyMount><Channels /></LazyMount></div>
      <div id="features"><LazyMount><FeatureRow /></LazyMount></div>
      <LazyMount><LiveDemo /></LazyMount>
      <div id="pricing"><LazyMount><Pricing /></LazyMount></div>
      <div id="customers"><LazyMount><Testimonials /></LazyMount></div>
      <LazyMount><FinalCTA /></LazyMount>
      <SiteFooter />
    </div>
  );
}

'use client';

import React from 'react';
import { Shield, Lock, Zap, ArrowRight } from 'lucide-react';
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

// ── Timeline item ──────────────────────────────────────────────────────────

interface TimelineItemProps {
  year: string;
  heading: string;
  description: string;
  isLast?: boolean;
  delay?: number;
}

function TimelineItem({ year, heading, description, isLast = false, delay = 0 }: TimelineItemProps) {
  const fade = useFadeUp(delay);
  return (
    <div ref={fade.ref} style={{ ...fade.style, display: 'flex', gap: 28, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          padding: '6px 14px',
          borderRadius: 99,
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          color: '#fff',
          fontFamily: RINGO.font.head,
          fontWeight: 800,
          fontSize: 14,
          flexShrink: 0,
          boxShadow: '0 8px 24px -8px rgba(124,58,237,0.45)',
          whiteSpace: 'nowrap',
        }}>{year}</div>
        {!isLast && (
          <div style={{ width: 1, flex: 1, background: 'rgba(124,58,237,0.2)', minHeight: 48, marginTop: 12 }} />
        )}
      </div>
      <div style={{ paddingTop: 4, paddingBottom: isLast ? 0 : 52 }}>
        <h3 style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: RINGO.ink, margin: '0 0 10px' }}>{heading}</h3>
        <p style={{ fontSize: 16, color: RINGO.ink3, lineHeight: 1.65, margin: 0 }}>{description}</p>
      </div>
    </div>
  );
}

// ── Value card ─────────────────────────────────────────────────────────────

interface ValueCardProps {
  icon: React.ReactNode;
  grad: string;
  title: string;
  description: string;
}

function ValueCard({ icon, grad, title, description }: ValueCardProps) {
  return (
    <div style={{
      padding: '32px 28px',
      borderRadius: 20,
      background: '#fff',
      border: `1px solid ${RINGO.border}`,
      boxShadow: '0 8px 32px -20px rgba(15,21,53,0.15)',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 18, boxShadow: '0 10px 24px -8px rgba(0,0,0,0.18)' }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 800, letterSpacing: '-0.015em', color: RINGO.ink, margin: '0 0 12px' }}>{title}</h3>
      <p style={{ fontSize: 14.5, color: RINGO.ink3, lineHeight: 1.65, margin: 0 }}>{description}</p>
    </div>
  );
}

// ── Team card ──────────────────────────────────────────────────────────────

interface TeamCardProps {
  initials: string;
  name: string;
  role: string;
  bio: string;
  grad: string;
}

function TeamCard({ initials, name, role, bio, grad }: TeamCardProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '32px 22px',
      borderRadius: 20,
      background: '#fff',
      border: `1px solid ${RINGO.border}`,
      boxShadow: '0 8px 32px -20px rgba(15,21,53,0.15)',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: grad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: RINGO.font.head, fontWeight: 800, fontSize: 24,
        marginBottom: 18, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.25)',
      }}>{initials}</div>
      <div style={{ fontFamily: RINGO.font.head, fontSize: 17, fontWeight: 800, color: RINGO.ink, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{role}</div>
      <p style={{ fontSize: 13.5, color: RINGO.ink3, lineHeight: 1.65, margin: 0 }}>{bio}</p>
    </div>
  );
}

// ── About page ─────────────────────────────────────────────────────────────

export default function AboutPage() {
  const heroFade = useFadeUp(0);
  const missionLeft = useFadeUp(0);
  const missionRight = useFadeUp(150);

  return (
    <div style={{ background: '#fff', color: RINGO.ink, fontFamily: RINGO.font.ui, overflowX: 'hidden' }}>
      <SiteNav transparent />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: '#0d0e1c',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(120px, 14vw, 180px) clamp(16px, 4vw, 48px) clamp(80px, 8vw, 120px)',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div aria-hidden style={{ position: 'absolute', left: '25%', top: '-5%', width: 600, height: 600, background: 'radial-gradient(closest-side,rgba(124,58,237,0.2),transparent)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', right: '20%', bottom: '-10%', width: 400, height: 400, background: 'radial-gradient(closest-side,rgba(6,182,212,0.12),transparent)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div ref={heroFade.ref} style={{ ...heroFade.style, position: 'relative', maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 99, background: 'transparent', border: '1px solid rgba(124,58,237,0.5)', fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 36 }}>
            OUR STORY
          </div>
          <h1 style={{
            fontFamily: RINGO.font.head,
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: '#fff',
            margin: '0 0 28px',
          }}>
            We believe every missed call is a missed opportunity.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 auto 56px', maxWidth: 600 }}>
            Ripe Lead was built by a team who watched great contractors lose jobs simply because they couldn't answer the phone fast enough.
          </p>

          {/* Inline stats row */}
          <div className="r-mk-hero-stats">
            {[
              { value: '2.4M+', label: 'Calls answered' },
              { value: '180K+', label: 'Jobs booked' },
              { value: '2023', label: 'Founded' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px, 8vw, 108px) clamp(16px, 4vw, 48px)', background: '#fff' }}>
        <div className="r-mk-mission-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div ref={missionLeft.ref} style={missionLeft.style}>
            <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>OUR MISSION</div>
            <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, color: RINGO.ink, margin: '0 0 24px' }}>
              Make every contractor unreachable — in a good way.
            </h2>
            <p style={{ fontSize: 16, color: RINGO.ink3, lineHeight: 1.7, margin: '0 0 16px' }}>
              The best contractors we know aren't glued to their phones — they're on the job, doing the work that earns their reputation. But the moment they miss a call, they risk losing that lead to someone who picked up.
            </p>
            <p style={{ fontSize: 16, color: RINGO.ink3, lineHeight: 1.7, margin: '0 0 16px' }}>
              Ripe Lead gives every contractor the response time of a 24/7 call center without the overhead. We handle the reply, the qualification, the booking — so the contractor handles the job.
            </p>
            <p style={{ fontSize: 16, color: RINGO.ink3, lineHeight: 1.7, margin: 0 }}>
              We measure success one way: jobs booked that would otherwise have been lost to voicemail.
            </p>
          </div>
          <div ref={missionRight.ref} style={missionRight.style}>
            <div className="r-mk-mission-stats" style={{ padding: 'clamp(28px, 4vw, 40px)', borderRadius: 24, background: 'linear-gradient(160deg,#1a1040 0%,#0d1c3a 60%,#061224 100%)', color: '#fff', boxShadow: '0 40px 80px -24px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { value: '4 min', label: 'Setup time' },
                { value: '$0', label: 'Upfront cost' },
                { value: '100%', label: 'Automated' },
              ].map((s, i) => (
                <div key={s.label}>
                  {i > 0 && <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', margin: '24px 0' }} />}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px, 8vw, 108px) clamp(16px, 4vw, 48px)', background: '#f6f7fb', borderTop: `1px solid ${RINGO.border}`, borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>History</div>
            <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-0.03em', color: RINGO.ink, margin: 0 }}>How we got here</h2>
          </div>
          <TimelineItem
            year="2023"
            heading="The problem nobody was solving"
            description="Founded after watching a friend's plumbing business lose $80K in missed leads over a single year. The calls came in — the phone just couldn't be answered in time."
            delay={0}
          />
          <TimelineItem
            year="2024"
            heading="Compliance before scale"
            description="Launched our TCPA-compliant A2P 10DLC system. Became one of the first AI messaging platforms purpose-built for the trades with full regulatory compliance baked in from day one."
            delay={100}
          />
          <TimelineItem
            year="2025"
            heading="Two million calls later"
            description="Crossed 2 million calls handled and 180,000+ jobs booked for contractors across the US. Expanded to WhatsApp, Instagram DMs, Facebook Messenger, and Google Business."
            isLast
            delay={200}
          />
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px, 8vw, 108px) clamp(16px, 4vw, 48px)', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Principles</div>
            <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-0.03em', color: RINGO.ink, margin: 0 }}>What we stand for</h2>
          </div>
          <div className="r-mk-grid-3">
            <ValueCard
              icon={<Shield size={24} />}
              grad="linear-gradient(135deg,#7c3aed,#a78bfa)"
              title="Contractors first"
              description="Built for the trades, not for enterprise. Every feature is designed around the reality of a one-truck operator or a small crew — not a Fortune 500 IT department."
            />
            <ValueCard
              icon={<Lock size={24} />}
              grad="linear-gradient(135deg,#059669,#06b6d4)"
              title="Compliance built in"
              description="TCPA, A2P 10DLC registration, opt-out handling, quiet hours — all handled before you send your first message. We keep you legal so you can focus on the work."
            />
            <ValueCard
              icon={<Zap size={24} />}
              grad="linear-gradient(135deg,#06b6d4,#4285f4)"
              title="Radically simple"
              description="4-minute setup, no IT required. If you can send a text message, you can run Ripe Lead. We built the complexity so you never have to think about it."
            />
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px, 8vw, 108px) clamp(16px, 4vw, 48px)', background: '#f6f7fb', borderTop: `1px solid ${RINGO.border}`, borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>The people behind it</div>
            <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-0.03em', color: RINGO.ink, margin: 0 }}>The team</h2>
          </div>
          <div className="r-mk-grid-4">
            <TeamCard
              initials="AR"
              name="Alex Rivera"
              role="CEO"
              bio="Former contractor-software founder. Watched too many great tradespeople lose jobs to voicemail. Built Ripe Lead to fix it."
              grad="linear-gradient(135deg,#7c3aed,#06b6d4)"
            />
            <TeamCard
              initials="PS"
              name="Priya Sharma"
              role="CTO"
              bio="Led infrastructure at two YC-backed companies. Obsessed with latency — which is why Ripe Lead replies in 11 seconds, not 11 minutes."
              grad="linear-gradient(135deg,#059669,#06b6d4)"
            />
            <TeamCard
              initials="MC"
              name="Marcus Chen"
              role="Head of AI"
              bio="Fine-tuned language models at a top AI lab. Responsible for making the AI sound like a plumber, not a press release."
              grad="linear-gradient(135deg,#0284c7,#a78bfa)"
            />
            <TeamCard
              initials="JO"
              name="Jamie Okafor"
              role="Head of Growth"
              bio="Helped 3 SaaS companies cross $10M ARR. Believes the best growth strategy is a product that actually works."
              grad="linear-gradient(135deg,#d97706,#e11d48)"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px, 8vw, 108px) clamp(16px, 4vw, 48px)', background: 'radial-gradient(120% 100% at 0% 0%,#2a1659 0%,#0f3460 60%,#06081a 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', left: '50%', top: -80, width: 600, height: 400, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at center,rgba(124,58,237,0.3) 0%,transparent 65%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 18px', lineHeight: 1.08 }}>
            Join 10,000+ contractors who never miss a lead
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', margin: '0 0 36px', lineHeight: 1.6 }}>
            4-minute setup. Live the same day. Cancel anytime.
          </p>
          <button onClick={openInquiry} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 40px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: RINGO.font.ui, boxShadow: '0 24px 56px -12px rgba(124,58,237,0.65)' }}>
            Inquiry Now <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

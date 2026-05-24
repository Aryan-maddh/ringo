'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, ArrowRight } from 'lucide-react';
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

// ── Feature table row (component so hooks can be called at top level) ─────

interface TableRowData { label: string; starter: boolean | string; pro: boolean | string; agency: boolean | string; }

function FeatureTableRow({ row, index, total }: { row: TableRowData; index: number; total: number }) {
  const fade = useFadeUp(index * 40);
  return (
    <div
      ref={fade.ref}
      className="r-mk-pricing-table-row"
      style={{
        ...fade.style,
        background: index % 2 === 0 ? '#fff' : '#fafbff',
        borderBottom: index < total - 1 ? `1px solid ${RINGO.border}` : 'none',
      }}
    >
      <div style={{ padding: '16px 22px', fontSize: 14, color: RINGO.ink2, fontWeight: 500 }}>{row.label}</div>
      <div data-plan="Starter" style={{ padding: '16px 22px' }}><TableCell val={row.starter} /></div>
      <div data-plan="Pro" style={{ padding: '16px 22px' }}><TableCell val={row.pro} /></div>
      <div data-plan="Agency" style={{ padding: '16px 22px' }}><TableCell val={row.agency} /></div>
    </div>
  );
}

// ── Feature table data ─────────────────────────────────────────────────────

const FEATURES_TABLE = [
  { label: 'Phone numbers',         starter: '1 number',    pro: '3 numbers',    agency: '10 numbers' },
  { label: 'AI replies',            starter: '500 / month', pro: 'Unlimited',    agency: 'Unlimited' },
  { label: 'SMS',                   starter: true,          pro: true,           agency: true },
  { label: 'WhatsApp & Instagram',  starter: false,         pro: true,           agency: true },
  { label: 'Google Calendar sync',  starter: false,         pro: true,           agency: true },
  { label: 'White-label branding',  starter: false,         pro: false,          agency: true },
  { label: 'API access',            starter: false,         pro: false,          agency: true },
  { label: 'Dedicated onboarding',  starter: false,         pro: false,          agency: true },
];

const FAQS = [
  { q: 'How do I get started?', a: 'Submit an inquiry through the form on this site and our team will reach out within 24 hours. We\'ll walk you through setup, port your number if needed, and have you live the same day.' },
  { q: 'Can I change plans?', a: 'Absolutely. You can upgrade or downgrade at any time from your account settings. When you upgrade, you\'re charged the prorated difference immediately. When you downgrade, the change takes effect at the start of your next billing cycle.' },
  { q: 'What counts as a reply?', a: 'Each automated message sent to a customer counts as one reply. If Ripe Lead sends two messages in a single conversation (an initial reply and a follow-up), that counts as two replies. Inbound messages from customers do not count.' },
  { q: 'Do you handle TCPA compliance?', a: 'Yes. A2P 10DLC registration is included with every plan at no extra cost. We also handle opt-out management (STOP/HELP keywords), quiet hours enforcement, and keep logs for compliance purposes.' },
  { q: 'What integrations are included?', a: 'All plans include Google Calendar and basic Zapier support. Pro and Agency plans add Jobber, Slack, and full Zapier automation. Agency plans also include API access for custom integrations.' },
];

// ── Check / dash cell ──────────────────────────────────────────────────────

function TableCell({ val, isDark }: { val: boolean | string; isDark?: boolean }) {
  if (val === true) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={12} color={isDark ? '#fff' : '#059669'} strokeWidth={3} />
        </div>
      </div>
    );
  }
  if (val === false) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontWeight: 600, fontSize: 18 }}>—</div>;
  }
  return <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : RINGO.ink2 }}>{val}</div>;
}

// ── FAQ accordion item ─────────────────────────────────────────────────────

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  const fade = useFadeUp(0);
  return (
    <div ref={fade.ref} style={{ ...fade.style, borderBottom: `1px solid ${RINGO.border}` }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '22px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: RINGO.font.ui }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: RINGO.ink, lineHeight: 1.4 }}>{q}</span>
        <span style={{
          width: 30, height: 30, borderRadius: '50%',
          background: isOpen ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : RINGO.bg,
          border: isOpen ? 'none' : `1px solid ${RINGO.border}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 0.2s ease',
        }}>
          <ChevronDown size={16} color={isOpen ? '#fff' : RINGO.ink3} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }} />
        </span>
      </button>
      {isOpen && (
        <div style={{ paddingBottom: 22, fontSize: 15, color: RINGO.ink3, lineHeight: 1.7 }}>{a}</div>
      )}
    </div>
  );
}

// ── Pricing page ───────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const monthlyPrices = { starter: 49, pro: 99, agency: 249 };
  const prices = annual
    ? { starter: Math.round(monthlyPrices.starter * 0.8), pro: Math.round(monthlyPrices.pro * 0.8), agency: Math.round(monthlyPrices.agency * 0.8) }
    : monthlyPrices;

  return (
    <div style={{ background: '#fff', color: RINGO.ink, fontFamily: RINGO.font.ui, overflowX: 'hidden' }}>
      <SiteNav />

      {/* ── Hero (left-aligned, gradient mesh on right) ───────────────────── */}
      <section style={{
        paddingTop: 'clamp(112px, 14vw, 164px)',
        paddingBottom: 'clamp(56px, 6vw, 80px)',
        paddingLeft: 'clamp(16px, 4vw, 48px)',
        paddingRight: 'clamp(16px, 4vw, 48px)',
        background: '#fff',
        borderBottom: `1px solid ${RINGO.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative gradient mesh (right side, Stripe-style) */}
        <div aria-hidden style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%',
          background: 'conic-gradient(from 180deg at 60% 50%, rgba(124,58,237,0.2), rgba(6,182,212,0.13), rgba(124,58,237,0.2))',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          opacity: 0.85,
        }} />

        <div style={{ maxWidth: 680, position: 'relative' }}>
          <h1 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0d0e1c', margin: '0 0 16px', lineHeight: 1.04 }}>
            Simple pricing that scales with you
          </h1>
          <p style={{ fontSize: 17, color: RINGO.ink3, margin: '0 0 36px', lineHeight: 1.6, maxWidth: 480 }}>
            No setup fees. No long-term contracts. Cancel anytime.
          </p>

          {/* Monthly / Annual toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px', background: '#f6f7fb', borderRadius: 12, border: `1px solid ${RINGO.border}` }}>
            <button
              onClick={() => setAnnual(false)}
              style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: !annual ? '#fff' : 'transparent', color: !annual ? RINGO.ink : RINGO.ink3, fontSize: 14, fontWeight: !annual ? 700 : 500, cursor: 'pointer', fontFamily: RINGO.font.ui, boxShadow: !annual ? '0 2px 8px -4px rgba(15,21,53,0.15)' : 'none', transition: 'all 0.2s ease' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: annual ? '#fff' : 'transparent', color: annual ? RINGO.ink : RINGO.ink3, fontSize: 14, fontWeight: annual ? 700 : 500, cursor: 'pointer', fontFamily: RINGO.font.ui, display: 'flex', alignItems: 'center', gap: 8, boxShadow: annual ? '0 2px 8px -4px rgba(15,21,53,0.15)' : 'none', transition: 'all 0.2s ease' }}
            >
              Annual
              <span style={{ padding: '2px 8px', borderRadius: 99, background: annual ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : 'rgba(124,58,237,0.1)', color: annual ? '#fff' : '#7c3aed', fontSize: 11, fontWeight: 700 }}>Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px, 6vw, 80px) clamp(16px, 4vw, 48px)', maxWidth: 1100, margin: '0 auto' }}>
        <div className="r-mk-pricing-grid">

          {/* Starter */}
          <div style={{ padding: '32px 28px', borderRadius: 22, background: '#fff', border: `1px solid ${RINGO.border}`, boxShadow: '0 8px 32px -20px rgba(15,21,53,0.12)' }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 800, color: RINGO.ink, marginBottom: 4 }}>Starter</div>
            <div style={{ fontSize: 13, color: RINGO.ink3, marginBottom: 28 }}>For solo operators</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: annual ? 8 : 28 }}>
              <span style={{ fontFamily: RINGO.font.head, fontSize: 56, fontWeight: 900, letterSpacing: '-0.035em', color: RINGO.ink }}>${prices.starter}</span>
              <span style={{ fontSize: 14, color: RINGO.ink3 }}>/ mo</span>
            </div>
            {annual && <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, marginBottom: 20 }}>Billed ${prices.starter * 12}/yr — save ${(monthlyPrices.starter - prices.starter) * 12}/yr</div>}
            <button onClick={openInquiry} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: RINGO.font.ui, marginBottom: 28, boxShadow: '0 12px 28px -10px rgba(124,58,237,0.45)' }}>
              Inquiry Now
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['1 phone number', 'SMS only', '500 replies / month', 'Basic analytics', 'Spam guard'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: RINGO.ink2 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color="#059669" strokeWidth={3} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro — lifted + gradient border + dark bg */}
          <div className="r-mk-pricing-pro" style={{
            padding: '32px 28px',
            borderRadius: 22,
            background: '#0d0e1c',
            border: '2px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: '0 0 0 2px transparent, 0 40px 80px -20px rgba(124,58,237,0.55)',
            position: 'relative',
            overflow: 'hidden',
            marginTop: -24,
            outline: '2px solid transparent',
            backgroundImage: 'linear-gradient(#0d0e1c,#0d0e1c)',
          }}>
            {/* Gradient border via pseudo-like wrapper */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 22, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', padding: 2, WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'destination-out', maskComposite: 'exclude', pointerEvents: 'none' }} />

            <div aria-hidden style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.4),transparent)', filter: 'blur(16px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 800, color: '#fff' }}>Pro</div>
                <span style={{ padding: '3px 10px', borderRadius: 99, background: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>MOST POPULAR</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>For growing businesses</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: annual ? 8 : 28 }}>
                <span style={{ fontFamily: RINGO.font.head, fontSize: 56, fontWeight: 900, letterSpacing: '-0.035em', color: '#fff' }}>${prices.pro}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>/ mo</span>
              </div>
              {annual && <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, marginBottom: 20 }}>Billed ${prices.pro * 12}/yr — save ${(monthlyPrices.pro - prices.pro) * 12}/yr</div>}
              <button onClick={openInquiry} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#fff', color: RINGO.ink, fontSize: 14, fontWeight: 700, fontFamily: RINGO.font.ui, marginBottom: 28, boxShadow: '0 12px 28px -10px rgba(0,0,0,0.3)' }}>
                Inquiry Now
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['3 phone numbers', 'SMS + WhatsApp + Instagram', 'Unlimited replies', 'Google Calendar + Jobber', 'Team inbox · 5 seats', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agency */}
          <div style={{ padding: '32px 28px', borderRadius: 22, background: '#fff', border: `1px solid ${RINGO.border}`, boxShadow: '0 8px 32px -20px rgba(15,21,53,0.12)' }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 800, color: RINGO.ink, marginBottom: 4 }}>Agency</div>
            <div style={{ fontSize: 13, color: RINGO.ink3, marginBottom: 28 }}>For multi-location teams</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: annual ? 8 : 28 }}>
              <span style={{ fontFamily: RINGO.font.head, fontSize: 56, fontWeight: 900, letterSpacing: '-0.035em', color: RINGO.ink }}>${prices.agency}</span>
              <span style={{ fontSize: 14, color: RINGO.ink3 }}>/ mo</span>
            </div>
            {annual && <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, marginBottom: 20 }}>Billed ${prices.agency * 12}/yr — save ${(monthlyPrices.agency - prices.agency) * 12}/yr</div>}
            <button onClick={openInquiry} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px 20px', borderRadius: 12, background: '#fff', border: `1px solid ${RINGO.borderStrong}`, cursor: 'pointer', color: RINGO.ink, fontSize: 14, fontWeight: 700, fontFamily: RINGO.font.ui, marginBottom: 28 }}>
              Contact sales
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['10 phone numbers', 'All channels', 'White-label branding', 'Unlimited team inbox', 'Dedicated onboarding', 'API access'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: RINGO.ink2 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color="#059669" strokeWidth={3} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature comparison table ─────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 5vw, 72px) clamp(16px, 4vw, 48px)', background: '#f6f7fb', borderTop: `1px solid ${RINGO.border}`, borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, letterSpacing: '-0.025em', color: RINGO.ink, margin: '0 0 36px', textAlign: 'center' }}>Compare plans</h2>
          <div className="r-mk-pricing-table">
            {/* Sticky header (hidden on mobile via CSS, where each row becomes a card) */}
            <div className="r-mk-pricing-table-head" style={{ position: 'sticky', top: 64 }}>
              <div style={{ padding: '16px 22px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Feature</div>
              {['Starter', 'Pro', 'Agency'].map((h, i) => (
                <div key={h} style={{ padding: '16px 22px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: i === 1 ? '#a78bfa' : 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em' }}>{h}</div>
              ))}
            </div>
            {FEATURES_TABLE.map((row, i) => (
              <FeatureTableRow key={row.label} row={row} index={i} total={FEATURES_TABLE.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px, 6vw, 80px) clamp(16px, 4vw, 48px)', maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.025em', color: RINGO.ink, margin: '0 0 36px', textAlign: 'center' }}>
          Frequently asked questions
        </h2>
        {FAQS.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
        ))}
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px, 8vw, 108px) clamp(16px, 4vw, 48px)', background: 'linear-gradient(135deg,#0d0e1c 0%,#12103a 50%,#0a1628 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', left: '50%', top: -80, width: 600, height: 400, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at center,rgba(124,58,237,0.3) 0%,transparent 65%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.25)' }} />
            Live in the same day
          </div>
          <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 16px', lineHeight: 1.08 }}>
            Ready to stop missing leads?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', margin: '0 0 36px', lineHeight: 1.6 }}>
            Tell us about your business and we&apos;ll have you live within 24 hours.
          </p>
          <button onClick={openInquiry} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 40px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: RINGO.font.ui, boxShadow: '0 24px 56px -12px rgba(124,58,237,0.65)' }}>
            Inquiry Now <ArrowRight size={18} />
          </button>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
            {['Keep your number', 'Cancel anytime', 'Live in 4 min'].map(t => (
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

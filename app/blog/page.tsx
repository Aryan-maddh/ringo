'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { RINGO } from '@/components/ringo/tokens';
import { SiteNav } from '@/components/ringo/SiteNav';
import { SiteFooter } from '@/components/ringo/SiteFooter';

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
  const style: React.CSSProperties = {
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(36px)',
    transition: `opacity 0.7s ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 0.7s ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
  };
  return [ref, style] as const;
}

// ── Types & data ───────────────────────────────────────────────────────────

type Category = 'All' | 'AI & Automation' | 'Lead Generation' | 'Compliance' | 'Case Studies';

interface Article {
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  authorInitials: string;
  authorGrad: string;
  date: string;
  readTime: string;
  grad: string;
}

const FEATURED: Article = {
  title: 'How AI Texting Booked 47 Jobs in One Weekend for a Dallas Plumber',
  excerpt: 'Marcus ran his plumbing business solo for six years. He was good at the work — great, even — but every missed call felt like money walking out the door. Then he set up Ripe Lead on a Friday afternoon, and by Sunday evening his calendar was full.',
  category: 'Case Studies',
  author: 'Jamie Okafor',
  authorInitials: 'JO',
  authorGrad: 'linear-gradient(135deg,#d97706,#e11d48)',
  date: 'May 18, 2026',
  readTime: '6 min read',
  grad: 'linear-gradient(160deg,#0d0e1c 0%,#1e0952 100%)',
};

const ARTICLES: Article[] = [
  {
    title: 'TCPA Compliance for Contractors: The 2026 Guide',
    excerpt: 'Everything you need to know about A2P 10DLC registration, opt-out handling, and quiet hours — without the legalese.',
    category: 'Compliance',
    author: 'Priya Sharma',
    authorInitials: 'PS',
    authorGrad: 'linear-gradient(135deg,#059669,#06b6d4)',
    date: 'May 14, 2026',
    readTime: '8 min read',
    grad: 'linear-gradient(135deg,#059669,#06b6d4)',
  },
  {
    title: 'WhatsApp Business for Plumbers: Why It Books More Jobs',
    excerpt: 'WhatsApp messages have a 98% open rate. SMS has 82%. Here\'s how to leverage both without managing two inboxes.',
    category: 'Lead Generation',
    author: 'Marcus Chen',
    authorInitials: 'MC',
    authorGrad: 'linear-gradient(135deg,#0284c7,#a78bfa)',
    date: 'May 10, 2026',
    readTime: '5 min read',
    grad: 'linear-gradient(135deg,#25d366,#128c7e)',
  },
  {
    title: 'The 11-Second Reply: Why Speed Beats Price Every Time',
    excerpt: 'Customers who get a response within 60 seconds are 391% more likely to book. Here\'s the data behind why reply speed is your biggest competitive advantage.',
    category: 'AI & Automation',
    author: 'Alex Rivera',
    authorInitials: 'AR',
    authorGrad: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
    date: 'May 5, 2026',
    readTime: '4 min read',
    grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
  },
  {
    title: 'From 3 Missed Calls to 3 Booked Jobs: A Case Study',
    excerpt: 'Aisha runs a one-person HVAC shop in Phoenix. In her first week with Ripe Lead, she converted three calls she would have completely missed into confirmed appointments.',
    category: 'Case Studies',
    author: 'Jamie Okafor',
    authorInitials: 'JO',
    authorGrad: 'linear-gradient(135deg,#d97706,#e11d48)',
    date: 'Apr 28, 2026',
    readTime: '5 min read',
    grad: 'linear-gradient(135deg,#d97706,#fbbf24)',
  },
  {
    title: 'How to Write an AI Voice That Sounds Like You',
    excerpt: 'The difference between "I\'m an AI assistant" and "Hey! It\'s Pacific Plumbing — sorry we missed you." This guide walks you through crafting a voice profile that sounds human.',
    category: 'AI & Automation',
    author: 'Marcus Chen',
    authorInitials: 'MC',
    authorGrad: 'linear-gradient(135deg,#0284c7,#a78bfa)',
    date: 'Apr 21, 2026',
    readTime: '6 min read',
    grad: 'linear-gradient(135deg,#1877f2,#06b6d4)',
  },
  {
    title: 'Instagram DMs vs SMS: Which Converts Better for Trades?',
    excerpt: 'We analyzed 40,000 conversations across both channels. The winner surprised us — and the margin was bigger than anyone expected.',
    category: 'Lead Generation',
    author: 'Jamie Okafor',
    authorInitials: 'JO',
    authorGrad: 'linear-gradient(135deg,#d97706,#e11d48)',
    date: 'Apr 15, 2026',
    readTime: '7 min read',
    grad: 'linear-gradient(135deg,#dd2a7b,#8134af)',
  },
];

const CATEGORIES: Category[] = ['All', 'AI & Automation', 'Lead Generation', 'Compliance', 'Case Studies'];

// ── Category chip ──────────────────────────────────────────────────────────

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px',
        borderRadius: 99,
        border: active ? 'none' : `1px solid ${RINGO.border}`,
        background: active ? RINGO.ink : '#fff',
        color: active ? '#fff' : RINGO.ink3,
        fontSize: 13.5,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        fontFamily: RINGO.font.ui,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ── Author avatar ──────────────────────────────────────────────────────────

function AuthorAvatar({ initials, grad, size = 32 }: { initials: string; grad: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: grad,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: RINGO.font.head, fontWeight: 700,
      fontSize: size * 0.37, flexShrink: 0,
    }}>{initials}</div>
  );
}

// ── Article card ───────────────────────────────────────────────────────────

function ArticleCard({ article, delay }: { article: Article; delay: number }) {
  const [hovered, setHovered] = React.useState(false);
  const [fadeRef, fadeStyle] = useFadeUp(delay);
  return (
    <div
      ref={fadeRef}
      style={{
        ...fadeStyle,
        display: 'flex', flexDirection: 'column',
        borderRadius: 18, background: '#fff',
        border: `1px solid ${RINGO.border}`,
        overflow: 'hidden',
        boxShadow: hovered ? '0 20px 48px -16px rgba(15,21,53,0.2)' : '0 4px 16px -8px rgba(15,21,53,0.1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease, opacity 0.7s, transform 0.7s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{
          display: 'inline-block', padding: '4px 10px', borderRadius: 99,
          background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 14, alignSelf: 'flex-start',
        }}>{article.category}</span>
        <h3 style={{ fontFamily: RINGO.font.head, fontSize: 17, fontWeight: 800, letterSpacing: '-0.015em', color: RINGO.ink, margin: '0 0 12px', lineHeight: 1.3 }}>{article.title}</h3>
        <p style={{ fontSize: 13.5, color: RINGO.ink3, lineHeight: 1.6, margin: '0 0 auto', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${RINGO.border}` }}>
          <AuthorAvatar initials={article.authorInitials} grad={article.authorGrad} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: RINGO.ink }}>{article.author}</div>
            <div style={{ fontSize: 11, color: RINGO.ink3 }}>{article.date}</div>
          </div>
          <span style={{ fontSize: 11, color: RINGO.ink3, whiteSpace: 'nowrap' }}>{article.readTime}</span>
        </div>
      </div>
    </div>
  );
}

// ── Blog page ──────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [email, setEmail] = useState('');

  const filtered = activeCategory === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div style={{ background: '#fff', color: RINGO.ink, fontFamily: RINGO.font.ui, overflowX: 'hidden' }}>
      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 'clamp(112px, 14vw, 164px)',
        paddingBottom: 'clamp(48px, 6vw, 72px)',
        paddingLeft: 'clamp(16px, 4vw, 48px)',
        paddingRight: 'clamp(16px, 4vw, 48px)',
        background: '#fff',
        borderBottom: `1px solid ${RINGO.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', color: RINGO.ink, margin: '0 0 14px' }}>
            Blog
          </h1>
          <p style={{ fontSize: 18, color: RINGO.ink3, margin: '0 0 32px', lineHeight: 1.55, maxWidth: 520 }}>
            Insights on AI, the trades, and converting more leads into booked jobs.
          </p>
          {/* Category filter */}
          <div className="r-mk-chip-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <CategoryChip key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured article ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 48px)', maxWidth: 1100, margin: '0 auto', borderBottom: `1px solid ${RINGO.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: RINGO.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 22 }}>Featured</div>
        <div className="r-mk-blog-featured">
          {/* Left dark gradient panel */}
          <div style={{ background: FEATURED.grad, padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 340, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.4),transparent)', filter: 'blur(20px)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(6,182,212,0.3),transparent)', filter: 'blur(20px)' }} />
            <div style={{ position: 'relative' }}>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{FEATURED.category}</span>
              <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{FEATURED.title}</h2>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>{FEATURED.readTime}</div>
            </div>
          </div>

          {/* Right content */}
          <div style={{ padding: 'clamp(28px, 4vw, 48px)', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 99, background: 'rgba(124,58,237,0.08)', color: '#7c3aed', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18, alignSelf: 'flex-start' }}>{FEATURED.category}</span>
            <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', color: RINGO.ink, margin: '0 0 16px', lineHeight: 1.25 }}>{FEATURED.title}</h2>
            <p style={{ fontSize: 15, color: RINGO.ink3, lineHeight: 1.65, margin: '0 0 auto' }}>{FEATURED.excerpt}</p>
            <div style={{ marginTop: 28, paddingTop: 22, borderTop: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AuthorAvatar initials={FEATURED.authorInitials} grad={FEATURED.authorGrad} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink }}>{FEATURED.author}</div>
                <div style={{ fontSize: 11, color: RINGO.ink3 }}>{FEATURED.date} · {FEATURED.readTime}</div>
              </div>
              <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#7c3aed', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Read article <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 48px)', maxWidth: 1100, margin: '0 auto' }}>
        {filtered.length > 0 ? (
          <div className="r-mk-blog-grid">
            {filtered.map((article, i) => (
              <ArticleCard key={i} article={article} delay={i * 60} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '72px 0', color: RINGO.ink3 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: RINGO.ink, marginBottom: 10 }}>No articles in this category yet</div>
            <div style={{ fontSize: 15 }}>Check back soon — we publish weekly.</div>
          </div>
        )}
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0d0e1c 0%,#12103a 50%,#0a1628 100%)', padding: 'clamp(72px, 8vw, 108px) clamp(16px, 4vw, 48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 70% 50%, rgba(6,182,212,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>Newsletter</div>
          <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 14px' }}>
            Stay sharp. Get the weekly roundup.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 32px', lineHeight: 1.6 }}>
            AI, lead conversion, and growing a trades business. No fluff. No spam.
          </p>
          <div className="r-mk-news-row">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15, fontFamily: RINGO.font.ui, padding: '8px 12px' }}
            />
            <button
              onClick={() => setEmail('')}
              style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: RINGO.font.ui, whiteSpace: 'nowrap', boxShadow: '0 8px 24px -8px rgba(124,58,237,0.6)' }}
            >
              Subscribe
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 14 }}>No spam. Unsubscribe anytime.</div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

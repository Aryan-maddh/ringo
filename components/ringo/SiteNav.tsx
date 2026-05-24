'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RINGO } from '@/components/ringo/tokens';
import { RingoLogo } from '@/components/ringo/RingoLogo';
import { openInquiry } from '@/components/ringo/InquiryModal';

interface SiteNavProps {
  transparent?: boolean;
}

const NAV_LINKS = [
  { label: 'Product',  href: '/product' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog',     href: '/blog' },
  { label: 'Pricing',  href: '/pricing' },
];

export function SiteNav({ transparent = false }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isTransparentMode = transparent;
  const showFrosted = !isTransparentMode || scrolled || menuOpen;

  const navBg = showFrosted ? 'rgba(255,255,255,0.92)' : 'transparent';
  const navBorder = showFrosted ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent';
  const navShadow = showFrosted ? '0 1px 0 0 rgba(0,0,0,0.04)' : 'none';

  const linkColor = showFrosted ? RINGO.ink2 : 'rgba(255,255,255,0.88)';
  const activeLinkColor = showFrosted ? '#7c3aed' : '#fff';
  const signInColor = showFrosted ? RINGO.ink2 : 'rgba(255,255,255,0.88)';
  const burgerColor = showFrosted ? RINGO.ink : '#fff';

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        padding: '0 clamp(16px, 4vw, 48px)',
        height: 64,
        background: navBg,
        backdropFilter: showFrosted ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: showFrosted ? 'blur(16px)' : 'none',
        borderBottom: navBorder,
        boxShadow: navShadow,
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
        fontFamily: RINGO.font.ui,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }} onClick={() => setMenuOpen(false)}>
          <RingoLogo size={28} light={isTransparentMode && !scrolled && !menuOpen} />
        </Link>

        {/* Center nav links (desktop only) */}
        <div className="r-nav-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginLeft: 40,
        }}>
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? activeLinkColor : linkColor,
                  fontFamily: RINGO.font.ui,
                  transition: 'color 0.2s ease',
                  letterSpacing: '-0.005em',
                  ...(isActive && showFrosted ? { fontWeight: 600 } : {}),
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side (desktop) */}
        <div className="r-nav-cta" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              color: signInColor,
              borderRadius: 8,
              transition: 'color 0.2s ease',
              letterSpacing: '-0.005em',
            }}
          >
            Sign in
          </Link>
          <button
            onClick={openInquiry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              color: '#fff',
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: RINGO.font.ui,
              cursor: 'pointer',
              boxShadow: '0 8px 20px -8px rgba(124,58,237,0.55)',
              letterSpacing: '-0.005em',
              whiteSpace: 'nowrap',
            }}
          >
            Inquiry Now
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
          className="r-nav-burger"
          style={{
            marginLeft: 'auto',
            width: 44, height: 44, borderRadius: 10,
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            color: burgerColor,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            {menuOpen ? (
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 11h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="r-nav-drawer"
          style={{
            position: 'fixed',
            top: 64, left: 0, right: 0, bottom: 0,
            zIndex: 49,
            background: '#fff',
            padding: '24px clamp(16px, 4vw, 32px) 32px',
            overflowY: 'auto',
            display: 'none',
            flexDirection: 'column',
            gap: 6,
            fontFamily: RINGO.font.ui,
            animation: 'r-fade-in 0.18s ease both',
          }}
        >
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 14px',
                  borderRadius: 12,
                  fontSize: 17,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#7c3aed' : RINGO.ink,
                  textDecoration: 'none',
                  background: isActive ? 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(6,182,212,0.06))' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(124,58,237,0.18)' : 'transparent'}`,
                  fontFamily: RINGO.font.head,
                  letterSpacing: '-0.01em',
                }}
              >
                {link.label}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            );
          })}

          <div style={{ height: 1, background: RINGO.border, margin: '14px 6px' }} />

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              padding: '14px 14px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: RINGO.ink2,
              textDecoration: 'none',
              background: '#f6f7fb',
              textAlign: 'center',
            }}
          >
            Sign in
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              openInquiry();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
              padding: '15px 18px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: RINGO.font.ui,
              cursor: 'pointer',
              boxShadow: '0 12px 28px -10px rgba(124,58,237,0.5)',
              letterSpacing: '-0.005em',
            }}
          >
            Inquiry Now
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

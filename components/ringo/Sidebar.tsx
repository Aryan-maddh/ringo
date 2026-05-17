'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RINGO } from './tokens';
import { Icon, ICONS } from './Icon';
import { RingoLogo } from './RingoLogo';
import { Avatar } from './Avatar';

const NAV = [
  { id: 'dash',      label: 'Dashboard',  icon: ICONS.grid,   href: '/dashboard' },
  { id: 'sms',       label: 'Messages',   icon: ICONS.msg,    href: '/inbox' },
  { id: 'calls',     label: 'Call log',   icon: ICONS.phone,  href: '/calls' },
  { id: 'contacts',  label: 'Contacts',   icon: ICONS.user,   href: '/contacts' },
  { id: 'analytics', label: 'Analytics',  icon: ICONS.filter, href: '/analytics' },
  { id: 'reviews',   label: 'Reviews',    icon: ICONS.star,   href: '/reviews' },
  { id: 'campaigns', label: 'Campaigns',  icon: ICONS.zap,    href: '/campaigns' },
  { id: 'bill',      label: 'Billing',    icon: ICONS.card,   href: '/billing' },
  { id: 'set',       label: 'Settings',   icon: ICONS.cog,    href: '/settings' },
];

type ActiveId = 'dash' | 'sms' | 'calls' | 'contacts' | 'analytics' | 'reviews' | 'campaigns' | 'bill' | 'set';

interface SidebarProps {
  active: ActiveId;
}

function SidebarBody({ active, onNavigate }: { active: ActiveId; onNavigate?: () => void }) {
  return (
    <>
      <div style={{ marginBottom: 28, paddingLeft: 6 }}>
        <RingoLogo size={26} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: RINGO.ink3, textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
          Menu
        </div>
        {NAV.map(n => {
          const on = n.id === active;
          return (
            <Link
              key={n.id}
              href={n.href}
              onClick={onNavigate}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 9,
                marginBottom: 2, textDecoration: 'none',
                background: on ? 'linear-gradient(90deg,rgba(124,58,237,0.09),transparent)' : 'transparent',
                color: on ? RINGO.ink : RINGO.ink2,
                fontSize: 13.5, fontWeight: on ? 600 : 500,
                borderLeft: `3px solid ${on ? '#7c3aed' : 'transparent'}`,
              }}
            >
              <div style={{ color: on ? '#7c3aed' : RINGO.ink3 }}>
                <Icon d={n.icon} size={16} />
              </div>
              <span>{n.label}</span>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${RINGO.border}` }}>
        <Link
          href="/inbox"
          onClick={onNavigate}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 9,
            textDecoration: 'none', color: RINGO.ink2,
            fontSize: 13.5, fontWeight: 500, marginBottom: 10,
          }}
        >
          <Icon d={ICONS.bell} size={16} />
          <span>Notifications</span>
          <span style={{ marginLeft: 'auto', padding: '2px 7px', borderRadius: 99, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 10.5, fontWeight: 700 }}>3</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 10, background: RINGO.bg }}>
          <Avatar name="Marco Reyes" size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: RINGO.ink }}>Marco Reyes</div>
            <div style={{ fontSize: 11, color: RINGO.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Pacific Plumbing</div>
          </div>
          <Icon d={ICONS.chevR} size={13} />
        </div>
      </div>
    </>
  );
}

export function Sidebar({ active }: SidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop sidebar (≥769px) */}
      <div
        className="r-sidebar"
        style={{
          width: 220, flex: '0 0 220px', height: '100%',
          background: '#fff', borderRight: `1px solid ${RINGO.border}`,
          display: 'flex', flexDirection: 'column',
          padding: '20px 12px 16px', fontFamily: RINGO.font.ui,
        }}
      >
        <SidebarBody active={active} />
      </div>

      {/* Mobile top bar (≤768px) */}
      <div className="r-mobile-bar">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${RINGO.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RINGO.ink2 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <RingoLogo size={22} />
        <div style={{ marginLeft: 'auto' }}>
          <Avatar name="Marco Reyes" size={32} />
        </div>
      </div>

      {/* Mobile drawer (≤768px) */}
      {drawerOpen && (
        <div className="r-mobile-drawer-root">
          <div className="r-mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="r-mobile-drawer-panel" style={{ background: '#fff', display: 'flex', flexDirection: 'column', padding: '20px 12px 16px', fontFamily: RINGO.font.ui }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${RINGO.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RINGO.ink2 }}>
                <Icon d={ICONS.x} size={14} />
              </button>
            </div>
            <SidebarBody active={active} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

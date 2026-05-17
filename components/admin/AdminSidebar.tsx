'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { IconTile } from '@/components/ringo/IconTile';
import { Avatar } from '@/components/ringo/Avatar';
import { Sparkline } from '@/components/ringo/Sparkline';
import { RingoLogo } from '@/components/ringo/RingoLogo';
import { RINGO } from '@/components/ringo/tokens';

const S = {
  from:   '#1a1a2e',
  to:     '#0f3460',
  border: 'rgba(255,255,255,0.06)',
  muted:  'rgba(255,255,255,0.55)',
};

interface NavItem {
  id: string;
  l: string;
  ic: string;
  g: string;
  badge?: string;
  href: string;
}

const ADMIN_NAV: NavItem[] = [
  { id: 'over',  l: 'Overview',      ic: ICONS.dash,   g: RINGO.iVio, href: '/admin/dashboard' },
  { id: 'biz',   l: 'Businesses',    ic: ICONS.bld,    g: RINGO.iEme, badge: '4.2k', href: '/admin/businesses' },
  { id: 'rev',   l: 'Revenue',       ic: ICONS.dollar, g: RINGO.iAmb, href: '/admin/revenue' },
  { id: 'usr',   l: 'Users & roles', ic: ICONS.user,   g: RINGO.iSky, href: '/admin/users' },
  { id: 'msg',   l: 'SMS traffic',   ic: ICONS.msg,    g: RINGO.iRos, badge: 'live', href: '/admin/sms-traffic' },
  { id: 'cmp',   l: 'Compliance',    ic: ICONS.shld,   g: RINGO.iPnk, href: '/admin/compliance' },
  { id: 'sys',   l: 'System health', ic: ICONS.zap,    g: RINGO.iEme, href: '/admin/system-health' },
  { id: 'audit', l: 'Audit log',     ic: ICONS.flag,   g: RINGO.iSlt, href: '/admin/audit-log' },
];

const ADMIN_NAV_BOTTOM: NavItem[] = [
  { id: 'set',  l: 'Platform settings', ic: ICONS.cog,  g: RINGO.iSlt, href: '/admin/platform-settings' },
  { id: 'docs', l: 'Internal docs',     ic: ICONS.glob, g: RINGO.iSlt, href: '/admin/docs' },
];

// ── Sidebar ────────────────────────────────────────────────────────────────

interface AdminSidebarProps { active?: string; }

function AdminSidebarBody({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  const router = useRouter();
  return (
    <>
      <div style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center',
        gap: 10, borderBottom: `1px solid ${S.border}` }}>
        <RingoLogo size={28} light />
        <span style={{ padding: '2px 8px', borderRadius: 6,
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>ADMIN</span>
      </div>

      <button style={{ margin: '14px 14px 6px', padding: '10px 12px', borderRadius: 10,
        background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.border}`,
        color: '#fff', display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', textAlign: 'left' }}>
        <IconTile grad={RINGO.iVio} size={28} radius={7}>
          <Icon d={ICONS.glob} size={14} />
        </IconTile>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: S.muted, letterSpacing: '0.06em',
            textTransform: 'uppercase', fontWeight: 600 }}>Region</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>US Production · prod-1</div>
        </div>
        <Icon d={ICONS.chev} size={14} stroke={2} />
      </button>

      <div style={{ padding: '14px 14px 0', fontSize: 11, color: S.muted,
        letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Platform</div>
      <nav style={{ padding: '8px 10px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ADMIN_NAV.map(n => {
          const on = n.id === active;
          return (
            <a key={n.id} href={n.href}
              onClick={e => { e.preventDefault(); router.push(n.href); onNavigate?.(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px',
                borderRadius: 10, color: on ? '#fff' : 'rgba(255,255,255,0.78)',
                textDecoration: 'none', fontSize: 13.5, fontWeight: on ? 600 : 500,
                background: on ? 'rgba(255,255,255,0.08)' : 'transparent',
                boxShadow: on ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
                position: 'relative', cursor: 'pointer',
              }}>
              <IconTile grad={n.g} size={28} radius={7}>
                <Icon d={n.ic} size={14} />
              </IconTile>
              <span style={{ flex: 1 }}>{n.l}</span>
              {n.badge && (
                <span style={{ padding: '2px 7px', borderRadius: 8, fontSize: 10.5, fontWeight: 700,
                  background: n.badge === 'live'
                    ? 'linear-gradient(135deg,#059669,#06b6d4)'
                    : 'rgba(255,255,255,0.10)' }}>{n.badge}</span>
              )}
              {on && <span style={{ position: 'absolute', left: -10, top: 8, bottom: 8,
                width: 3, borderRadius: 2,
                background: 'linear-gradient(180deg,#7c3aed,#06b6d4)' }} />}
            </a>
          );
        })}
      </nav>

      <div style={{ padding: '18px 14px 0', fontSize: 11, color: S.muted,
        letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>System</div>
      <nav style={{ padding: '8px 10px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ADMIN_NAV_BOTTOM.map(n => {
          const on = n.id === active;
          return (
            <a key={n.id} href={n.href}
              onClick={e => { e.preventDefault(); router.push(n.href); onNavigate?.(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px',
                borderRadius: 10, color: on ? '#fff' : 'rgba(255,255,255,0.78)',
                textDecoration: 'none', fontSize: 13.5, fontWeight: on ? 600 : 500,
                background: on ? 'rgba(255,255,255,0.08)' : 'transparent',
                cursor: 'pointer' }}>
              <IconTile grad={n.g} size={28} radius={7}>
                <Icon d={n.ic} size={14} />
              </IconTile>
              <span>{n.l}</span>
            </a>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ margin: 14, padding: 14, borderRadius: 14,
        background: 'linear-gradient(135deg,rgba(5,150,105,0.22),rgba(6,182,212,0.18))',
        border: '1px solid rgba(255,255,255,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981',
            boxShadow: '0 0 0 4px rgba(16,185,129,0.18)' }} />
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>All systems normal</div>
        </div>
        <div style={{ fontSize: 11.5, color: S.muted, marginTop: 8, lineHeight: 1.5 }}>
          SMS: 99.99% · API: 99.97% · 0 incidents in 30d
        </div>
        <button
          onClick={() => window.open('/admin/system-health', '_blank')}
          style={{ marginTop: 12, width: '100%', padding: '8px 10px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer',
          background: 'rgba(255,255,255,0.05)', color: '#fff',
          fontFamily: RINGO.font.ui, fontWeight: 600, fontSize: 12.5 }}>
          Open status page
        </button>
      </div>
    </>
  );
}

export function AdminSidebar({ active = 'over' }: AdminSidebarProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  const sidebarStyle: React.CSSProperties = {
    width: 248, flex: '0 0 auto', minHeight: '100%',
    background: `linear-gradient(180deg,${S.from} 0%,${S.to} 100%)`,
    color: '#fff', fontFamily: RINGO.font.ui, display: 'flex', flexDirection: 'column',
  };

  return (
    <>
      <aside className="r-admin-sidebar" style={sidebarStyle}>
        <AdminSidebarBody active={active} />
      </aside>

      {/* Mobile top bar (≤768px) */}
      <div className="r-mobile-bar r-mobile-bar-dark">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RingoLogo size={22} light />
          <span style={{ padding: '2px 7px', borderRadius: 5, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: '#fff' }}>ADMIN</span>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="r-mobile-drawer-root">
          <div className="r-mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="r-mobile-drawer-panel" style={sidebarStyle}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Icon d={ICONS.x} size={14} />
              </button>
            </div>
            <AdminSidebarBody active={active} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────

export interface AdminTopbarProps {
  title: React.ReactNode;
  sub?: string | null;
  breadcrumb?: string[];
}

export function AdminTopbar({ title, sub, breadcrumb }: AdminTopbarProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = React.useState(false);
  return (
    <header className="r-admin-topbar" style={{ padding: '22px 28px 14px', display: 'flex', alignItems: 'center',
      gap: 24, background: '#fff', borderBottom: `1px solid ${RINGO.border}`,
      fontFamily: RINGO.font.ui, flexShrink: 0, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            color: RINGO.ink3, marginBottom: 6 }}>
            {breadcrumb.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon d={ICONS.chevR} size={11} />}
                <span style={{
                  color: i === breadcrumb.length - 1 ? RINGO.ink : 'inherit',
                  fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                }}>{c}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 style={{ margin: 0, fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700,
          letterSpacing: '-0.02em', color: RINGO.ink }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: RINGO.ink3, marginTop: 4 }}>{sub}</div>}
      </div>

      <div className="r-admin-topbar-search" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
        borderRadius: 10, background: '#f6f7fb', width: 340 }}>
        <Icon d={ICONS.search} size={15} stroke={2} />
        <input placeholder="Find a business, user, or phone number…"
          style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 0,
            fontFamily: RINGO.font.ui, fontSize: 13, color: RINGO.ink }} />
        <span style={{ fontSize: 11, color: RINGO.ink3, padding: '2px 6px', borderRadius: 5,
          background: '#fff', border: `1px solid ${RINGO.border}`,
          fontFamily: RINGO.font.mono }}>⌘K</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="r-admin-topbar-impersonate" style={{ padding: '8px 12px', borderRadius: 10,
          border: `1px solid ${RINGO.border}`, background: '#fff',
          fontFamily: RINGO.font.ui, fontSize: 12, fontWeight: 600,
          color: RINGO.ink2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon d={ICONS.user} size={13} /> Impersonate
        </button>
        <button style={{ width: 38, height: 38, borderRadius: 10,
          border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative' }}>
          <Icon d={ICONS.bell} size={16} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7,
            borderRadius: '50%', background: '#e11d48', boxShadow: '0 0 0 2px #fff' }} />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px 8px 8px',
              borderRadius: 10, border: `1px solid ${showMenu ? '#7c3aed' : RINGO.border}`, background: '#fff',
              cursor: 'pointer', fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 500,
              color: RINGO.ink }}>
            <Avatar name="Ada Nakamura" size={24} />
            <span>Ada N. · Staff</span>
            <Icon d={ICONS.chev} size={14} />
          </button>
          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff',
                borderRadius: 12, border: `1px solid ${RINGO.border}`,
                boxShadow: '0 12px 32px -8px rgba(0,0,0,0.14)', minWidth: 190, zIndex: 100, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${RINGO.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: RINGO.ink }}>Ada Nakamura</div>
                  <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 2 }}>Staff · admin</div>
                </div>
                <button onClick={() => { setShowMenu(false); }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 9, padding: '10px 14px',
                    border: 'none', background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui,
                    fontSize: 13, color: RINGO.ink2, textAlign: 'left' }}>
                  <Icon d={ICONS.user} size={13} /> View profile
                </button>
                <button onClick={() => { setShowMenu(false); router.push('/admin/platform-settings'); }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 9, padding: '10px 14px',
                    border: 'none', background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui,
                    fontSize: 13, color: RINGO.ink2, textAlign: 'left' }}>
                  <Icon d={ICONS.cog} size={13} /> Settings
                </button>
                <div style={{ height: 1, background: RINGO.border, margin: '4px 0' }} />
                <button onClick={() => { setShowMenu(false); localStorage.removeItem('adminToken'); router.push('/admin/login'); }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 9, padding: '10px 14px',
                    border: 'none', background: '#fff', cursor: 'pointer', fontFamily: RINGO.font.ui,
                    fontSize: 13, color: '#e11d48', textAlign: 'left' }}>
                  <Icon d={ICONS.x} size={13} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Shared stat cards ──────────────────────────────────────────────────────

export interface StatCardAProps {
  grad: string;
  label: string;
  value: string;
  delta: string;
  deltaTone?: 'up' | 'down';
  icon: string;
  sub: string;
  spark: number[];
}

export function StatCardA({ grad, label, value, delta, deltaTone = 'up', icon, sub, spark }: StatCardAProps) {
  return (
    <div style={{ position: 'relative', borderRadius: 18, padding: '20px 22px 18px',
      color: '#fff', background: grad, overflow: 'hidden', minHeight: 158,
      fontFamily: RINGO.font.ui, boxShadow: '0 14px 32px -16px rgba(15,21,53,0.45)' }}>
      <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(255,255,255,0.16)', filter: 'blur(2px)' }} />
      <div style={{ position: 'absolute', right: 18, bottom: 14, opacity: 0.9 }}>
        <Sparkline data={spark} width={120} height={36} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}>
          <Icon d={icon} size={16} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', opacity: 0.92 }}>{label}</div>
      </div>
      <div style={{ marginTop: 14, fontFamily: RINGO.font.head, fontSize: 34, fontWeight: 700,
        letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12.5, opacity: 0.92 }}>
        <span style={{ padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.18)',
          fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {deltaTone === 'up' ? '▲' : '▼'} {delta}
        </span>
        <span>{sub}</span>
      </div>
    </div>
  );
}

export interface StatCardA2Props {
  grad: string;
  label: string;
  value: string;
  delta: string;
  sub: string;
  icon: string;
}

export function StatCardA2({ grad, label, value, delta, sub, icon }: StatCardA2Props) {
  return (
    <div style={{ position: 'relative', borderRadius: 16, padding: '16px 18px',
      color: '#fff', background: grad, overflow: 'hidden', minHeight: 110,
      fontFamily: RINGO.font.ui, boxShadow: '0 14px 32px -16px rgba(15,21,53,0.45)' }}>
      <div style={{ position: 'absolute', right: -30, top: -30, width: 130, height: 130,
        borderRadius: '50%', background: 'rgba(255,255,255,0.16)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}>
          <Icon d={icon} size={14} />
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', opacity: 0.92 }}>{label}</div>
      </div>
      <div style={{ marginTop: 10, fontFamily: RINGO.font.head, fontSize: 26, fontWeight: 700,
        letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.92 }}>
        <span style={{ padding: '2px 7px', borderRadius: 99, background: 'rgba(255,255,255,0.18)',
          fontWeight: 600 }}>{delta}</span>
        <span style={{ marginLeft: 6 }}>{sub}</span>
      </div>
    </div>
  );
}

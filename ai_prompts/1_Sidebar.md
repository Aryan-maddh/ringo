# Prompt for: Sidebar Component

Copy the ENTIRE contents of this file (CTRL+A) and paste it directly into your AI generator (v0 or Stitch AI).

--------------------------------------------------
### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

### Global App Navigation Rule
> **App Navigation & Routing Context:**
> Please ensure that all generated sidebar links, header links, and internal buttons use Next.js `<Link href='/path'>` components instead of static `<button>` tags, and explicitly route to these exact paths:
> - Dashboard -> `/dashboard`
> - Inbox (Messages/Call Logs) -> `/inbox`
> - Calls -> `/calls`
> - Contacts -> `/contacts`
> - Analytics -> `/analytics`
> - Reviews -> `/reviews`
> - Campaigns -> `/campaigns`
> - Settings -> `/settings`
> 
> Do NOT break existing `onClick` handlers or `useState` hooks. If my code has an `onClick={handleSave}`, make sure your redesigned button keeps that exact `onClick`.

--------------------------------------------------

### Specific Page Prompt
> Create the main layout shell and sidebar for a B2B SaaS application called "Ringo". 
> **Aesthetics: "Modern Architecture & Glassmorphism".**
> - Do NOT use flat, boring colors. The sidebar should have a dark, highly dynamic background. Use a very deep midnight blue (`#0B0F19`) with a subtle, glowing radial gradient (e.g., a faint cyan or indigo glow emerging from the bottom left corner).
> - **Architectural Textures:** Add a very faint, subtle geometric grid pattern or noise texture to the background of the sidebar to make it look like modern tech architecture.
> - **Glassmorphic Elements:** Active state buttons should not just be solid blocks of color. Make them semi-transparent glassmorphic panels (`bg-white/10 backdrop-blur-md`) with a vibrant, glowing left-border indicator.
> - **Dynamic Hover States:** When hovering over navigation links, they should smoothly translate to the right by `2px`, with the text illuminating. 
> 
> Please rewrite my existing code below to use this deeply stylized, modern architectural design. **Keep all of my React state, mapping logic, and routing exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout to match this premium, dynamic aesthetic.

--------------------------------------------------
### My Existing Code:

```tsx
'use client';

import React from 'react';
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

export function Sidebar({ active }: SidebarProps) {
  return (
    <div
      className="r-sidebar"
      style={{
        width: 220, flex: '0 0 220px', height: '100%',
        background: '#fff', borderRight: `1px solid ${RINGO.border}`,
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px 16px', fontFamily: RINGO.font.ui,
      }}
    >
      <div style={{ marginBottom: 28, paddingLeft: 6 }}>
        <RingoLogo size={26} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: RINGO.ink3, textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
          Menu
        </div>
        {NAV.map(n => {
          const on = n.id === active;
          return (
            <Link
              key={n.id}
              href={n.href}
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
    </div>
  );
}

```

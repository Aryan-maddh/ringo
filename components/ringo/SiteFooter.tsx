'use client';

import React from 'react';
import { RINGO } from '@/components/ringo/tokens';
import { RingoLogo } from '@/components/ringo/RingoLogo';
import { Pill } from '@/components/ringo/Pill';

export function SiteFooter() {
  const cols: [string, string[]][] = [
    ['Product',   ['Features', 'Pricing', 'Integrations', 'Changelog', 'Status']],
    ['Trades',    ['Plumbing', 'Electrical', 'HVAC', 'Salons', 'Cleaning']],
    ['Company',   ['About', 'Customers', 'Careers', 'Contact', 'Press']],
    ['Resources', ['Docs', 'API', 'Compliance', 'Playbook', 'Help center']],
  ];

  return (
    <footer style={{
      paddingTop: 48,
      paddingBottom: 32,
      paddingLeft: 'clamp(16px, 4vw, 48px)',
      paddingRight: 'clamp(16px, 4vw, 48px)',
      background: '#0f1535',
      color: 'rgba(255,255,255,0.7)',
      fontFamily: RINGO.font.ui,
    }}>
      <div className="r-mk-footer-grid" style={{
        maxWidth: 1320,
        margin: '0 auto',
      }}>
        {/* Logo + tagline + compliance pills */}
        <div>
          <RingoLogo size={26} light />
          <div style={{ fontSize: 13, marginTop: 14, lineHeight: 1.55, maxWidth: 280, color: 'rgba(255,255,255,0.6)' }}>
            Missed-call autoresponder for plumbers, electricians, salons, and the rest of the builders of America.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, fontSize: 11, flexWrap: 'wrap' }}>
            <Pill tone="neutral" dot={false}>SOC 2 Type II</Pill>
            <Pill tone="neutral" dot={false}>TCPA · A2P 10DLC</Pill>
          </div>
        </div>

        {/* Nav columns */}
        {cols.map(([h, xs]) => (
          <div key={h}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>{h}</div>
            {xs.map(x => (
              <a
                key={x}
                href="#"
                style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '5px 0', transition: 'color 0.15s ease' }}
              >
                {x}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1320,
        margin: '40px auto 0',
        paddingTop: 18,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
      }}>
        <div>© 2026 Ripe Lead, Inc. · 548 Market St, San Francisco</div>
        <div style={{ display: 'flex', gap: 18 }}>
          {['Privacy', 'Terms', 'DPA'].map(l => (
            <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

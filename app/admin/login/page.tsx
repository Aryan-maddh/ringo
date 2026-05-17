'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiFetch, saveAdminToken } from '@/lib/adminApi';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Pill } from '@/components/ringo/Pill';
import { RingoLogo } from '@/components/ringo/RingoLogo';
import { RINGO } from '@/components/ringo/tokens';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Login failed'); return; }
      saveAdminToken(data.access_token);
      router.push('/admin/dashboard');
    } catch {
      setError('Network error — is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex',
      background: '#0a0d20', fontFamily: RINGO.font.ui, color: RINGO.ink }}>

      {/* Left brand panel */}
      <div className="r-auth-brand-lg" style={{ position: 'relative', color: '#fff',
        background: 'radial-gradient(120% 120% at 0% 0%, #1f1f3a 0%, #0d1228 60%, #06081a 100%)',
        padding: '44px 48px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -180, top: -120, width: 480, height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side,rgba(124,58,237,0.55),transparent 70%)',
          filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', left: -120, bottom: -160, width: 520, height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side,rgba(6,182,212,0.45),transparent 70%)',
          filter: 'blur(2px)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RingoLogo size={30} light />
            <span style={{ padding: '2px 9px', borderRadius: 6,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN</span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: RINGO.font.mono }}>
            control-plane · prod-1
          </span>
        </div>

        <div style={{ position: 'relative', flex: 1, display: 'flex',
          flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 14 }}>
            Internal staff only
          </div>
          <h1 style={{ margin: 0, fontFamily: RINGO.font.head, fontSize: 46, fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Run the room <br />that runs the answers.
          </h1>
          <p style={{ marginTop: 18, fontSize: 15.5, lineHeight: 1.55,
            color: 'rgba(255,255,255,0.75)', maxWidth: 440 }}>
            Manage businesses across the United States.
            Restricted to authorized Ringo employees and contractors with active credentials.
          </p>

          <div style={{ marginTop: 36, padding: 18, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { l: 'API uptime · 90d',  v: '99.97%' },
              { l: 'SMS sent · 30d',    v: '1.42M' },
              { l: 'On-call engineer',  v: 'M. Ortiz' },
              { l: 'Session max',       v: '8 hours' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontWeight: 600 }}>{s.l}</div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 20, fontWeight: 700,
                  letterSpacing: '-0.02em', marginTop: 3 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 11.5, color: 'rgba(255,255,255,0.5)',
          display: 'flex', gap: 18 }}>
          <span>SOC 2 Type II</span><span>·</span><span>Audit log enabled</span>
          <span>·</span><span>Session 8h max</span>
        </div>
      </div>

      {/* Right form */}
      <div className="r-auth-form-pane" style={{ flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#fff', padding: '40px 56px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#6d28d9', fontWeight: 700, marginBottom: 10 }}>Sign in · admin</div>
          <h2 style={{ margin: 0, fontFamily: RINGO.font.head, fontSize: 32, fontWeight: 700,
            letterSpacing: '-0.02em', color: RINGO.ink }}>Welcome back, Ringonaut.</h2>
          <p style={{ marginTop: 8, fontSize: 14, color: RINGO.ink3, lineHeight: 1.55 }}>
            Use your <span style={{ color: RINGO.ink2, fontWeight: 600 }}>@ringo.app</span> credentials.
          </p>

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10,
              background: '#fde8ec', border: '1px solid #fca5a5',
              fontSize: 13, color: '#be123c' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14,
              margin: '22px 0 18px' }}>
              <div style={{ flex: 1, height: 1, background: RINGO.border }} />
              <span style={{ fontSize: 11, color: RINGO.ink3, letterSpacing: '0.08em',
                textTransform: 'uppercase', fontWeight: 600 }}>staff credentials</span>
              <div style={{ flex: 1, height: 1, background: RINGO.border }} />
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
              color: RINGO.ink2, marginBottom: 6 }}>Staff email</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderRadius: 11, background: '#fafbff',
              border: `1px solid ${RINGO.borderStrong}`, marginBottom: 14 }}>
              <Icon d={ICONS.user} size={15} stroke={2} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@ringo.app"
                required
                style={{ border: 'none', outline: 'none', background: 'transparent',
                  flex: 1, fontFamily: RINGO.font.ui, fontSize: 14, color: RINGO.ink }} />
            </div>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
              color: RINGO.ink2, marginBottom: 6 }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderRadius: 11, background: '#fafbff',
              border: `1px solid ${RINGO.borderStrong}`, marginBottom: 8 }}>
              <Icon d={ICONS.shld} size={15} stroke={2} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                style={{ border: 'none', outline: 'none', background: 'transparent',
                  flex: 1, fontFamily: RINGO.font.ui, fontSize: 14, color: RINGO.ink }} />
              <Pill tone="success" dot={false}>Secure</Pill>
            </div>
            <div style={{ fontSize: 12, color: RINGO.ink3, marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d={ICONS.clock} size={12} /> Session lasts 8 hours · auto-revoked on idle 30 min
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? '#a78bfa'
                  : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                color: '#fff', fontFamily: RINGO.font.ui, fontWeight: 700,
                fontSize: 14, letterSpacing: '0.01em',
                boxShadow: '0 14px 28px -12px rgba(124,58,237,0.55)' }}>
              {loading ? 'Signing in…' : 'Sign in to control plane'}
            </button>
          </form>

          <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 11,
            background: '#fff7ed', border: '1px solid #fed7aa',
            display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fb923c',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1 }}>
              <Icon d={ICONS.shld} size={12} />
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#9a3412' }}>
              All admin actions are recorded to the audit log and reviewed quarterly.
              Looking for the operator app?{' '}
              <a href="/login" style={{ color: '#9a3412', textDecoration: 'underline' }}>
                Go to app.ringo.app
              </a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

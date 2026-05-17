'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, saveToken } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { IconTile } from '@/components/ringo/IconTile';
import { RingoLogo } from '@/components/ringo/RingoLogo';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      saveToken(data.access_token);
      router.push('/dashboard');
    } catch {
      setError('Network error — is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff', fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      {/* LEFT — gradient brand panel */}
      <div className="r-auth-brand" style={{ position: 'relative', color: '#fff', padding: '36px 40px', background: 'radial-gradient(120% 90% at 0% 0%, #2a1659 0%, #0f3460 50%, #06081a 100%)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', right: -120, top: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(124,58,237,0.55),transparent)', filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', left: -100, bottom: -140, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(6,182,212,0.45),transparent)', filter: 'blur(20px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RingoLogo size={30} light />
        </div>
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
          <div style={{ fontFamily: RINGO.font.head, fontSize: 42, lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 700, maxWidth: 430 }}>
            Never miss a job because the phone went to voicemail.
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', marginTop: 18, maxWidth: 430 }}>
            Ringo answers missed calls with a friendly SMS in under 12 seconds, books the appointment, and drops the lead into your inbox.
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 30 }}>
            {[
              { v: '90%',  l: 'reply rate',   g: 'linear-gradient(135deg,#7c3aed,#06b6d4)' },
              { v: '11s',  l: 'avg response', g: 'linear-gradient(135deg,#059669,#06b6d4)' },
              { v: '$11k', l: 'recovered/mo', g: 'linear-gradient(135deg,#e11d48,#fb923c)' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ width: 24, height: 6, borderRadius: 3, background: s.g, marginBottom: 10 }} />
                <div style={{ fontFamily: RINGO.font.head, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.v}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30, padding: '18px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <Avatar name="Marco Reyes" size={40} />
            <div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
                &ldquo;Booked $4,200 in jobs my first weekend on Ringo. The texts feel like I wrote them — clients have no idea it&rsquo;s automated.&rdquo;
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>Marco R. · Pacific Plumbing, San Francisco</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="r-auth-form-pane" style={{ flex: 1, padding: '36px 56px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, fontSize: 13, color: RINGO.ink3 }}>
          New here?
          <a href="/onboarding" style={{ color: RINGO.ink, fontWeight: 600, textDecoration: 'none', padding: '7px 12px', borderRadius: 9, border: `1px solid ${RINGO.border}` }}>Start free trial</a>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '5px 10px', borderRadius: 99, background: '#f1ebff', color: '#6d28d9', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Welcome back</div>
          <h1 style={{ fontFamily: RINGO.font.head, fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', margin: '14px 0 8px', color: RINGO.ink }}>Sign in to Ringo</h1>
          <div style={{ fontSize: 13.5, color: RINGO.ink3, marginBottom: 24 }}>Pick up right where you left your business phone.</div>

          {/* SSO */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              {
                label: 'Continue with Google',
                icon: <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.5 2.3 2 6.8 2 12.3s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z" /></svg>,
              },
              {
                label: 'Continue with Apple',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M16.4 12.7c0-2.6 2.1-3.9 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.3.9 1.2 1.9 2.7 3.2 2.6 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-3 1.4-3-.1 0-2.6-1-2.6-3.9zM14 5.4c.7-.9 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.7.8-1.2 2-1 3.1 1.1.1 2.3-.6 2.9-1.4z" /></svg>,
              },
            ].map((s, i) => (
              <button key={i} type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 12px', borderRadius: 11, border: `1px solid ${RINGO.border}`, background: '#fff', color: RINGO.ink, fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {s.icon}<span>{s.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 18px' }}>
            <div style={{ flex: 1, height: 1, background: RINGO.border }} />
            <span style={{ fontSize: 11.5, color: RINGO.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: RINGO.border }} />
          </div>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 12, color: RINGO.ink2, fontWeight: 600, marginBottom: 6, display: 'block' }}>Work email</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: 11, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 14, color: RINGO.ink, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: RINGO.ink3 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                  <path d="M22 6 12 13 2 6" />
                </svg>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: RINGO.ink2, fontWeight: 600 }}>Password</label>
              <a href="#" style={{ fontSize: 12, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: 11, border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui, fontSize: 14, color: RINGO.ink, outline: 'none', background: '#fff', letterSpacing: '0.1em', boxSizing: 'border-box' }}
              />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: RINGO.ink3 }}>
                <Icon d={ICONS.shld} size={16} />
              </span>
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#b91c1c' }}>
                {error}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: RINGO.ink2, marginBottom: 18, cursor: 'pointer' }}>
              <span style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Icon d={ICONS.check} size={11} stroke={3} />
              </span>
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px 18px', borderRadius: 11, border: 'none', cursor: loading ? 'default' : 'pointer', background: loading ? '#a78bfa' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 14, fontWeight: 600, boxShadow: '0 12px 28px -10px rgba(124,58,237,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? 'Signing in…' : <>{`Sign in`} <Icon d={ICONS.arrow} size={15} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 12, background: '#f6f7fb', border: `1px solid ${RINGO.border}`, display: 'flex', gap: 12, alignItems: 'center' }}>
            <IconTile grad={RINGO.iEme} size={32} radius={9}><Icon d={ICONS.shld} size={15} /></IconTile>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>SOC 2 · TCPA-compliant SMS</div>
              <div style={{ fontSize: 11.5, color: RINGO.ink3, marginTop: 2 }}>Your call data is encrypted and never used to train models.</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, fontSize: 11.5, color: RINGO.ink3, flexWrap: 'wrap' }}>
          <span>© 2026 Ringo, Inc.</span>
          <a href="#" style={{ color: 'inherit' }}>Privacy</a>
          <a href="#" style={{ color: 'inherit' }}>Terms</a>
          <a href="#" style={{ color: 'inherit', marginLeft: 'auto' }}>Status · all systems normal</a>
        </div>
      </div>
    </div>
  );
}

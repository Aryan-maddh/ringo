'use client';

import React, { useEffect, useState } from 'react';
import { X, FileText, CheckCircle2, DollarSign, Mail, Phone, User, Building2, ArrowRight, Lock } from 'lucide-react';
import { RINGO } from '@/components/ringo/tokens';

const EVENT = 'ringo:open-inquiry';

export function openInquiry() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  business: string;
}

const EMPTY: FormState = { name: '', email: '', phone: '', business: '' };

const STATS = [
  { value: '2.4M+', label: 'Calls answered',    icon: FileText,     grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
  { value: '180K+', label: 'Jobs booked',       icon: CheckCircle2, grad: 'linear-gradient(135deg,#0284c7,#38bdf8)' },
  { value: '$18M+', label: 'Revenue recovered', icon: DollarSign,   grad: 'linear-gradient(135deg,#059669,#34d399)' },
];

interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

function InputField({ icon, label, required, type = 'text', value, onChange, placeholder, autoComplete }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#a855f7' }}> *</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px',
        borderRadius: 12,
        background: focused ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.12)'}`,
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}>
        <span style={{ color: focused ? '#a855f7' : 'rgba(255,255,255,0.45)', display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
        <input
          required={required}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent',
            border: 'none', outline: 'none',
            color: '#fff',
            fontSize: 14.5,
            fontFamily: RINGO.font.ui,
          }}
        />
      </div>
    </label>
  );
}

export function InquiryModal() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    const handle = () => { setOpen(true); setSubmitted(false); };
    window.addEventListener(EVENT, handle);
    return () => window.removeEventListener(EVENT, handle);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Front-end only — wire up to an endpoint later.
    setSubmitted(true);
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => { setForm(EMPTY); setSubmitted(false); }, 200);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request a consultation"
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(6,8,26,0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 48px) clamp(12px, 3vw, 24px)',
        overflowY: 'auto',
        animation: 'r-fade-in 0.2s ease both',
        fontFamily: RINGO.font.ui,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          marginTop: 'clamp(20px, 5vh, 60px)',
          marginBottom: 'auto',
          borderRadius: 24,
          background: 'linear-gradient(180deg,#11103a 0%,#0a0d2a 60%,#06081a 100%)',
          color: '#fff',
          boxShadow: '0 60px 120px -24px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.25)',
          overflow: 'hidden',
          animation: 'r-modal-in 0.32s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Top gradient bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg,#7c3aed,#06b6d4,#059669)' }} />

        {/* Aurora glow */}
        <div aria-hidden style={{ position: 'absolute', top: -120, left: '50%', width: 520, height: 320, transform: 'translateX(-50%)', background: 'radial-gradient(closest-side,rgba(124,58,237,0.4),transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Close */}
        <button
          aria-label="Close"
          onClick={close}
          style={{
            position: 'absolute',
            top: 16, right: 16,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 2,
          }}
        >
          <X size={16} />
        </button>

        <div style={{ position: 'relative', padding: 'clamp(28px, 5vw, 40px) clamp(22px, 4vw, 36px) clamp(24px, 4vw, 32px)' }}>
          {/* Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.25)' }} />
            Limited spots
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px -12px rgba(5,150,105,0.5)' }}>
                <CheckCircle2 size={32} color="#fff" strokeWidth={2.4} />
              </div>
              <h2 style={{ fontFamily: RINGO.font.head, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                Thanks — we got it.
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: '0 0 24px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                Our team will reach out within 24 hours to walk you through how Ripe Lead fits your business.
              </p>
              <button
                onClick={close}
                style={{
                  padding: '12px 28px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#fff',
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: RINGO.font.ui,
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: RINGO.font.head, fontSize: 'clamp(24px,3.4vw,30px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 8px' }}>
                Get in touch
              </h2>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.6)', margin: '0 0 22px', lineHeight: 1.55 }}>
                Tell us about your business and we&apos;ll reach out within 24 hours.
              </p>

              {/* Stat tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {STATS.map(s => {
                  const Ico = s.icon;
                  return (
                    <div key={s.label} style={{
                      padding: '14px 8px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      textAlign: 'center',
                    }}>
                      <div style={{ width: 32, height: 32, margin: '0 auto 8px', borderRadius: 10, background: s.grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -8px rgba(0,0,0,0.4)' }}>
                        <Ico size={16} color="#fff" strokeWidth={2.2} />
                      </div>
                      <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>{s.value}</div>
                      <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em', marginTop: 3 }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <InputField icon={<User size={15} />} label="Full name" required
                  value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))}
                  placeholder="Marcus Chen" autoComplete="name" />
                <InputField icon={<Mail size={15} />} label="Email" required type="email"
                  value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))}
                  placeholder="marcus@pacificplumbing.com" autoComplete="email" />
                <InputField icon={<Phone size={15} />} label="Phone" required type="tel"
                  value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))}
                  placeholder="(415) 555-0136" autoComplete="tel" />
                <InputField icon={<Building2 size={15} />} label="Business name"
                  value={form.business} onChange={v => setForm(f => ({ ...f, business: v }))}
                  placeholder="Pacific Plumbing" autoComplete="organization" />

                <button
                  type="submit"
                  style={{
                    marginTop: 6,
                    padding: '15px 24px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#06b6d4 100%)',
                    color: '#fff',
                    fontSize: 15, fontWeight: 700,
                    fontFamily: RINGO.font.ui,
                    cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 20px 40px -12px rgba(124,58,237,0.65)',
                    letterSpacing: '-0.005em',
                  }}
                >
                  Submit Inquiry <ArrowRight size={16} />
                </button>

                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
                  <Lock size={11} /> Your info is secure. We never share your data.
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

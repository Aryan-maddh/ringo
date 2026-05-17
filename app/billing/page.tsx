'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

interface BillingData {
  plan: string;
  plan_name: string;
  price: number;
  features: string[];
  has_subscription: boolean;
  all_plans: Record<string, { price: number; name: string; features: string[] }>;
}

const PLAN_GRADS: Record<string, string> = {
  starter: 'linear-gradient(135deg,#475569,#94a3b8)',
  growth: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
  pro: 'linear-gradient(135deg,#d97706,#fbbf24)',
};

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // handle Stripe redirect params
    const billing_result = searchParams.get('billing');
    if (billing_result === 'success') {
      setToast({ type: 'success', msg: 'Payment successful! Your plan has been upgraded.' });
    } else if (billing_result === 'cancel') {
      setToast({ type: 'error', msg: 'Checkout cancelled.' });
    }

    apiFetch('/api/billing')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setBilling(d); })
      .catch(() => {});
  }, [router, searchParams]);

  async function handleUpgrade(plan: string) {
    if (upgrading) return;
    setUpgrading(plan);
    try {
      const res = await apiFetch('/api/billing/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok && data.checkout_url) {
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = data.checkout_url;
      } else {
        setToast({ type: 'error', msg: data.error ?? 'Failed to start checkout' });
      }
    } catch {
      setToast({ type: 'error', msg: 'Network error' });
    } finally {
      setUpgrading(null);
    }
  }

  if (!mounted) return null;

  const plans = billing?.all_plans ?? {
    starter: { price: 29, name: 'Starter', features: ['50 auto-replies/mo', '1 phone number', 'Email support'] },
    growth:  { price: 79, name: 'Growth',  features: ['500 auto-replies/mo', '3 phone numbers', 'Priority support', 'Analytics'] },
    pro:     { price: 149, name: 'Pro',     features: ['Unlimited replies', '10 phone numbers', 'Dedicated support', 'API access', 'White-label'] },
  };
  const currentPlan = billing?.plan ?? 'starter';
  const cardBorder = `1px solid ${RINGO.border}`;

  return (
    <div className="r-app-shell" style={{ display: 'flex', minHeight: '100vh', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="bill" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar title="Plan & Billing" sub="Manage your Ringo subscription." />
        <div style={{ flex: 1, padding: '28px 40px', overflowY: 'auto' }}>

          {toast && (
            <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: toast.type === 'success' ? '#e7f7ee' : '#fef2f2', border: `1px solid ${toast.type === 'success' ? '#b9e4ca' : '#fecaca'}`, fontSize: 13, color: toast.type === 'success' ? '#075c3f' : '#b91c1c', display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon d={toast.type === 'success' ? ICONS.check : ICONS.shld} size={14} />
              {toast.msg}
              <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', opacity: 0.6 }}>×</button>
            </div>
          )}

          {/* Current plan banner */}
          {billing && (
            <div style={{ marginBottom: 28, padding: '20px 24px', borderRadius: 16, background: PLAN_GRADS[currentPlan], color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>Current plan</div>
                <div style={{ fontFamily: RINGO.font.head, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>{billing.plan_name}</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>${billing.price}/month · {billing.has_subscription ? 'Active subscription' : 'Free trial'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {billing.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.95 }}>
                    <Icon d={ICONS.check} size={13} stroke={2.5} /> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plan cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, maxWidth: 900 }}>
            {Object.entries(plans).map(([key, plan]) => {
              const isCurrent = key === currentPlan;
              const grad = PLAN_GRADS[key];
              return (
                <div key={key} style={{ background: '#fff', borderRadius: 16, border: isCurrent ? '2px solid #7c3aed' : cardBorder, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px 22px', background: isCurrent ? 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(6,182,212,0.04))' : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700, color: RINGO.ink }}>{plan.name}</div>
                      {isCurrent && (
                        <span style={{ padding: '3px 10px', borderRadius: 99, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 11, fontWeight: 700 }}>Current</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: RINGO.font.head, fontSize: 32, fontWeight: 800, color: RINGO.ink }}>${plan.price}</span>
                      <span style={{ fontSize: 13, color: RINGO.ink3 }}>/month</span>
                    </div>
                  </div>
                  <div style={{ padding: '18px 22px', borderTop: cardBorder, flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: RINGO.ink2 }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon d={ICONS.check} size={10} stroke={2.5} />
                          </span>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '14px 22px', borderTop: cardBorder }}>
                    {isCurrent ? (
                      <div style={{ padding: '10px 14px', borderRadius: 9, background: '#f6f7fb', textAlign: 'center', fontSize: 13, color: RINGO.ink3, fontWeight: 600 }}>Active plan</div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(key)}
                        disabled={!!upgrading}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: 'none', cursor: upgrading ? 'default' : 'pointer', background: upgrading === key ? '#a78bfa' : grad, color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: 600, boxShadow: '0 8px 18px -10px rgba(124,58,237,0.4)' }}
                      >
                        {upgrading === key ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: '#fff', border: cardBorder, display: 'flex', gap: 12, alignItems: 'center', maxWidth: 900 }}>
            <Icon d={ICONS.shld} size={18} />
            <div style={{ fontSize: 13, color: RINGO.ink2, lineHeight: 1.55 }}>
              All plans include a 14-day free trial. Cancel anytime. Powered by Stripe — your payment info is never stored on our servers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Billing() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}

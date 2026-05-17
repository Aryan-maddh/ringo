'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import type { Suite, TestResult } from '@/qa/test-all';

function ResultRow({ test }: { test: TestResult }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 0',
      borderBottom: `1px solid ${RINGO.border}`,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: test.passed ? '#d1fae5' : '#fee2e2',
      }}>
        <Icon d={test.passed ? ICONS.check : ICONS.x} size={11} stroke={2.5} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: RINGO.ink, lineHeight: 1.4, fontWeight: test.passed ? 400 : 600 }}>
          {test.name}
        </div>
        {!test.passed && test.reason && (
          <div style={{ marginTop: 4, fontSize: 12, color: '#b91c1c', fontFamily: RINGO.font.mono, lineHeight: 1.5, wordBreak: 'break-word' }}>
            {test.reason}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: RINGO.ink3, fontFamily: RINGO.font.mono, flexShrink: 0, marginTop: 2 }}>
        {test.ms}ms
      </div>
    </div>
  );
}

function SuiteCard({ suite }: { suite: Suite }) {
  const pass = suite.tests.filter(t => t.passed).length;
  const fail = suite.tests.filter(t => !t.passed).length;
  const allPass = fail === 0;
  const [open, setOpen] = useState(!allPass);

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${allPass ? '#bbf7d0' : '#fecaca'}`,
      overflow: 'hidden', marginBottom: 12,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: allPass ? '#10b981' : '#ef4444',
        }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: RINGO.font.head, fontSize: 15, fontWeight: 700, color: RINGO.ink }}>
            {suite.category}
          </span>
          <span style={{ marginLeft: 10, fontSize: 12.5, color: RINGO.ink3 }}>
            {pass}/{suite.tests.length} passed
          </span>
        </div>
        {fail > 0 && (
          <span style={{ padding: '2px 8px', borderRadius: 99, background: '#fee2e2', color: '#b91c1c', fontSize: 11.5, fontWeight: 700 }}>
            {fail} failed
          </span>
        )}
        <Icon
          d={open ? ICONS.chev : ICONS.chevR}
          size={14}
        />
      </button>
      {open && (
        <div style={{ padding: '0 18px 12px' }}>
          {suite.tests.map((t, i) => <ResultRow key={i} test={t} />)}
        </div>
      )}
    </div>
  );
}

export default function QaPage() {
  const [suites, setSuites] = useState<Suite[] | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const { runAllTests } = await import('@/qa/test-all');
      const results = await runAllTests();
      setSuites(results);
      setLastRun(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
  }, [run]);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: RINGO.font.ui }}>
        <div style={{ fontSize: 14, color: RINGO.ink3 }}>QA page is only available in development mode.</div>
      </div>
    );
  }

  const totalPass = suites?.reduce((s, suite) => s + suite.tests.filter(t => t.passed).length, 0) ?? 0;
  const totalFail = suites?.reduce((s, suite) => s + suite.tests.filter(t => !t.passed).length, 0) ?? 0;
  const total = totalPass + totalFail;
  const pct = total > 0 ? Math.round((totalPass / total) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      {/* header */}
      <div style={{
        background: '#fff', borderBottom: `1px solid ${RINGO.border}`,
        padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>
              QA Dashboard
            </div>
            <span style={{ padding: '3px 9px', borderRadius: 99, background: 'linear-gradient(135deg,#7c3aed22,#06b6d422)', color: '#7c3aed', fontSize: 11, fontWeight: 700, border: '1px solid #7c3aed44' }}>
              DEV ONLY
            </span>
          </div>
          {lastRun && (
            <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 3 }}>
              Last run: {lastRun.toLocaleTimeString()}
              {total > 0 && (
                <span style={{
                  marginLeft: 10, fontWeight: 600,
                  color: pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#e11d48',
                }}>
                  {totalPass}/{total} passed ({pct}%)
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={run}
          disabled={running}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: running ? '#a78bfa' : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: 600,
            cursor: running ? 'default' : 'pointer',
            boxShadow: '0 8px 18px -10px rgba(124,58,237,0.5)',
          }}
        >
          <Icon d={running ? ICONS.clock : ICONS.zap} size={14} />
          {running ? 'Running…' : 'Re-run all tests'}
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>
        {/* summary bar */}
        {suites && total > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24,
          }}>
            {[
              { label: 'Total', value: total, color: RINGO.ink },
              { label: 'Passed', value: totalPass, color: '#059669' },
              { label: 'Failed', value: totalFail, color: totalFail > 0 ? '#e11d48' : '#059669' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${RINGO.border}`, padding: '14px 18px' }}>
                <div style={{ fontSize: 28, fontFamily: RINGO.font.head, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: RINGO.ink3, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* score bar */}
        {suites && total > 0 && (
          <div style={{ marginBottom: 24, background: '#fff', borderRadius: 12, border: `1px solid ${RINGO.border}`, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
              <span>Overall score</span>
              <span style={{ color: pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#e11d48' }}>{pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: '#f1f3f9', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${pct}%`,
                background: pct >= 90 ? 'linear-gradient(90deg,#059669,#06b6d4)'
                  : pct >= 70 ? 'linear-gradient(90deg,#d97706,#fbbf24)'
                  : 'linear-gradient(90deg,#e11d48,#f97316)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}

        {/* loading */}
        {running && !suites && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: RINGO.ink3, fontSize: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
            Running tests against localhost:5000…
          </div>
        )}

        {/* error */}
        {error && (
          <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
            <strong>Error running tests:</strong> {error}
          </div>
        )}

        {/* results */}
        {suites && suites.map((suite, i) => <SuiteCard key={i} suite={suite} />)}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { RINGO } from '@/components/ringo/tokens';
import { Icon, ICONS } from '@/components/ringo/Icon';
import { Avatar } from '@/components/ringo/Avatar';
import { Pill } from '@/components/ringo/Pill';
import { Sidebar } from '@/components/ringo/Sidebar';
import { Topbar } from '@/components/ringo/Topbar';

// ── Types ──────────────────────────────────────────────────────────────────

interface CallLog {
  id: number;
  caller_number: string;
  caller_name: string | null;
  call_status: string;
  duration_seconds: number;
  emergency: boolean;
  created_at: string;
}

interface SmsMessage {
  id: number;
  call_log_id: number;
  message: string;
  status: string;
  created_at: string;
  caller_number: string;
  caller_name: string | null;
  emergency: boolean;
}

interface Conversation {
  caller_number: string;
  caller_name: string | null;
  emergency: boolean;
  last_call_at: string;
  call_count: number;
  messages: SmsMessage[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function fmtPhone(num: string): string {
  const d = num.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') {
    const n = d.slice(1);
    return `+1 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
  }
  return num;
}

function fmtDur(sec: number): string {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const STATUS_TONE: Record<string, 'info' | 'success' | 'danger' | 'warn' | 'neutral'> = {
  missed: 'warn', answered: 'success', voicemail: 'info', incoming: 'info', 'manual-reply': 'neutral',
};

// ── Call Log Tab ───────────────────────────────────────────────────────────

type CallFilter = 'all' | 'missed' | 'emergency' | 'sms_sent';

function CallLogTab() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<CallFilter>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: CallFilter) => {
    setLoading(true);
    try {
      let url = '/api/calls?per_page=50';
      if (f === 'missed') url += '&status=missed';
      if (f === 'emergency') url += '&emergency=true';
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls ?? []);
        setTotal(data.total ?? 0);
      }
    } catch { /* keep state */ } finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(filter); }, [filter, load]);

  const filters: { id: CallFilter; label: string }[] = [
    { id: 'all', label: 'All calls' },
    { id: 'missed', label: 'Missed' },
    { id: 'emergency', label: 'Emergency' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* filter strip */}
      <div style={{ padding: '14px 24px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: RINGO.font.ui, fontSize: 12.5, fontWeight: 600,
            background: filter === f.id ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#f6f7fb',
            color: filter === f.id ? '#fff' : RINGO.ink2,
          }}>{f.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: RINGO.ink3 }}>{total} calls</span>
      </div>

      {/* table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
        ) : calls.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📞</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: RINGO.ink, marginBottom: 6 }}>No calls yet</div>
            <div style={{ fontSize: 13, color: RINGO.ink3 }}>
              {filter === 'all' ? 'Calls will appear here once Ringo starts receiving them.' : `No ${filter} calls to show.`}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: RINGO.font.ui, fontSize: 13, marginTop: 16 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: RINGO.ink3, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {['Caller', 'When', 'Duration', 'Status', 'Tags'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', borderBottom: `1px solid ${RINGO.border}`, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls.map(cl => (
                <tr key={cl.id} style={{ color: RINGO.ink }}>
                  <td style={{ padding: '12px 12px', borderBottom: `1px solid ${RINGO.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={cl.caller_name || cl.caller_number} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{cl.caller_name || 'Unknown'}</div>
                        <div style={{ color: RINGO.ink3, fontSize: 11.5, fontFamily: RINGO.font.mono }}>{fmtPhone(cl.caller_number)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, color: RINGO.ink2, fontSize: 12.5 }}>{relTime(cl.created_at)} ago</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.mono, color: RINGO.ink2, fontSize: 12.5 }}>{fmtDur(cl.duration_seconds)}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                    <Pill tone={STATUS_TONE[cl.call_status] ?? 'neutral'}>{cl.call_status}</Pill>
                  </td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${RINGO.border}` }}>
                    {cl.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Bubble ─────────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: SmsMessage }) {
  const isOut = true; // all auto-replies are outbound
  return (
    <div style={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ padding: '10px 14px', borderRadius: isOut ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isOut ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#fff', color: isOut ? '#fff' : RINGO.ink, border: isOut ? 'none' : `1px solid ${RINGO.border}`, fontSize: 13.5, lineHeight: 1.55, boxShadow: isOut ? '0 8px 18px -10px rgba(124,58,237,0.4)' : 'none' }}>
          {msg.message}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 10.5, color: RINGO.ink3, fontFamily: RINGO.font.mono, justifyContent: isOut ? 'flex-end' : 'flex-start', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#6d28d9', fontWeight: 600 }}><Icon d={ICONS.ai} size={10} /> AUTO-REPLIED</span>
          <span>{relTime(msg.created_at)}</span>
          <span style={{ color: msg.status === 'sent' ? '#059669' : msg.status === 'failed' ? '#e11d48' : RINGO.ink3 }}>· {msg.status}</span>
        </div>
      </div>
    </div>
  );
}

// ── SMS Thread panel ───────────────────────────────────────────────────────

function ThreadPanel({ conv, onReplySent }: { conv: Conversation; onReplySent: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  async function handleSend() {
    const msg = replyText.trim();
    if (!msg) return;
    setSending(true);
    setSendError('');
    try {
      const res = await apiFetch('/api/sms/reply', {
        method: 'POST',
        body: JSON.stringify({ to: conv.caller_number, message: msg }),
      });
      if (res.ok) {
        setReplyText('');
        onReplySent();
      } else {
        const d = await res.json();
        setSendError(d.error ?? 'Failed to send');
      }
    } catch {
      setSendError('Network error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>
      {/* header */}
      <div style={{ padding: '14px 22px', background: '#fff', borderBottom: `1px solid ${RINGO.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar name={conv.caller_name || conv.caller_number} size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: RINGO.font.head, fontSize: 16, fontWeight: 700 }}>{conv.caller_name || 'Unknown caller'}</div>
            {conv.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
          </div>
          <div style={{ fontSize: 12, color: RINGO.ink3, fontFamily: RINGO.font.mono, marginTop: 2 }}>{fmtPhone(conv.caller_number)} · {conv.call_count} call{conv.call_count !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* messages */}
      <div style={{ flex: 1, padding: '20px 22px', overflowY: 'auto' }}>
        {conv.messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: RINGO.ink3, fontSize: 13, paddingTop: 40 }}>No messages yet for this caller.</div>
        ) : (
          [...conv.messages].reverse().map(msg => <Bubble key={msg.id} msg={msg} />)
        )}
      </div>

      {/* reply box */}
      <div style={{ padding: '14px 22px', background: '#fff', borderTop: `1px solid ${RINGO.border}` }}>
        {sendError && (
          <div style={{ marginBottom: 8, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12.5, color: '#b91c1c' }}>{sendError}</div>
        )}
        <div style={{ padding: '10px 14px', borderRadius: 14, border: `1px solid ${RINGO.border}`, background: '#fff' }}>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={`Reply to ${fmtPhone(conv.caller_number)}…`}
            rows={2}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: RINGO.font.ui, fontSize: 13.5, color: RINGO.ink, resize: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 11, color: RINGO.ink3, fontFamily: RINGO.font.mono }}>{replyText.length}/1600</span>
          <button
            onClick={handleSend}
            disabled={sending || !replyText.trim()}
            style={{ marginLeft: 'auto', padding: '9px 16px', borderRadius: 9, border: 'none', cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer', background: replyText.trim() ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : '#e8eaef', color: replyText.trim() ? '#fff' : RINGO.ink3, fontFamily: RINGO.font.ui, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: replyText.trim() ? '0 8px 18px -10px rgba(124,58,237,0.5)' : 'none' }}
          >
            <Icon d={ICONS.send} size={13} /> {sending ? 'Sending…' : 'Send SMS'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SMS Conversations Tab ──────────────────────────────────────────────────

function SmsTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sms/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
        setTotal(data.total ?? 0);
      }
    } catch { /* keep state */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, [load]);

  const selectedConv = conversations.find(c => c.caller_number === selectedNumber) ?? null;

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* thread list */}
      <div style={{ width: 320, flex: '0 0 320px', background: '#fff', borderRight: `1px solid ${RINGO.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${RINGO.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontFamily: RINGO.font.head, fontSize: 18, fontWeight: 700 }}>Conversations</h2>
            <span style={{ padding: '2px 8px', borderRadius: 99, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{total}</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: RINGO.ink3, fontSize: 13 }}>Loading…</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: RINGO.ink3 }}>
              No conversations yet. SMS replies will appear here.
            </div>
          ) : conversations.map((conv) => {
            const lastMsg = conv.messages[0];
            const isSelected = conv.caller_number === selectedNumber;
            return (
              <div key={conv.caller_number} onClick={() => setSelectedNumber(conv.caller_number)} style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${RINGO.border}`, background: isSelected ? 'linear-gradient(90deg,rgba(124,58,237,0.06),transparent 60%)' : '#fff', borderLeft: `3px solid ${isSelected ? '#7c3aed' : 'transparent'}`, cursor: 'pointer' }}>
                <Avatar name={conv.caller_name || conv.caller_number} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.caller_name || fmtPhone(conv.caller_number)}
                    </div>
                    <div style={{ fontSize: 11, color: RINGO.ink3, fontFamily: RINGO.font.mono, flexShrink: 0 }}>{relTime(conv.last_call_at)}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: RINGO.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {lastMsg ? lastMsg.message : 'No messages'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                    {conv.emergency && <Pill tone="danger" dot={false}>Emergency</Pill>}
                    {lastMsg && <Pill tone={lastMsg.status === 'sent' ? 'success' : 'neutral'} dot={false}>{lastMsg.status}</Pill>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* thread panel */}
      {selectedConv ? (
        <ThreadPanel conv={selectedConv} onReplySent={load} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: RINGO.ink3 }}>
          <div style={{ fontSize: 40 }}>💬</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: RINGO.ink }}>Select a conversation</div>
          <div style={{ fontSize: 13 }}>Pick a thread from the left to read and reply.</div>
        </div>
      )}
    </div>
  );
}

// ── Inbox page ─────────────────────────────────────────────────────────────

type Tab = 'calls' | 'sms';

export default function Inbox() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('sms');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="r-app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: RINGO.bg, fontFamily: RINGO.font.ui, color: RINGO.ink }}>
      <Sidebar active="sms" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Inbox" sub="Messages and call log for your business." />

        {/* tab switcher */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${RINGO.border}`, padding: '0 24px', display: 'flex', gap: 0 }}>
          {(['sms', 'calls'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? '#7c3aed' : RINGO.ink2,
              borderBottom: `2px solid ${tab === t ? '#7c3aed' : 'transparent'}`,
              marginBottom: -1,
            }}>
              {t === 'sms' ? '💬 Messages' : '📞 Call Log'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {tab === 'calls' ? <CallLogTab /> : <SmsTab />}
        </div>
      </div>
    </div>
  );
}

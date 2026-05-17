import React from 'react';

export type ChannelKey = 'sms' | 'wa' | 'ig' | 'fb' | 'gbm' | 'msgr' | 'call' | 'cal' | 'vm' | 'check';

export const CHANNEL_META: Record<ChannelKey, { label: string; grad: string; ring: string }> = {
  sms:  { label: 'SMS',       grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)',          ring: 'rgba(124,58,237,0.5)' },
  wa:   { label: 'WhatsApp',  grad: 'linear-gradient(135deg,#25d366,#128c7e)',          ring: 'rgba(37,211,102,0.5)' },
  ig:   { label: 'Instagram', grad: 'linear-gradient(135deg,#f58529,#dd2a7b 50%,#8134af)', ring: 'rgba(221,42,123,0.5)' },
  fb:   { label: 'Facebook',  grad: 'linear-gradient(135deg,#1877f2,#00b2ff)',          ring: 'rgba(24,119,242,0.5)' },
  gbm:  { label: 'Google Business', grad: 'linear-gradient(135deg,#4285f4,#34a853)',    ring: 'rgba(66,133,244,0.5)' },
  msgr: { label: 'Messenger', grad: 'linear-gradient(135deg,#0084ff,#a033ff,#ff0099)',  ring: 'rgba(160,51,255,0.5)' },
  call: { label: 'Call',      grad: 'linear-gradient(135deg,#06b6d4,#0891b2)',          ring: 'rgba(6,182,212,0.5)' },
  cal:  { label: 'Calendar',  grad: 'linear-gradient(135deg,#059669,#34d399)',          ring: 'rgba(5,150,105,0.5)' },
  vm:   { label: 'Voicemail', grad: 'linear-gradient(135deg,#d97706,#fbbf24)',          ring: 'rgba(217,119,6,0.5)' },
  check:{ label: 'Booked',    grad: 'linear-gradient(135deg,#7c3aed,#06b6d4)',          ring: 'rgba(124,58,237,0.5)' },
};

export function ChannelGlyph({ ch, size = 18 }: { ch: ChannelKey; size?: number }) {
  const s = size;
  const stroke = '#fff';
  const sw = 2.2;
  switch (ch) {
    case 'wa':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 3a9 9 0 0 0-7.74 13.6L3 21l4.55-1.2A9 9 0 1 0 12 3Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
          <path d="M8.6 8.6c.3-.8 1-1.2 1.6-1.1.6.1.5 1 .8 1.7.2.5-.4.8-.5 1.2-.1.4 1.2 2.2 2.6 2.6.4-.1.7-.7 1.2-.5.7.3 1.6.2 1.7.8.1.6-.3 1.3-1.1 1.6-2 .7-5.9-3.2-5.2-5.2-.3.1-.3-.1-1.1-1.1Z" fill={stroke}/>
        </svg>
      );
    case 'ig':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke={stroke} strokeWidth={sw}/>
          <circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth={sw}/>
          <circle cx="17.5" cy="6.5" r="1" fill={stroke}/>
        </svg>
      );
    case 'fb':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M13 22v-8h2.5l.5-3H13V9c0-1 .3-1.7 1.7-1.7H16V4.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9V11H7.5v3H10v8h3Z" fill={stroke}/>
        </svg>
      );
    case 'msgr':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 3C6.8 3 3 6.8 3 11.4c0 2.5 1.2 4.8 3.1 6.3v3.4l3-1.6c.9.3 1.9.4 2.9.4 5.2 0 9-3.8 9-8.4S17.2 3 12 3Z" stroke={stroke} strokeWidth={sw}/>
          <path d="m5 14 4-4 2 2 4-3 4 5" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
        </svg>
      );
    case 'gbm':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
          <circle cx="9" cy="10" r="1.3" fill={stroke}/>
          <circle cx="12" cy="10" r="1.3" fill={stroke}/>
          <circle cx="15" cy="10" r="1.3" fill={stroke}/>
        </svg>
      );
    case 'sms':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5l-4 4v-4H6a2 2 0 0 1-2-2V6Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
        </svg>
      );
    case 'call':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
        </svg>
      );
    case 'cal':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke={stroke} strokeWidth={sw}/>
          <path d="M3.5 10h17M8 3v4M16 3v4" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <circle cx="12" cy="15" r="1.5" fill={stroke}/>
        </svg>
      );
    case 'vm':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="7" cy="14" r="3.5" stroke={stroke} strokeWidth={sw}/>
          <circle cx="17" cy="14" r="3.5" stroke={stroke} strokeWidth={sw}/>
          <path d="M7 17.5h10" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
        </svg>
      );
    case 'check':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="m5 12.5 4.5 4.5L19 7" stroke={stroke} strokeWidth={sw + 0.4} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
  }
}

export function ChannelTile({ ch, size = 36, radius = 10 }: { ch: ChannelKey; size?: number; radius?: number }) {
  const meta = CHANNEL_META[ch];
  return (
    <span style={{
      width: size, height: size, borderRadius: radius,
      background: meta.grad,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 10px 20px -10px ${meta.ring}`,
      flex: '0 0 auto',
    }}>
      <ChannelGlyph ch={ch} size={Math.round(size * 0.5)} />
    </span>
  );
}

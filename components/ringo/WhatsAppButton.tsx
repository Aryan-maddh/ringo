'use client';

// Floating WhatsApp contact button, fixed to the bottom-right of every page.
// NOTE: replace WHATSAPP_NUMBER with your real WhatsApp business number
// (international format, digits only — no "+", spaces or dashes).
const WHATSAPP_NUMBER = '15555550136';
const PREFILLED_MESSAGE = 'Hi! I’d like to know more about Ripe Lead.';

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: 'fixed',
        right: 'clamp(16px, 3vw, 28px)',
        bottom: 'clamp(16px, 3vw, 28px)',
        zIndex: 60,
        width: 58,
        height: 58,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#25d366,#128c7e)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 28px -6px rgba(37,211,102,0.55), 0 2px 8px rgba(0,0,0,0.18)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="r-wa-fab"
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff" aria-hidden>
        <path d="M16.04 3.2c-7.06 0-12.8 5.73-12.8 12.79 0 2.26.6 4.47 1.73 6.42L3.2 28.8l6.56-1.72a12.74 12.74 0 0 0 6.28 1.6h.01c7.05 0 12.79-5.73 12.79-12.79 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.05-3.64Zm0 23.31h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.56 10.56 0 0 1-1.62-5.64c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.11 7.52c0 5.87-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.3 3.29.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z"/>
      </svg>
    </a>
  );
}

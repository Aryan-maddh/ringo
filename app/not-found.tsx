import Link from 'next/link';
import { RINGO } from '@/components/ringo/tokens';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: RINGO.bg, fontFamily: RINGO.font.ui }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
        <div style={{ fontFamily: RINGO.font.head, fontSize: 96, fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontFamily: RINGO.font.head, fontSize: 26, fontWeight: 700, color: RINGO.ink, margin: '16px 0 12px' }}>Page not found</h1>
        <p style={{ fontSize: 14, color: RINGO.ink3, lineHeight: 1.6, marginBottom: 28 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 11, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff', fontFamily: RINGO.font.ui, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', boxShadow: '0 10px 22px -10px rgba(124,58,237,0.55)' }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

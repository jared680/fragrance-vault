import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function LandingPage() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Theme toggle — top right */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-up" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        {/* Logo mark */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
          }}>
            🫙
          </div>
        </div>

        <h1 className="font-display" style={{
          fontSize: '52px',
          fontWeight: 300,
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: '14px',
        }}>
          Fragrance
          <br />
          <em>Vault</em>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '15px',
          marginBottom: '48px',
          lineHeight: 1.65,
          fontWeight: 300,
        }}>
          Your personal fragrance intelligence platform.
          <br />
          Track, discover, and wear smarter.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/auth/login" style={{
            display: 'block',
            padding: '15px 24px',
            background: 'var(--accent)',
            color: '#0c0c0e',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
            textAlign: 'center',
            boxShadow: '0 2px 8px var(--accent-dim)',
          }}>
            Sign in
          </Link>
          <Link href="/auth/signup" style={{
            display: 'block',
            padding: '15px 24px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 400,
            fontSize: '15px',
            textAlign: 'center',
            border: '1px solid var(--border-medium)',
          }}>
            Create account
          </Link>
        </div>
      </div>

      <p style={{
        position: 'absolute',
        bottom: '24px',
        color: 'var(--text-muted)',
        fontSize: '12px',
        letterSpacing: '0.3px',
      }}>
        Private. No social features. Just your collection.
      </p>
    </main>
  )
}

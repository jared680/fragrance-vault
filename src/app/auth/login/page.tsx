'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main style={styles.main}>
      <div style={styles.ambient} />

      <div className="animate-fade-up" style={styles.card}>
        <div style={styles.header}>
          <Link href="/" style={styles.backLink}>← Back</Link>
          <h1 className="font-display" style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your vault</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="you@example.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <button onClick={handleGoogle} style={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={styles.footer}>
          No account?{' '}
          <Link href="/auth/signup" style={styles.link}>Create one</Link>
        </p>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--bg-primary)',
    position: 'relative',
    overflow: 'hidden',
  },
  ambient: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: '32px 28px',
  },
  header: { marginBottom: '28px' },
  backLink: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    marginBottom: '6px',
    fontStyle: 'italic',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: 300,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 },
  input: {
    padding: '12px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
  },
  error: {
    color: 'var(--error)',
    fontSize: '13px',
    background: 'rgba(194,107,107,0.1)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
  },
  primaryBtn: {
    padding: '13px',
    background: 'var(--accent)',
    color: '#0c0c0e',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    marginTop: '4px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border-subtle)',
  },
  dividerText: { color: 'var(--text-muted)', fontSize: '12px' },
  googleBtn: {
    width: '100%',
    padding: '13px',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 400,
    fontSize: '15px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  footer: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    marginTop: '20px',
  },
  link: { color: 'var(--accent)', textDecoration: 'none' },
}

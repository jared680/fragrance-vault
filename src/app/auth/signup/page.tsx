'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main style={styles.main}>
        <div className="animate-fade-up" style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
            <h2 className="font-display" style={{ ...styles.title, marginBottom: '12px' }}>
              Check your email
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Click it to activate your account.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <div style={styles.ambient} />
      <div className="animate-fade-up" style={styles.card}>
        <div style={styles.header}>
          <Link href="/" style={styles.backLink}>← Back</Link>
          <h1 className="font-display" style={styles.title}>Create your vault</h1>
          <p style={styles.subtitle}>Start tracking your collection</p>
        </div>

        <form onSubmit={handleSignup} style={styles.form}>
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
              minLength={6}
              style={styles.input}
              placeholder="Min. 6 characters"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have one?{' '}
          <Link href="/auth/login" style={styles.link}>Sign in</Link>
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
    bottom: '-100px',
    left: '-100px',
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
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 300 },
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
  footer: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    marginTop: '20px',
  },
  link: { color: 'var(--accent)', textDecoration: 'none' },
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { UserCollection, WearLog } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [collection, setCollection] = useState<UserCollection[]>([])
  const [recentWears, setRecentWears] = useState<WearLog[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const [collectionRes, wearRes] = await Promise.all([
        supabase
          .from('user_collections')
          .select('*, fragrance:fragrances(*)')
          .eq('user_id', user.id)
          .eq('ownership_type', 'owned'),
        supabase
          .from('wear_logs')
          .select('*, fragrance:fragrances(name, brand, image_url)')
          .eq('user_id', user.id)
          .order('worn_at', { ascending: false })
          .limit(5),
      ])

      if (collectionRes.data) setCollection(collectionRes.data)
      if (wearRes.data) setRecentWears(wearRes.data)
      setLoading(false)
    }
    loadDashboard()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return <LoadingSkeleton />

  const ownedCount  = collection.filter(c => c.ownership_type === 'owned').length
  const wishlistCount = collection.filter(c => c.ownership_type === 'wishlist').length

  return (
    <main className="page-main" style={{ position: 'relative' }}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <p style={styles.greeting}>{greeting()}</p>
          <h1 className="font-display" style={styles.title}>Your Vault</h1>
        </div>
        <button onClick={handleSignOut} style={styles.signOutBtn}>
          Sign out
        </button>
      </header>

      {/* Ambient glow */}
      <div style={styles.ambient} />

      {/* Today's recommendation CTA */}
      <Link href="/wear/recommend" style={styles.recommendCard}>
        <div style={styles.recommendInner}>
          <div>
            <p style={styles.recommendLabel}>✦ Daily Intelligence</p>
            <h2 className="font-display" style={styles.recommendTitle}>
              What should I<br />wear today?
            </h2>
          </div>
          <div style={styles.recommendArrow}>→</div>
        </div>
        <div style={styles.recommendGlow} />
      </Link>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <StatCard label="In collection" value={ownedCount} />
        <StatCard label="Wishlisted"    value={wishlistCount} />
        <StatCard label="Wears logged"  value={recentWears.length > 0 ? recentWears.length : '0'} />
      </div>

      {/* Recent wears */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Recent wears</h3>
          <Link href="/wear" style={styles.seeAll}>See all</Link>
        </div>

        {recentWears.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No wears logged yet.{' '}
              <Link href="/wear/log" style={{ color: 'var(--accent)' }}>Log your first</Link>
            </p>
          </div>
        ) : (
          <div style={styles.wearList}>
            {recentWears.map(wear => (
              <div key={wear.id} style={styles.wearItem}>
                <div style={styles.wearDot} />
                <div style={{ flex: 1 }}>
                  <p style={styles.wearName}>{wear.fragrance?.name ?? 'Unknown'}</p>
                  <p style={styles.wearMeta}>
                    {wear.fragrance?.brand} · {new Date(wear.worn_at).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                {wear.occasion && <span style={styles.badge}>{wear.occasion}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick actions</h3>
        <div style={styles.quickActions}>
          <Link href="/collection/add" style={styles.actionBtn}>+ Add fragrance</Link>
          <Link href="/wear/log"       style={styles.actionBtnSecondary}>Log a wear</Link>
        </div>
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 12px',
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <p style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {value}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <main className="page-main">
      <div style={{ height: '40px', background: 'var(--bg-card)', borderRadius: '8px', marginBottom: '24px' }} />
      <div style={{ height: '140px', background: 'var(--bg-card)', borderRadius: '18px', marginBottom: '16px' }} />
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '70px', background: 'var(--bg-card)', borderRadius: '12px' }} />)}
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '28px',
  },
  greeting: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' },
  title: { fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)', fontStyle: 'italic' },
  signOutBtn: {
    background: 'transparent', border: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)', fontSize: '12px', padding: '6px 12px',
    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-body)',
  },
  ambient: {
    position: 'absolute', top: 0, right: '-60px',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  recommendCard: {
    display: 'block',
    background: 'linear-gradient(135deg, var(--accent-dim) 0%, transparent 100%)',
    border: '1px solid rgba(201,169,110,0.25)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 24px',
    textDecoration: 'none',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  recommendInner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    position: 'relative', zIndex: 1,
  },
  recommendLabel: {
    fontSize: '11px', color: 'var(--accent)', letterSpacing: '1px',
    textTransform: 'uppercase', marginBottom: '10px', fontWeight: 500,
  },
  recommendTitle: {
    fontSize: '28px', fontWeight: 400, color: 'var(--text-primary)',
    lineHeight: 1.2, fontStyle: 'italic',
  },
  recommendArrow: { fontSize: '24px', color: 'var(--accent)', marginBottom: '4px' },
  recommendGlow: {
    position: 'absolute', top: '-40px', right: '-40px',
    width: '160px', height: '160px', borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
  },
  statsRow: { display: 'flex', gap: '10px', marginBottom: '28px' },
  section: { marginBottom: '28px' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.8px',
  },
  seeAll: { fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' },
  emptyState: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center',
  },
  wearList: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  wearItem: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)',
  },
  wearDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: 'var(--accent)', flexShrink: 0,
  },
  wearName: { fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px' },
  wearMeta: { fontSize: '12px', color: 'var(--text-muted)' },
  badge: {
    fontSize: '11px', padding: '3px 8px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: '20px',
    color: 'var(--text-secondary)', whiteSpace: 'nowrap',
  },
  quickActions: { display: 'flex', gap: '10px' },
  actionBtn: {
    flex: 1, padding: '13px', background: 'var(--accent)', color: '#0c0c0e',
    borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600,
    fontSize: '14px', textAlign: 'center', display: 'block',
    boxShadow: '0 2px 8px var(--accent-dim)',
  },
  actionBtnSecondary: {
    flex: 1, padding: '13px', background: 'var(--bg-card)', color: 'var(--text-primary)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    textDecoration: 'none', fontWeight: 400, fontSize: '14px',
    textAlign: 'center', display: 'block',
  },
}

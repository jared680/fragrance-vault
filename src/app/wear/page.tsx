'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { WearLog } from '@/types'

export default function WearPage() {
  const [wears, setWears] = useState<WearLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('wear_logs')
        .select('*, fragrance:fragrances(name, brand)')
        .eq('user_id', user.id)
        .order('worn_at', { ascending: false })

      if (data) setWears(data)
      setLoading(false)
    }
    load()
  }, [])

  // Group by month
  const grouped = wears.reduce<Record<string, WearLog[]>>((acc, w) => {
    const key = new Date(w.worn_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(w)
    return acc
  }, {})

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 className="font-display" style={styles.title}><em>Wear History</em></h1>
        <Link href="/wear/log" style={styles.logBtn}>+ Log wear</Link>
      </header>

      <Link href="/wear/recommend" style={styles.recommendBanner}>
        <span>✦ What should I wear today?</span>
        <span>→</span>
      </Link>

      {loading ? (
        <div style={{ padding: '32px 0' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '60px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '8px' }} />)}
        </div>
      ) : wears.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🕰</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>No wears logged yet.</p>
          <Link href="/wear/log" style={styles.emptyAction}>Log your first wear →</Link>
        </div>
      ) : (
        Object.entries(grouped).map(([month, items]) => (
          <div key={month} style={styles.monthGroup}>
            <p style={styles.monthLabel}>{month}</p>
            <div style={styles.wearList}>
              {items.map(wear => (
                <div key={wear.id} style={styles.wearItem}>
                  <div style={styles.dateBadge}>
                    <span style={styles.dateDay}>{new Date(wear.worn_at).getDate()}</span>
                    <span style={styles.dateMonth}>{new Date(wear.worn_at).toLocaleDateString('en-ZA', { month: 'short' })}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.wearName}>{wear.fragrance?.name}</p>
                    <p style={styles.wearMeta}>{wear.fragrance?.brand}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {wear.occasion && <span style={styles.tag}>{wear.occasion}</span>}
                    {wear.weather && <span style={styles.tag}>{wear.weather}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '24px', paddingTop: '56px', maxWidth: '480px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)' },
  logBtn: {
    padding: '8px 16px', background: 'var(--accent)', color: '#0c0c0e',
    borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
  },
  recommendBanner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', background: 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))',
    border: '1px solid rgba(201,169,110,0.2)', borderRadius: 'var(--radius-md)',
    textDecoration: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: 500,
    marginBottom: '24px',
  },
  empty: {
    textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
  },
  emptyAction: {
    display: 'inline-block', padding: '10px 20px', background: 'var(--accent)',
    color: '#0c0c0e', borderRadius: 'var(--radius-md)', textDecoration: 'none',
    fontWeight: 600, fontSize: '14px',
  },
  monthGroup: { marginBottom: '24px' },
  monthLabel: {
    fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.8px', fontWeight: 500, marginBottom: '10px',
  },
  wearList: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
  },
  wearItem: {
    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  dateBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: '36px', background: 'var(--bg-elevated)', borderRadius: '8px',
    padding: '6px 4px',
  },
  dateDay: { fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 },
  dateMonth: { fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' },
  wearName: { fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px' },
  wearMeta: { fontSize: '12px', color: 'var(--text-muted)' },
  tag: {
    fontSize: '11px', padding: '3px 8px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: '20px', color: 'var(--text-secondary)',
  },
}

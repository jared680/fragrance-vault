'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserCollection, WearLog } from '@/types'

interface Analytics {
  totalOwned: number
  totalWears: number
  uniqueFragrancesWorn: number
  mostWorn: { name: string; brand: string; count: number }[]
  topBrands: { brand: string; count: number }[]
  avgRating: number
  costPerWear: { name: string; brand: string; cost: number }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [collRes, wearRes] = await Promise.all([
        supabase.from('user_collections').select('*, fragrance:fragrances(name, brand)').eq('user_id', user.id),
        supabase.from('wear_logs').select('*, fragrance:fragrances(name, brand)').eq('user_id', user.id),
      ])

      const collection: UserCollection[] = collRes.data ?? []
      const wears: WearLog[] = wearRes.data ?? []

      const owned = collection.filter(c => c.ownership_type === 'owned')

      // Most worn
      const wearCounts: Record<string, { name: string; brand: string; count: number }> = {}
      wears.forEach(w => {
        const key = w.fragrance_id
        if (!wearCounts[key]) {
          wearCounts[key] = { name: w.fragrance?.name ?? 'Unknown', brand: w.fragrance?.brand ?? '', count: 0 }
        }
        wearCounts[key].count++
      })
      const mostWorn = Object.values(wearCounts).sort((a, b) => b.count - a.count).slice(0, 5)

      // Top brands
      const brandCounts: Record<string, number> = {}
      owned.forEach(c => {
        const b = c.fragrance?.brand ?? 'Unknown'
        brandCounts[b] = (brandCounts[b] ?? 0) + 1
      })
      const topBrands = Object.entries(brandCounts).map(([brand, count]) => ({ brand, count })).sort((a, b) => b.count - a.count).slice(0, 5)

      // Avg rating
      const rated = owned.filter(c => c.user_rating != null)
      const avgRating = rated.length > 0
        ? rated.reduce((sum, c) => sum + (c.user_rating ?? 0), 0) / rated.length
        : 0

      // Cost per wear
      const costPerWear = owned
        .filter(c => c.purchase_price && wearCounts[c.fragrance_id]?.count > 0)
        .map(c => ({
          name: c.fragrance?.name ?? 'Unknown',
          brand: c.fragrance?.brand ?? '',
          cost: (c.purchase_price ?? 0) / (wearCounts[c.fragrance_id]?.count ?? 1),
        }))
        .sort((a, b) => a.cost - b.cost)
        .slice(0, 5)

      setAnalytics({
        totalOwned: owned.length,
        totalWears: wears.length,
        uniqueFragrancesWorn: Object.keys(wearCounts).length,
        mostWorn,
        topBrands,
        avgRating,
        costPerWear,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <main className="page-main">
      <div style={styles.skeleton} />
      <div style={{ ...styles.skeleton, height: '200px' }} />
      <div style={{ ...styles.skeleton, height: '200px' }} />
    </main>
  )

  if (!analytics) return null

  return (
    <main className="page-main">
      <header style={styles.header}>
        <h1 className="font-display" style={styles.title}><em>Analytics</em></h1>
        <p style={styles.subtitle}>Your fragrance story at a glance</p>
      </header>

      {/* Top stats */}
      <div className="stats-grid-4" style={{marginBottom: "28px"}}>
        <StatBox label="In vault" value={analytics.totalOwned} />
        <StatBox label="Total wears" value={analytics.totalWears} />
        <StatBox label="Unique worn" value={analytics.uniqueFragrancesWorn} />
        <StatBox label="Avg rating" value={analytics.avgRating > 0 ? analytics.avgRating.toFixed(1) : '—'} />
      </div>

      {/* Most worn */}
      {analytics.mostWorn.length > 0 && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Most worn</h3>
          <div style={styles.card}>
            {analytics.mostWorn.map((item, i) => (
              <div key={i} style={styles.rankRow}>
                <span style={styles.rank}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemSub}>{item.brand}</p>
                </div>
                <div style={styles.barWrap}>
                  <div
                    style={{
                      ...styles.bar,
                      width: `${(item.count / analytics.mostWorn[0].count) * 100}%`,
                    }}
                  />
                  <span style={styles.barLabel}>{item.count}×</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top brands */}
      {analytics.topBrands.length > 0 && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Top houses</h3>
          <div style={styles.card}>
            {analytics.topBrands.map((item, i) => (
              <div key={i} style={styles.rankRow}>
                <span style={styles.rank}>#{i + 1}</span>
                <p style={{ ...styles.itemName, flex: 1 }}>{item.brand}</p>
                <span style={styles.countBadge}>{item.count} frag{item.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cost per wear */}
      {analytics.costPerWear.length > 0 && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Best value (cost/wear)</h3>
          <div style={styles.card}>
            {analytics.costPerWear.map((item, i) => (
              <div key={i} style={styles.rankRow}>
                <span style={styles.rank}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemSub}>{item.brand}</p>
                </div>
                <span style={styles.accentBadge}>R{item.cost.toFixed(0)}/wear</span>
              </div>
            ))}
          </div>
          <p style={styles.hint}>Fragrances with logged price and at least one wear</p>
        </section>
      )}

      {analytics.totalWears === 0 && (
        <div style={styles.emptyPrompt}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Start logging wears to see meaningful analytics.
          </p>
        </div>
      )}
    </main>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '16px 12px', textAlign: 'center',
    }}>
      <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
        {value}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: 0 },
  header: { marginBottom: '24px' },
  title: { fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 300 },
  statsGrid: {},
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 500, marginBottom: '12px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  rankRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '13px 16px', borderBottom: '1px solid var(--border-subtle)',
  },
  rank: { fontSize: '12px', color: 'var(--accent)', fontWeight: 600, minWidth: '24px' },
  itemName: { fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px' },
  itemSub: { fontSize: '12px', color: 'var(--text-muted)' },
  barWrap: { display: 'flex', alignItems: 'center', gap: '8px', width: '80px' },
  bar: { height: '4px', background: 'var(--accent)', borderRadius: '2px', minWidth: '4px', transition: 'width 0.3s ease' },
  barLabel: { fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  countBadge: {
    fontSize: '12px', padding: '3px 10px', background: 'var(--bg-elevated)',
    borderRadius: '20px', color: 'var(--text-secondary)',
  },
  accentBadge: {
    fontSize: '12px', padding: '3px 10px', background: 'var(--accent-dim)',
    border: '1px solid rgba(201,169,110,0.2)', borderRadius: '20px', color: 'var(--accent)', whiteSpace: 'nowrap',
  },
  hint: { fontSize: '12px', color: 'var(--text-muted)', padding: '8px 4px' },
  skeleton: { height: '80px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '16px' },
  emptyPrompt: {
    textAlign: 'center', padding: '32px', background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
  },
}

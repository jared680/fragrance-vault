'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { UserCollection, Occasion, WeatherType, RecommendationInput } from '@/types'

const VIBES = ['Cozy', 'Fresh', 'Seductive', 'Office-safe', 'Adventurous', 'Elegant', 'Playful', 'Mysterious']
const OCCASIONS: Occasion[] = ['Casual', 'Office', 'Formal', 'Date Night', 'Sport', 'Outdoor', 'Evening', 'Beach']
const WEATHER: WeatherType[] = ['hot', 'warm', 'cool', 'cold', 'rainy', 'humid']
const WEATHER_EMOJI: Record<WeatherType, string> = {
  hot: '☀️', warm: '🌤', cool: '🌥', cold: '❄️', rainy: '🌧', humid: '💧'
}

interface Recommendation {
  fragrance: UserCollection
  reason: string
  score: number
}

export default function RecommendPage() {
  const supabase = createClient()
  const [collection, setCollection] = useState<UserCollection[]>([])
  const [weather, setWeather] = useState<WeatherType | null>(null)
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [vibe, setVibe] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_collections')
        .select('*, fragrance:fragrances(*, fragrance_notes(*), fragrance_tags(*))')
        .eq('user_id', user.id)
        .eq('ownership_type', 'owned')

      if (data) setCollection(data)
    }
    load()
  }, [])

  const getRecommendations = async () => {
    setLoading(true)
    setHasLoaded(false)

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, weather, occasion, vibe }),
      })
      const data = await res.json()
      if (data.recommendations) {
        setRecommendations(data.recommendations)
      }
    } catch {
      // Fallback: simple rule-based
      const scored = collection
        .filter(item => item.ownership_type === 'owned')
        .map(item => ({
          fragrance: item,
          reason: 'Based on your collection',
          score: (item.user_rating ?? 5) + (item.favorite ? 2 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
      setRecommendations(scored)
    }

    setLoading(false)
    setHasLoaded(true)
  }

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <Link href="/dashboard" style={styles.backBtn}>← Back</Link>
        <h1 className="font-display" style={styles.title}>
          What should I<br /><em>wear today?</em>
        </h1>
        <p style={styles.subtitle}>Tell me about your day — I'll suggest from your collection.</p>
      </header>

      {/* Filters */}
      <div style={styles.filters}>
        <section style={styles.filterSection}>
          <label style={styles.filterLabel}>Weather</label>
          <div style={styles.chipRow}>
            {WEATHER.map(w => (
              <button key={w} onClick={() => setWeather(weather === w ? null : w)}
                style={{ ...styles.chip, ...(weather === w ? styles.chipActive : {}) }}>
                {WEATHER_EMOJI[w]} {w}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.filterSection}>
          <label style={styles.filterLabel}>Occasion</label>
          <div style={styles.chipRow}>
            {OCCASIONS.map(o => (
              <button key={o} onClick={() => setOccasion(occasion === o ? null : o)}
                style={{ ...styles.chip, ...(occasion === o ? styles.chipActive : {}) }}>
                {o}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.filterSection}>
          <label style={styles.filterLabel}>Vibe</label>
          <div style={styles.chipRow}>
            {VIBES.map(v => (
              <button key={v} onClick={() => setVibe(vibe === v ? null : v)}
                style={{ ...styles.chip, ...(vibe === v ? styles.chipActive : {}) }}>
                {v}
              </button>
            ))}
          </div>
        </section>
      </div>

      <button onClick={getRecommendations} disabled={loading || collection.length === 0} style={styles.askBtn}>
        {loading ? (
          <span>Thinking... ✦</span>
        ) : (
          <span>✦ Get recommendation</span>
        )}
      </button>

      {collection.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
          <Link href="/collection/add" style={{ color: 'var(--accent)' }}>Add fragrances</Link> to your collection first
        </p>
      )}

      {/* Results */}
      {hasLoaded && recommendations.length > 0 && (
        <div className="animate-fade-up" style={styles.results}>
          <p style={styles.resultsLabel}>✦ My suggestions</p>
          {recommendations.map((rec, i) => (
            <RecommendCard key={rec.fragrance.id} rec={rec} rank={i + 1} />
          ))}
        </div>
      )}

      {hasLoaded && recommendations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
          No fragrances found for those criteria.
        </div>
      )}
    </main>
  )
}

function RecommendCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const f = rec.fragrance.fragrance

  return (
    <div style={styles.recCard}>
      <div style={styles.recRank}>#{rank}</div>
      <div style={styles.recInfo}>
        <p style={styles.recBrand}>{f?.brand}</p>
        <p style={styles.recName}>{f?.name}</p>
        <p style={styles.recReason}>{rec.reason}</p>
      </div>
      {rec.fragrance.user_rating && (
        <div style={styles.recRating}>{rec.fragrance.user_rating}/10</div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '24px', paddingTop: '56px', maxWidth: '480px', margin: '0 auto' },
  header: { marginBottom: '28px' },
  backBtn: { display: 'block', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '16px' },
  title: { fontSize: '36px', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '8px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 300, lineHeight: 1.5 },
  filters: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' },
  filterSection: {},
  filterLabel: { display: 'block', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px', fontWeight: 500 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
  chip: {
    padding: '6px 13px', background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
    borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  chipActive: { background: 'var(--accent-dim)', border: '1px solid rgba(201,169,110,0.4)', color: 'var(--accent)' },
  askBtn: {
    width: '100%', padding: '15px', background: 'linear-gradient(135deg, rgba(201,169,110,0.9), rgba(180,145,80,0.9))',
    color: '#0c0c0e', border: 'none', borderRadius: 'var(--radius-md)',
    fontWeight: 600, fontSize: '15px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    marginBottom: '24px',
  },
  results: { display: 'flex', flexDirection: 'column', gap: '12px' },
  resultsLabel: { fontSize: '11px', color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 500 },
  recCard: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)', padding: '16px',
  },
  recRank: { fontSize: '12px', color: 'var(--accent)', fontWeight: 600, minWidth: '24px', paddingTop: '2px' },
  recInfo: { flex: 1 },
  recBrand: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' },
  recName: { fontSize: '16px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '6px', fontFamily: 'var(--font-display)', fontStyle: 'italic' },
  recReason: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 },
  recRating: { fontSize: '13px', color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap' },
}

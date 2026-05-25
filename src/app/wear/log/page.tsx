'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { UserCollection, Occasion, WeatherType } from '@/types'

const OCCASIONS: Occasion[] = ['Casual', 'Office', 'Formal', 'Date Night', 'Sport', 'Outdoor', 'Evening', 'Beach']
const WEATHER: WeatherType[] = ['hot', 'warm', 'cool', 'cold', 'rainy', 'humid']
const WEATHER_EMOJI: Record<WeatherType, string> = {
  hot: '☀️', warm: '🌤', cool: '🌥', cold: '❄️', rainy: '🌧', humid: '💧'
}

export default function LogWearPage() {
  const router = useRouter()
  const supabase = createClient()

  const [collection, setCollection] = useState<UserCollection[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [weather, setWeather] = useState<WeatherType | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_collections')
        .select('*, fragrance:fragrances(name, brand, image_url)')
        .eq('user_id', user.id)
        .eq('ownership_type', 'owned')
        .order('created_at', { ascending: false })

      if (data) setCollection(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleLog = async () => {
    if (!selectedId) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('wear_logs').insert({
      user_id: user.id,
      fragrance_id: selectedId,
      worn_at: new Date().toISOString(),
      occasion,
      weather,
      personal_notes: notes || null,
    })

    router.push('/dashboard')
  }

  const filtered = collection.filter(item => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.fragrance?.name?.toLowerCase().includes(q) ||
      item.fragrance?.brand?.toLowerCase().includes(q)
    )
  })

  const selectedItem = collection.find(i => i.fragrance_id === selectedId)

  return (
    <main className="page-main">
      <header style={styles.header}>
        <Link href="/dashboard" style={styles.backBtn}>← Back</Link>
        <h1 className="font-display" style={styles.title}><em>Log a Wear</em></h1>
        <p style={styles.subtitle}>What are you wearing today?</p>
      </header>

      {/* Step 1: Pick fragrance */}
      <section style={styles.section}>
        <label style={styles.sectionLabel}>Fragrance</label>

        {selectedItem ? (
          <div style={styles.selectedCard}>
            <div style={styles.selectedInfo}>
              <p style={styles.selectedBrand}>{selectedItem.fragrance?.brand}</p>
              <p style={styles.selectedName}>{selectedItem.fragrance?.name}</p>
            </div>
            <button onClick={() => setSelectedId(null)} style={styles.changeBtn}>Change</button>
          </div>
        ) : (
          <>
            <input
              type="search"
              placeholder="Search your collection..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <div style={styles.fragList}>
              {loading ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px' }}>Loading...</p>
              ) : filtered.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px' }}>
                  No fragrances found. <Link href="/collection/add" style={{ color: 'var(--accent)' }}>Add some</Link>
                </p>
              ) : (
                filtered.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.fragrance_id)}
                    style={styles.fragItem}
                  >
                    <div style={styles.fragInitial}>
                      {item.fragrance?.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.fragrance?.name}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {item.fragrance?.brand}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </section>

      {/* Step 2: Occasion */}
      <section style={styles.section}>
        <label style={styles.sectionLabel}>Occasion <span style={styles.optional}>(optional)</span></label>
        <div style={styles.chipRow}>
          {OCCASIONS.map(o => (
            <button
              key={o}
              onClick={() => setOccasion(occasion === o ? null : o)}
              style={{ ...styles.chip, ...(occasion === o ? styles.chipActive : {}) }}
            >
              {o}
            </button>
          ))}
        </div>
      </section>

      {/* Step 3: Weather */}
      <section style={styles.section}>
        <label style={styles.sectionLabel}>Weather <span style={styles.optional}>(optional)</span></label>
        <div style={styles.chipRow}>
          {WEATHER.map(w => (
            <button
              key={w}
              onClick={() => setWeather(weather === w ? null : w)}
              style={{ ...styles.chip, ...(weather === w ? styles.chipActive : {}) }}
            >
              {WEATHER_EMOJI[w]} {w.charAt(0).toUpperCase() + w.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Step 4: Notes */}
      <section style={styles.section}>
        <label style={styles.sectionLabel}>Notes <span style={styles.optional}>(optional)</span></label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How is it performing today? Any thoughts..."
          style={styles.textarea}
          rows={3}
        />
      </section>

      <button
        onClick={handleLog}
        disabled={!selectedId || saving}
        style={{
          ...styles.logBtn,
          ...(!selectedId ? styles.logBtnDisabled : {}),
        }}
      >
        {saving ? 'Logging...' : '✓ Log this wear'}
      </button>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: 0 },
  header: { marginBottom: '28px' },
  backBtn: { display: 'block', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '16px' },
  title: { fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '4px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 300 },
  section: { marginBottom: '24px' },
  sectionLabel: { display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' },
  optional: { color: 'var(--text-muted)', textTransform: 'none', letterSpacing: '0', fontWeight: 300 },
  selectedCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--bg-card)', border: '1px solid rgba(201,169,110,0.25)',
    borderRadius: 'var(--radius-md)', padding: '14px 16px',
  },
  selectedInfo: {},
  selectedBrand: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' },
  selectedName: { fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 },
  changeBtn: {
    background: 'transparent', border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '12px',
    padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)',
  },
  searchInput: {
    width: '100%', padding: '11px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'var(--font-body)', marginBottom: '8px',
  },
  fragList: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', maxHeight: '200px', overflowY: 'auto',
  },
  fragItem: {
    width: '100%', padding: '12px 16px', background: 'transparent',
    border: 'none', borderBottom: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
    textAlign: 'left', fontFamily: 'var(--font-body)',
  },
  fragInitial: {
    width: '36px', height: '36px', background: 'var(--bg-elevated)',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', color: 'var(--text-secondary)', flexShrink: 0,
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: {
    padding: '7px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: '20px',
    color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  chipActive: {
    background: 'var(--accent-dim)',
    border: '1px solid rgba(201,169,110,0.4)',
    color: 'var(--accent)',
  },
  textarea: {
    width: '100%', padding: '12px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'var(--font-body)', resize: 'none', lineHeight: 1.5,
  },
  logBtn: {
    width: '100%', padding: '15px', background: 'var(--accent)',
    color: '#0c0c0e', border: 'none', borderRadius: 'var(--radius-md)',
    fontWeight: 600, fontSize: '15px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', marginBottom: '24px',
  },
  logBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
}

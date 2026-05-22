'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Concentration, OwnershipType } from '@/types'

const CONCENTRATIONS: Concentration[] = [
  'Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Eau Fraiche', 'Other'
]

export default function AddFragrancePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'search' | 'details'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  // Fragrance fields
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [concentration, setConcentration] = useState<Concentration>('Eau de Parfum')
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('owned')
  const [bottleSize, setBottleSize] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [userRating, setUserRating] = useState<number>(0)
  const [favorite, setFavorite] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)

    // Check if fragrance exists in DB
    const { data } = await supabase
      .from('fragrances')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .limit(5)

    setSearching(false)
    // For now, pre-fill name from search and proceed to details
    setName(searchQuery)
    setStep('details')
  }

  const handleSave = async () => {
    if (!name.trim() || !brand.trim()) {
      setError('Name and brand are required')
      return
    }

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Check if fragrance exists
    let { data: fragrance } = await supabase
      .from('fragrances')
      .select('id')
      .ilike('name', name.trim())
      .eq('brand', brand.trim())
      .single()

    // Create fragrance if it doesn't exist
    if (!fragrance) {
      const { data: newFrag, error: fragError } = await supabase
        .from('fragrances')
        .insert({ name: name.trim(), brand: brand.trim(), concentration })
        .select('id')
        .single()

      if (fragError) { setError(fragError.message); setSaving(false); return }
      fragrance = newFrag
    }

    // Add to user collection
    const { error: collError } = await supabase
      .from('user_collections')
      .insert({
        user_id: user.id,
        fragrance_id: fragrance!.id,
        ownership_type: ownershipType,
        bottle_size: bottleSize ? parseFloat(bottleSize) : null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        user_rating: userRating > 0 ? userRating : null,
        favorite,
      })

    if (collError) { setError(collError.message); setSaving(false); return }
    router.push('/collection')
  }

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <Link href="/collection" style={styles.backBtn}>← Back</Link>
        <h1 className="font-display" style={styles.title}><em>Add Fragrance</em></h1>
      </header>

      {step === 'search' && (
        <div className="animate-fade-up">
          <p style={styles.hint}>Search to check if it's already in our database, or add it manually.</p>

          <div style={styles.searchRow}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Sauvage, Bleu de Chanel..."
              style={styles.input}
              autoFocus
            />
            <button onClick={handleSearch} disabled={searching} style={styles.searchBtn}>
              {searching ? '...' : 'Search'}
            </button>
          </div>

          <div style={styles.orDivider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or add manually</span>
            <span style={styles.dividerLine} />
          </div>

          <button onClick={() => setStep('details')} style={styles.manualBtn}>
            Enter details manually
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="animate-fade-up" style={styles.form}>
          {/* Ownership type */}
          <div style={styles.field}>
            <label style={styles.label}>Status</label>
            <div style={styles.typeRow}>
              {(['owned', 'wishlist', 'sampled'] as OwnershipType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setOwnershipType(t)}
                  style={{
                    ...styles.typeBtn,
                    ...(ownershipType === t ? styles.typeBtnActive : {}),
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Fragrance name *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={styles.input} placeholder="e.g. Sauvage" />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Brand *</label>
            <input value={brand} onChange={e => setBrand(e.target.value)} style={styles.input} placeholder="e.g. Dior" />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Concentration</label>
            <select value={concentration} onChange={e => setConcentration(e.target.value as Concentration)} style={styles.select}>
              {CONCENTRATIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Bottle size (ml)</label>
              <input type="number" value={bottleSize} onChange={e => setBottleSize(e.target.value)} style={styles.input} placeholder="50" />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Purchase price (R)</label>
              <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} style={styles.input} placeholder="0" />
            </div>
          </div>

          {/* Rating */}
          <div style={styles.field}>
            <label style={styles.label}>Your rating</label>
            <div style={styles.ratingRow}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setUserRating(userRating === n ? 0 : n)}
                  style={{
                    ...styles.ratingBtn,
                    ...(userRating >= n ? styles.ratingBtnActive : {}),
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite */}
          <button
            onClick={() => setFavorite(!favorite)}
            style={{
              ...styles.favBtn,
              ...(favorite ? styles.favBtnActive : {}),
            }}
          >
            {favorite ? '♥ Marked as favourite' : '♡ Mark as favourite'}
          </button>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actionRow}>
            <button onClick={() => setStep('search')} style={styles.cancelBtn}>Back</button>
            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : 'Add to vault'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '24px', paddingTop: '56px', maxWidth: '480px', margin: '0 auto' },
  header: { marginBottom: '28px' },
  backBtn: { display: 'block', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '16px' },
  title: { fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)' },
  hint: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 },
  searchRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: {
    flex: 1, padding: '12px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
    fontFamily: 'var(--font-body)', width: '100%',
  },
  select: {
    width: '100%', padding: '12px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
    fontFamily: 'var(--font-body)',
  },
  searchBtn: {
    padding: '12px 20px', background: 'var(--accent)', color: '#0c0c0e',
    border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px',
    cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
  },
  orDivider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', background: 'var(--border-subtle)' },
  dividerText: { color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' },
  manualBtn: {
    width: '100%', padding: '13px', background: 'var(--bg-card)',
    color: 'var(--text-secondary)', border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 },
  typeRow: { display: 'flex', gap: '8px' },
  typeBtn: {
    flex: 1, padding: '9px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  typeBtnActive: { background: 'var(--accent-dim)', border: '1px solid rgba(201,169,110,0.4)', color: 'var(--accent)' },
  row: { display: 'flex', gap: '12px' },
  ratingRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  ratingBtn: {
    width: '36px', height: '36px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 500,
  },
  ratingBtnActive: { background: 'var(--accent-dim)', border: '1px solid rgba(201,169,110,0.4)', color: 'var(--accent)' },
  favBtn: {
    padding: '12px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  favBtnActive: { background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', color: 'var(--accent)' },
  error: { color: 'var(--error)', fontSize: '13px', background: 'rgba(194,107,107,0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' },
  actionRow: { display: 'flex', gap: '10px' },
  cancelBtn: {
    flex: 1, padding: '13px', background: 'var(--bg-card)',
    color: 'var(--text-secondary)', border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  saveBtn: {
    flex: 2, padding: '13px', background: 'var(--accent)', color: '#0c0c0e',
    border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600,
    fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)',
  },
}

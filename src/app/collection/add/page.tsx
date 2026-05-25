'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Concentration, OwnershipType } from '@/types'

const CONCENTRATIONS: Concentration[] = [
  'Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Eau Fraiche', 'Other'
]

type FragranceResult = {
  id: string
  name: string
  brand: string
  concentration: string | null
  in_collection?: boolean
}

export default function AddFragrancePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'search' | 'details'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<FragranceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedFragranceId, setSelectedFragranceId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (searchQuery.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data: { user } } = await supabase.auth.getUser()

      // Search fragrances by name or brand
      const { data: frags } = await supabase
        .from('fragrances')
        .select('id, name, brand, concentration')
        .or(`name.ilike.%${searchQuery.trim()}%,brand.ilike.%${searchQuery.trim()}%`)
        .order('brand')
        .limit(8)

      if (frags && frags.length > 0 && user) {
        // Check which ones are already in the user's collection
        const ids = frags.map(f => f.id)
        const { data: existing } = await supabase
          .from('user_collections')
          .select('fragrance_id')
          .eq('user_id', user.id)
          .in('fragrance_id', ids)

        const ownedIds = new Set((existing ?? []).map((e: { fragrance_id: string }) => e.fragrance_id))
        setResults(frags.map(f => ({ ...f, in_collection: ownedIds.has(f.id) })))
      } else {
        setResults(frags ?? [])
      }

      setShowDropdown(true)
      setSearching(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const selectFragrance = (frag: FragranceResult) => {
    setName(frag.name)
    setBrand(frag.brand)
    setConcentration((frag.concentration as Concentration) ?? 'Eau de Parfum')
    setSelectedFragranceId(frag.id)
    setShowDropdown(false)
    setStep('details')
  }

  const addManually = () => {
    setSelectedFragranceId(null)
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

    let fragranceId = selectedFragranceId

    // If not picked from DB, check/create
    if (!fragranceId) {
      const { data: existing } = await supabase
        .from('fragrances')
        .select('id')
        .ilike('name', name.trim())
        .ilike('brand', brand.trim())
        .maybeSingle()

      if (existing) {
        fragranceId = existing.id
      } else {
        const { data: newFrag, error: fragError } = await supabase
          .from('fragrances')
          .insert({ name: name.trim(), brand: brand.trim(), concentration })
          .select('id')
          .single()

        if (fragError) { setError(fragError.message); setSaving(false); return }
        fragranceId = newFrag.id
      }
    }

    const { error: collError } = await supabase
      .from('user_collections')
      .insert({
        user_id: user.id,
        fragrance_id: fragranceId,
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
    <main className="page-main">
      <header style={styles.header}>
        <Link href="/collection" style={styles.backBtn}>← Back</Link>
        <h1 className="font-display" style={styles.title}><em>Add Fragrance</em></h1>
      </header>

      {step === 'search' && (
        <div className="animate-fade-up">
          <p style={styles.hint}>
            Start typing to search our database — see what's already there, or add your own.
          </p>

          <div ref={searchContainerRef} style={{ position: 'relative' }}>
            <div style={styles.searchRow}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. Sauvage, Creed, Oud Wood…"
                  style={styles.input}
                  autoFocus
                  autoComplete="off"
                />
                {searching && (
                  <span style={styles.spinnerDot}>·· ·</span>
                )}
              </div>
            </div>

            {/* Live results dropdown */}
            {showDropdown && (
              <div style={styles.dropdown}>
                {results.length === 0 ? (
                  <div style={styles.noResults}>
                    <span>No matches found in the database</span>
                    <button onClick={addManually} style={styles.addManualInline}>
                      + Add &quot;{searchQuery}&quot; manually
                    </button>
                  </div>
                ) : (
                  <>
                    {results.map(frag => (
                      <button
                        key={frag.id}
                        onClick={() => selectFragrance(frag)}
                        style={styles.resultItem}
                        onMouseEnter={e => {
                          ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
                        }}
                        onMouseLeave={e => {
                          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                        }}
                      >
                        <div style={styles.resultMain}>
                          <span style={styles.resultName}>{frag.name}</span>
                          <span style={styles.resultBrand}>{frag.brand}</span>
                        </div>
                        <div style={styles.resultRight}>
                          {frag.concentration && (
                            <span style={styles.resultConc}>{frag.concentration}</span>
                          )}
                          {frag.in_collection && (
                            <span style={styles.inCollectionBadge}>In vault</span>
                          )}
                        </div>
                      </button>
                    ))}
                    <div style={styles.dropdownFooter}>
                      <button onClick={addManually} style={styles.notFoundBtn}>
                        Not what I&apos;m looking for — add manually
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Manual add shortcut when no search typed */}
          {searchQuery.length === 0 && (
            <>
              <div style={styles.orDivider}>
                <span style={styles.dividerLine} />
                <span style={styles.dividerText}>or</span>
                <span style={styles.dividerLine} />
              </div>
              <button onClick={addManually} style={styles.manualBtn}>
                Enter details manually
              </button>
            </>
          )}
        </div>
      )}

      {step === 'details' && (
        <div className="animate-fade-up" style={styles.form}>
          {selectedFragranceId && (
            <div style={styles.selectedBanner}>
              <span style={styles.selectedCheck}>✓</span>
              <span>Found in database — details pre-filled</span>
            </div>
          )}

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
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.input}
              placeholder="e.g. Sauvage"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Brand *</label>
            <input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              style={styles.input}
              placeholder="e.g. Dior"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Concentration</label>
            <select
              value={concentration}
              onChange={e => setConcentration(e.target.value as Concentration)}
              style={styles.select}
            >
              {CONCENTRATIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Bottle size (ml)</label>
              <input
                type="number"
                value={bottleSize}
                onChange={e => setBottleSize(e.target.value)}
                style={styles.input}
                placeholder="50"
              />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Purchase price (R)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                style={styles.input}
                placeholder="0"
              />
            </div>
          </div>

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
            <button onClick={() => { setStep('search'); setSelectedFragranceId(null) }} style={styles.cancelBtn}>
              Back
            </button>
            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving…' : 'Add to vault'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: { marginBottom: '28px' },
  backBtn: { display: 'block', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '16px' },
  title: { fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)' },
  hint: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 },
  searchRow: { display: 'flex', gap: '10px' },
  spinnerDot: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', fontSize: '16px', letterSpacing: '2px', pointerEvents: 'none',
  },
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
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)', zIndex: 100, overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
  },
  resultItem: {
    width: '100%', padding: '11px 14px', background: 'transparent',
    border: 'none', borderBottom: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '10px', textAlign: 'left',
    transition: 'background 0.1s ease',
  },
  resultMain: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  resultName: { fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resultBrand: { fontSize: '12px', color: 'var(--text-muted)' },
  resultRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 },
  resultConc: { fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  inCollectionBadge: {
    fontSize: '10px', fontWeight: 600, padding: '2px 7px',
    background: 'var(--accent-dim)', color: 'var(--accent)',
    borderRadius: '20px', whiteSpace: 'nowrap',
  },
  dropdownFooter: {
    padding: '8px 14px', borderTop: '1px solid var(--border-subtle)',
    background: 'var(--bg-secondary)',
  },
  notFoundBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    padding: 0, textAlign: 'left',
  },
  noResults: {
    padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '10px',
    color: 'var(--text-secondary)', fontSize: '14px',
  },
  addManualInline: {
    background: 'none', border: 'none', color: 'var(--accent)',
    fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    padding: 0, fontWeight: 500,
  },
  orDivider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', background: 'var(--border-subtle)' },
  dividerText: { color: 'var(--text-muted)', fontSize: '12px' },
  manualBtn: {
    width: '100%', padding: '13px', background: 'var(--bg-card)',
    color: 'var(--text-secondary)', border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  selectedBanner: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
    background: 'var(--accent-dim)', border: '1px solid rgba(201,169,110,0.25)',
    borderRadius: 'var(--radius-md)', color: 'var(--accent)', fontSize: '13px',
    fontWeight: 500,
  },
  selectedCheck: { fontSize: '15px' },
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

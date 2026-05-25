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

// Returns two letters for the avatar — first letter of brand + first letter of name
function initials(brand: string, name: string) {
  return `${brand?.[0] ?? ''}${name?.[0] ?? ''}`.toUpperCase()
}

export default function AddFragrancePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'search' | 'details'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<FragranceResult[]>([])
  const [searched, setSearched] = useState(false)   // true once a query has resolved
  const [searching, setSearching] = useState(false)
  const [selectedFragranceId, setSelectedFragranceId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Debounced live search — inline feed, no dropdown
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (searchQuery.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data: { user } } = await supabase.auth.getUser()

      const { data: frags } = await supabase
        .from('fragrances')
        .select('id, name, brand, concentration')
        .or(`name.ilike.%${searchQuery.trim()}%,brand.ilike.%${searchQuery.trim()}%`)
        .order('brand')
        .limit(10)

      if (frags && frags.length > 0 && user) {
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

      setSearched(true)
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
            Search our database first — then add it to your vault in one tap.
          </p>

          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. Sauvage, Creed, Oud Wood…"
              style={styles.searchInput}
              autoFocus
              autoComplete="off"
            />
            {searching && <span style={styles.spinnerDot}>···</span>}
          </div>

          {/* ── Inline results feed ── */}
          {searching && searchQuery.trim().length >= 2 && (
            <div style={styles.feed}>
              {[1, 2, 3].map(i => (
                <div key={i} style={styles.skeletonRow}>
                  <div style={{ ...styles.skeletonAvatar, opacity: 1 - i * 0.2 }} />
                  <div style={styles.skeletonLines}>
                    <div style={{ ...styles.skeletonLine, width: `${60 - i * 8}%` }} />
                    <div style={{ ...styles.skeletonLine, width: `${40 - i * 6}%`, opacity: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && searched && (
            <div style={styles.feed}>
              {/* Result count header */}
              <div style={styles.feedHeader}>
                {results.length > 0 ? (
                  <span style={styles.feedCount}>
                    {results.length} match{results.length !== 1 ? 'es' : ''} in database
                  </span>
                ) : (
                  <span style={styles.feedCount}>No matches found</span>
                )}
              </div>

              {results.length === 0 ? (
                /* Empty state */
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>
                    &ldquo;{searchQuery}&rdquo; isn&apos;t in the database yet.
                  </p>
                  <button onClick={addManually} style={styles.addManualBtn}>
                    + Add it manually
                  </button>
                </div>
              ) : (
                <>
                  {results.map((frag, idx) => (
                    <button
                      key={frag.id}
                      onClick={() => selectFragrance(frag)}
                      style={{
                        ...styles.resultRow,
                        borderBottom: idx < results.length - 1
                          ? '1px solid var(--border-subtle)'
                          : 'none',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover, var(--bg-elevated))'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                      }}
                    >
                      {/* Avatar */}
                      <div style={styles.resultAvatar}>
                        <span style={styles.resultAvatarText}>
                          {initials(frag.brand, frag.name)}
                        </span>
                      </div>

                      {/* Name + brand */}
                      <div style={styles.resultInfo}>
                        <span style={styles.resultName}>{frag.name}</span>
                        <span style={styles.resultMeta}>
                          {frag.brand}
                          {frag.concentration ? ` · ${frag.concentration}` : ''}
                        </span>
                      </div>

                      {/* Badges + chevron */}
                      <div style={styles.resultTrail}>
                        {frag.in_collection && (
                          <span style={styles.inVaultBadge}>In vault</span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  ))}

                  {/* Footer: not found option */}
                  <div style={styles.feedFooter}>
                    <button onClick={addManually} style={styles.notFoundBtn}>
                      Not seeing it? Add manually →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Manual add shortcut before any search */}
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
              style={styles.formInput}
              placeholder="e.g. Sauvage"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Brand *</label>
            <input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              style={styles.formInput}
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
                style={styles.formInput}
                placeholder="50"
              />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Purchase price (R)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                style={styles.formInput}
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

  // Search input
  searchIcon: {
    position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', pointerEvents: 'none',
  },
  searchInput: {
    width: '100%', padding: '13px 40px 13px 38px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  },
  spinnerDot: {
    position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '3px', pointerEvents: 'none',
  },

  // Inline results feed
  feed: {
    marginTop: '12px',
    background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)', overflow: 'hidden',
  },
  feedHeader: {
    padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-secondary)',
  },
  feedCount: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 },

  // Result row
  resultRow: {
    width: '100%', padding: '12px 14px', background: 'transparent',
    border: 'none', color: 'var(--text-primary)', fontSize: '14px',
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    display: 'flex', alignItems: 'center', gap: '12px',
    textAlign: 'left', transition: 'background 0.12s ease',
  },
  resultAvatar: {
    width: '38px', height: '38px', borderRadius: '10px',
    background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  resultAvatarText: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 300,
  },
  resultInfo: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  resultName: {
    fontWeight: 500, color: 'var(--text-primary)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    fontSize: '14px',
  },
  resultMeta: {
    fontSize: '12px', color: 'var(--text-muted)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  resultTrail: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  inVaultBadge: {
    fontSize: '10px', fontWeight: 600, padding: '2px 8px',
    background: 'var(--accent-dim)', color: 'var(--accent)',
    borderRadius: '20px', whiteSpace: 'nowrap',
  },

  // Empty state inside feed
  emptyState: {
    padding: '24px 16px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '12px', textAlign: 'center',
  },
  emptyText: { color: 'var(--text-secondary)', fontSize: '14px' },
  addManualBtn: {
    padding: '9px 20px', background: 'var(--accent)', color: '#0c0c0e',
    border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
  },

  // Feed footer
  feedFooter: {
    padding: '10px 14px', borderTop: '1px solid var(--border-subtle)',
    background: 'var(--bg-secondary)',
  },
  notFoundBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    padding: 0,
  },

  // Skeleton loading rows
  skeletonRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)',
  },
  skeletonAvatar: {
    width: '38px', height: '38px', borderRadius: '10px',
    background: 'var(--bg-elevated)', flexShrink: 0,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonLines: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  skeletonLine: {
    height: '10px', borderRadius: '6px', background: 'var(--bg-elevated)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },

  // Pre-search divider + manual button
  orDivider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', background: 'var(--border-subtle)' },
  dividerText: { color: 'var(--text-muted)', fontSize: '12px' },
  manualBtn: {
    width: '100%', padding: '13px', background: 'var(--bg-card)',
    color: 'var(--text-secondary)', border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  // Form inputs (details step)
  formInput: {
    width: '100%', padding: '12px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '12px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
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

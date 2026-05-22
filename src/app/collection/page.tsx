'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { UserCollection, OwnershipType } from '@/types'

type Tab = 'owned' | 'wishlist' | 'sampled'

export default function CollectionPage() {
  const [items, setItems] = useState<UserCollection[]>([])
  const [tab, setTab] = useState<Tab>('owned')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadCollection = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_collections')
        .select('*, fragrance:fragrances(*, fragrance_notes(*), fragrance_tags(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setItems(data)
      setLoading(false)
    }
    loadCollection()
  }, [])

  const filtered = items.filter(item => {
    if (item.ownership_type !== tab) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.fragrance?.name?.toLowerCase().includes(q) ||
      item.fragrance?.brand?.toLowerCase().includes(q)
    )
  })

  const tabCounts: Record<Tab, number> = {
    owned: items.filter(i => i.ownership_type === 'owned').length,
    wishlist: items.filter(i => i.ownership_type === 'wishlist').length,
    sampled: items.filter(i => i.ownership_type === 'sampled').length,
  }

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 className="font-display" style={styles.title}><em>Collection</em></h1>
        <Link href="/collection/add" style={styles.addBtn}>+ Add</Link>
      </header>

      {/* Search */}
      <div style={styles.searchWrap}>
        <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          placeholder="Search collection..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['owned', 'wishlist', 'sampled'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tab,
              ...(tab === t ? styles.tabActive : {}),
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span style={styles.tabCount}>{tabCounts[t]}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={styles.grid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🫙</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '8px' }}>
            {search ? 'No results found' : `No fragrances ${tab}`}
          </p>
          {!search && (
            <Link href="/collection/add" style={{ color: 'var(--accent)', fontSize: '14px' }}>
              Add your first →
            </Link>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(item => (
            <FragranceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  )
}

function FragranceCard({ item }: { item: UserCollection }) {
  const f = item.fragrance
  const initials = f ? `${f.brand?.[0] ?? ''}${f.name?.[0] ?? ''}` : '??'

  return (
    <Link href={`/collection/${item.id}`} style={styles.card}>
      {/* Image or placeholder */}
      <div style={styles.cardImage}>
        {f?.image_url ? (
          <img src={f.image_url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span className="font-display" style={styles.cardInitials}>{initials}</span>
        )}
        {item.favorite && (
          <div style={styles.favBadge}>♥</div>
        )}
      </div>

      {/* Info */}
      <div style={styles.cardInfo}>
        <p style={styles.cardBrand}>{f?.brand ?? 'Unknown'}</p>
        <p style={styles.cardName}>{f?.name ?? 'Unknown'}</p>
        {item.user_rating && (
          <p style={styles.cardRating}>{'★'.repeat(Math.round(item.user_rating / 2))}</p>
        )}
      </div>
    </Link>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: '24px',
    paddingTop: '56px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 400,
    color: 'var(--text-primary)',
  },
  addBtn: {
    padding: '8px 16px',
    background: 'var(--accent)',
    color: '#0c0c0e',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
  },
  searchWrap: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '11px 14px 11px 38px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-body)',
  },
  tabs: {
    display: 'flex',
    gap: '6px',
    marginBottom: '20px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '4px',
  },
  tab: {
    flex: 1,
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  tabActive: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
  },
  tabCount: {
    fontSize: '11px',
    padding: '1px 6px',
    background: 'var(--bg-secondary)',
    borderRadius: '10px',
    color: 'var(--text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  skeletonCard: {
    height: '200px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    textDecoration: 'none',
    display: 'block',
  },
  cardImage: {
    height: '140px',
    background: 'var(--bg-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardInitials: {
    fontSize: '28px',
    fontWeight: 300,
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  favBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    background: 'rgba(201,169,110,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: 'var(--accent)',
  },
  cardInfo: {
    padding: '12px',
  },
  cardBrand: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '3px',
  },
  cardName: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  cardRating: {
    fontSize: '11px',
    color: 'var(--accent)',
    marginTop: '4px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
  },
}

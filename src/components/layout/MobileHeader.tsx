'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function MobileHeader() {
  return (
    <header className="mobile-header">
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>🫙</span>
        <span className="font-display" style={{
          fontSize: 15, fontStyle: 'italic',
          color: 'var(--text-primary)', letterSpacing: '-0.2px',
        }}>
          Fragrance Vault
        </span>
      </Link>
      <ThemeToggle />
    </header>
  )
}

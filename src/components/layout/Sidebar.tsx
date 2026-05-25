'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { Home, Package, Clock, BarChart2 } from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Home',       Icon: Home      },
  { href: '/collection', label: 'Collection', Icon: Package   },
  { href: '/wear',       label: 'Wear Log',   Icon: Clock     },
  { href: '/analytics',  label: 'Analytics',  Icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div style={{ marginBottom: 32, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🫙</div>
        <span className="font-display" style={{
          fontSize: 17, fontWeight: 400, fontStyle: 'italic',
          color: 'var(--text-primary)', letterSpacing: '-0.2px',
        }}>
          Fragrance Vault
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link${active ? ' active' : ''}`}
            >
              <Icon
                size={15}
                color={active ? 'var(--accent)' : 'var(--text-muted)'}
                style={{ flexShrink: 0 }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle at bottom */}
      <div style={{
        paddingTop: 16,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  )
}

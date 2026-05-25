'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Clock, BarChart2 } from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Home',       Icon: Home      },
  { href: '/collection', label: 'Collection', Icon: Package   },
  { href: '/wear',       label: 'Wear',       Icon: Clock     },
  { href: '/analytics',  label: 'Analytics',  Icon: BarChart2 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      paddingTop: '8px',
      zIndex: 100,
    }}>
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 20px',
              textDecoration: 'none',
              minWidth: '60px',
            }}
          >
            <Icon
              size={22}
              color={active ? 'var(--accent)' : 'var(--text-muted)'}
              strokeWidth={active ? 2 : 1.8}
            />
            <span style={{
              fontSize: '10px',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: active ? 500 : 400,
              letterSpacing: '0.3px',
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

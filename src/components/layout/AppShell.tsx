import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import BottomNav from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <Sidebar />

      {/* Content column */}
      <div className="app-content">
        {/* Mobile top bar — hidden on desktop via CSS */}
        <MobileHeader />
        {children}
      </div>

      {/* Mobile bottom nav — hidden on desktop via CSS */}
      <div className="bottom-nav-wrapper">
        <BottomNav />
      </div>
    </div>
  )
}

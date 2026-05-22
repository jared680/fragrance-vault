import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        paddingBottom: '80px',
      }}
    >
      {children}
      <BottomNav />
    </div>
  )
}

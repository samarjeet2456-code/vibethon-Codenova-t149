'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from './app-sidebar'
import { Topbar } from './topbar'
import { useAppStore } from '@/lib/store'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not logged in
    if (!user.isLoggedIn) {
      router.push('/login')
    }
  }, [user.isLoggedIn, router])

  // Show nothing while checking auth
  if (!user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64">
        <Topbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

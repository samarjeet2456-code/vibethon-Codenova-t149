'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from './app-sidebar'
import { Topbar } from './topbar'
import { getSupabaseClient } from '@/lib/supabase'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      const loggedIn = Boolean(data.session?.user)
      setIsLoggedIn(loggedIn)
      setIsCheckingAuth(false)
      if (!loggedIn) {
        router.push('/login')
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = Boolean(session?.user)
      setIsLoggedIn(loggedIn)
      if (!loggedIn) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Show nothing while checking auth
  if (isCheckingAuth || !isLoggedIn) {
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

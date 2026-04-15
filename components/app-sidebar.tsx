'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, FileCode, BookOpen, Gamepad2, Trophy,
  User, Brain, Code, GraduationCap, HelpCircle, Info, LogOut, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabase'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard',   href: '/',            icon: LayoutDashboard },
  { name: 'Learn',       href: '/learn',        icon: GraduationCap },
  { name: 'Problems',    href: '/problems',     icon: FileCode },
  { name: 'Code',        href: '/code',         icon: Code },
  { name: 'Modules',     href: '/modules',      icon: BookOpen },
  { name: 'Quiz',        href: '/quiz',         icon: HelpCircle },
  { name: 'Games',       href: '/games',        icon: Gamepad2 },
  { name: 'Leaderboard', href: '/leaderboard',  icon: Trophy },
  { name: 'Profile',     href: '/profile',      icon: User },
  { name: 'About',       href: '/about',        icon: Info },
]

interface UserInfo {
  name: string
  xp: number
  level: number
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) return
        const data = await res.json()
        if (data.profile) {
          setUserInfo({
            name: data.profile.name || 'User',
            xp: data.profile.xp ?? 0,
            level: data.profile.level ?? 1,
          })
        }
      } catch { /* ignore */ }
    }
    loadUser()
  }, [pathname])

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">AIML Practice</h1>
            <p className="text-xs text-muted-foreground">Learn. Code. Master.</p>
          </div>
        </div>

        {/* User Info */}
        {userInfo && (
          <div className="px-4 py-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {userInfo.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userInfo.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-primary" />
                  <span>{userInfo.xp} XP · Lv.{userInfo.level}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <motion.div
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors relative',
                        isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </motion.div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  )
}

'use client'

import { Search, Flame, Zap, Bell, ChevronDown, LogOut, AlertCircle, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useTheme } from 'next-themes'

const levelColors = {
  beginner: 'bg-success/20 text-success border-success/30',
  intermediate: 'bg-warning/20 text-warning border-warning/30',
  advanced: 'bg-destructive/20 text-destructive border-destructive/30',
}

const levelLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

interface ProfileData {
  name: string
  xp: number
  level: number
  streak: number
  learning_level: 'beginner' | 'intermediate' | 'advanced'
  last_active?: string
}

interface SearchResult {
  id: string
  label: string
  href: string
  type: 'problem' | 'module' | 'page'
}

export function Topbar() {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'User',
    xp: 0,
    level: 1,
    streak: 0,
    learning_level: 'beginner',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const themes = [
    { key: 'dark', label: 'Dark' },
    { key: 'ocean', label: 'Ocean' },
    { key: 'sunset', label: 'Sunset' },
    { key: 'violet', label: 'Violet' },
  ] as const

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) return
        const data = await res.json()
        if (!data.profile) return
        setProfile({
          name: data.profile.name || 'User',
          xp: data.profile.xp ?? 0,
          level: data.profile.level ?? 1,
          streak: data.profile.streak ?? 0,
          learning_level: data.profile.learning_level ?? 'beginner',
          last_active: data.profile.last_active,
        })
      } catch {
        // Keep defaults if profile request fails.
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const notes: string[] = []

    if (profile.streak > 0) {
      notes.push(`Great job! You are on a ${profile.streak}-day streak.`)
    }
    if (profile.last_active !== today) {
      notes.push('You have not logged activity today. Solve one problem to keep your streak.')
    }

    setNotifications(notes)
  }, [profile.streak, profile.last_active])

  useEffect(() => {
    async function loadSearchData() {
      try {
        const [problemsRes, modulesRes] = await Promise.all([
          fetch('/api/problems'),
          fetch('/api/modules'),
        ])
        const problemsData = await problemsRes.json()
        const modulesData = await modulesRes.json()

        const pageResults: SearchResult[] = [
          { id: 'page-dashboard', label: 'Dashboard', href: '/', type: 'page' },
          { id: 'page-learn', label: 'Learn', href: '/learn', type: 'page' },
          { id: 'page-problems', label: 'Problems', href: '/problems', type: 'page' },
          { id: 'page-modules', label: 'Modules', href: '/modules', type: 'page' },
          { id: 'page-quiz', label: 'Quiz', href: '/quiz', type: 'page' },
          { id: 'page-games', label: 'Games', href: '/games', type: 'page' },
          { id: 'page-leaderboard', label: 'Leaderboard', href: '/leaderboard', type: 'page' },
          { id: 'page-profile', label: 'Profile', href: '/profile', type: 'page' },
        ]

        const problemResults: SearchResult[] = (problemsData.problems ?? []).map((p: { id: number; name: string }) => ({
          id: `problem-${p.id}`,
          label: p.name,
          href: `/problems/${p.id}`,
          type: 'problem',
        }))

        const moduleResults: SearchResult[] = (modulesData.modules ?? []).map((m: { id: number; name: string }) => ({
          id: `module-${m.id}`,
          label: m.name,
          href: '/modules',
          type: 'module',
        }))

        setResults([...pageResults, ...problemResults, ...moduleResults])
      } catch {
        // Keep search with no dynamic suggestions when APIs fail.
      }
    }

    loadSearchData()
  }, [])

  const filteredResults = searchTerm
    ? results.filter((result) => result.label.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6)
    : []

  const goToResult = (href: string) => {
    setSearchOpen(false)
    setSearchTerm('')
    router.push(href)
  }

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      {/* Search */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search problems, modules..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filteredResults.length > 0) {
              goToResult(filteredResults[0].href)
            }
          }}
          className="pl-10 bg-secondary border-none"
        />
        {searchOpen && filteredResults.length > 0 && (
          <div className="absolute mt-2 w-full rounded-md border border-border bg-popover p-2 shadow-md">
            {filteredResults.map((result) => (
              <button
                key={result.id}
                className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => goToResult(result.href)}
              >
                <span className="truncate">{result.label}</span>
                <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Learning Level Badge */}
        <Badge variant="outline" className={`hidden md:inline-flex ${levelColors[profile.learning_level]}`}>
          {levelLabels[profile.learning_level]}
        </Badge>

        {/* XP */}
        <motion.div 
          className="hidden lg:flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
          whileHover={{ scale: 1.02 }}
        >
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{profile.xp} XP</span>
        </motion.div>

        {/* Streak */}
        <motion.div 
          className="hidden lg:flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2"
          whileHover={{ scale: 1.02 }}
        >
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-sm font-semibold text-warning">{profile.streak} day</span>
        </motion.div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {Math.min(notifications.length, 9)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem className="text-muted-foreground">
                No new notifications
              </DropdownMenuItem>
            ) : (
              notifications.map((note) => (
                <DropdownMenuItem key={note} className="items-start gap-2 whitespace-normal py-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-sm">{note}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 md:pr-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {profile.name.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">{profile.name || 'User'}</span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Level {profile.level}</span>
              <span className="ml-auto text-muted-foreground">{profile.xp} XP</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            {themes.map((themeOption) => (
              <DropdownMenuItem key={themeOption.key} onClick={() => setTheme(themeOption.key)}>
                <span>{themeOption.label}</span>
                {mounted && theme === themeOption.key && <Check className="ml-auto h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

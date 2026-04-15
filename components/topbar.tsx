'use client'

import { Search, Flame, Zap, Bell, ChevronDown, LogOut } from 'lucide-react'
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
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

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

export function Topbar() {
  const { user, logout } = useAppStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search problems, modules..."
          className="pl-10 bg-secondary border-none"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Learning Level Badge */}
        <Badge variant="outline" className={levelColors[user.learningLevel]}>
          {levelLabels[user.learningLevel]}
        </Badge>

        {/* XP */}
        <motion.div 
          className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
          whileHover={{ scale: 1.02 }}
        >
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{user.xp} XP</span>
        </motion.div>

        {/* Streak */}
        <motion.div 
          className="flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2"
          whileHover={{ scale: 1.02 }}
        >
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-sm font-semibold text-warning">{user.streak} day</span>
        </motion.div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {user.name.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name || 'User'}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Level {user.level}</span>
              <span className="ml-auto text-muted-foreground">{user.xp} XP</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileCode, 
  BookOpen, 
  Gamepad2, 
  Trophy, 
  User,
  Brain,
  Code,
  GraduationCap,
  HelpCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Learn', href: '/learn', icon: GraduationCap },
  { name: 'Problems', href: '/problems', icon: FileCode },
  { name: 'Code', href: '/code', icon: Code },
  { name: 'Modules', href: '/modules', icon: BookOpen },
  { name: 'Quiz', href: '/quiz', icon: HelpCircle },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'About', href: '/about', icon: Info },
]

export function AppSidebar() {
  const pathname = usePathname()

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

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="flex flex-col gap-2">
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
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="rounded-lg bg-sidebar-accent p-4">
            <p className="text-xs text-muted-foreground mb-2">Pro Tip</p>
            <p className="text-sm text-sidebar-foreground">
              Complete daily challenges to maintain your streak!
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

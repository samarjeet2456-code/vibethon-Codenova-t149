'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Trophy, Medal, Zap, Crown, TrendingUp, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getSupabaseClient } from '@/lib/supabase'

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  xp: number
  level: number
  problemsSolved: number
  isCurrentUser?: boolean
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserXp, setCurrentUserXp] = useState(0)
  const [currentUserLevel, setCurrentUserLevel] = useState(1)
  const [currentUserName, setCurrentUserName] = useState('')

  useEffect(() => {
    async function load() {
      try {
        // Get current user
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id ?? null)

        // Fetch leaderboard + profile in parallel
        const [lbRes, profileRes] = await Promise.all([
          fetch('/api/leaderboard'),
          user ? fetch('/api/profile') : Promise.resolve(null),
        ])

        const lbData = await lbRes.json()
        const entries: LeaderboardEntry[] = (lbData.leaderboard ?? []).map(
          (e: LeaderboardEntry) => ({
            ...e,
            isCurrentUser: e.id === user?.id,
          })
        )
        setLeaderboard(entries)

        if (profileRes) {
          const profileData = await profileRes.json()
          setCurrentUserXp(profileData.profile?.xp ?? 0)
          setCurrentUserLevel(profileData.profile?.level ?? 1)
          setCurrentUserName(profileData.profile?.name ?? '')
        }
      } catch (err) {
        console.error('Leaderboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentUserEntry = leaderboard.find(e => e.isCurrentUser)
  const currentUserRank = currentUserEntry?.rank ?? leaderboard.length + 1

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground font-mono">#{rank}</span>
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400/10 border-yellow-400/30'
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/30'
    if (rank === 3) return 'bg-amber-600/10 border-amber-600/30'
    return ''
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  const sorted = leaderboard
  const top3 = sorted.slice(0, 3)

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other learners</p>
        </motion.div>

        {/* Your Stats */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {currentUserName.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{currentUserName || 'You'}</h2>
                    <p className="text-muted-foreground">Level {currentUserLevel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-3xl font-bold text-primary">
                      <Trophy className="h-6 w-6" />
                      #{currentUserRank}
                    </div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-3xl font-bold">
                      <Zap className="h-6 w-6 text-primary" />
                      {currentUserXp}
                    </div>
                    <p className="text-sm text-muted-foreground">Total XP</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-3xl font-bold text-success">
                      <TrendingUp className="h-6 w-6" />
                      {currentUserEntry?.problemsSolved ?? 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Problems Solved</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <motion.div variants={item}>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {/* 2nd */}
              <div className="pt-8">
                <Card className={`text-center ${getRankBg(2)}`}>
                  <CardContent className="p-4">
                    <div className="relative inline-block mb-2">
                      <Avatar className="h-16 w-16 mx-auto">
                        <AvatarFallback className="bg-gray-500 text-white text-xl font-bold">
                          {top3[1]?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                    </div>
                    <h3 className="font-semibold truncate">{top3[1]?.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />{top3[1]?.xp} XP
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* 1st */}
              <div>
                <Card className={`text-center ${getRankBg(1)}`}>
                  <CardContent className="p-4">
                    <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className="relative inline-block mb-2">
                      <Avatar className="h-20 w-20 mx-auto ring-4 ring-yellow-400/50">
                        <AvatarFallback className="bg-yellow-500 text-white text-2xl font-bold">
                          {top3[0]?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                    </div>
                    <h3 className="font-semibold truncate">{top3[0]?.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />{top3[0]?.xp} XP
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* 3rd */}
              <div className="pt-12">
                <Card className={`text-center ${getRankBg(3)}`}>
                  <CardContent className="p-4">
                    <div className="relative inline-block mb-2">
                      <Avatar className="h-14 w-14 mx-auto">
                        <AvatarFallback className="bg-amber-600 text-white text-lg font-bold">
                          {top3[2]?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                    </div>
                    <h3 className="font-semibold truncate">{top3[2]?.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />{top3[2]?.xp} XP
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Rankings */}
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle>Full Rankings</CardTitle></CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No users yet — be the first to earn XP!</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-sm font-medium text-muted-foreground">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">User</div>
                    <div className="col-span-2">Level</div>
                    <div className="col-span-2">Solved</div>
                    <div className="col-span-2 text-right">XP</div>
                  </div>
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      variants={item}
                      className={`grid grid-cols-12 gap-4 p-4 border-t border-border items-center ${
                        entry.isCurrentUser ? 'bg-primary/10' : 'hover:bg-secondary/30'
                      } transition-colors`}
                    >
                      <div className="col-span-1">{getRankIcon(index + 1)}</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={entry.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                            {entry.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`font-medium ${entry.isCurrentUser ? 'text-primary' : ''}`}>
                          {entry.name}
                          {entry.isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                        </span>
                      </div>
                      <div className="col-span-2 text-muted-foreground">Level {entry.level}</div>
                      <div className="col-span-2 text-muted-foreground">{entry.problemsSolved}</div>
                      <div className="col-span-2 text-right">
                        <span className="flex items-center justify-end gap-1">
                          <Zap className="h-4 w-4 text-primary" />
                          {entry.xp.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
  Zap, Flame, Trophy, Target, CheckCircle2,
  TrendingUp, Calendar, Award, Star, Sparkles, Settings, Loader2, Save
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getSupabaseClient } from '@/lib/supabase'

interface Profile {
  id: string
  name: string
  email: string
  xp: number
  level: number
  streak: number
  problems_solved: number
  badges: string[]
  learning_level: string
  created_at: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const badgeDefinitions = [
  { id: 'Beginner',        name: 'Beginner',    description: 'Started your AI/ML journey',      icon: Star,        color: 'bg-primary' },
  { id: 'Explorer',        name: 'Explorer',    description: 'Solve 5 problems',                icon: Target,      color: 'bg-blue-500' },
  { id: 'On Fire',         name: 'On Fire',     description: 'Maintain a 3-day streak',         icon: Flame,       color: 'bg-orange-500' },
  { id: 'Challenger',      name: 'Challenger',  description: 'Solve your first Hard problem',   icon: Trophy,      color: 'bg-yellow-500' },
  { id: 'Graduate',        name: 'Graduate',    description: 'Complete a learning module',       icon: Award,      color: 'bg-green-500' },
  { id: 'Game Master',     name: 'Game Master', description: 'Play all mini games',             icon: Sparkles,    color: 'bg-purple-500' },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editLearningLevel, setEditLearningLevel] = useState('beginner')

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const [profileRes, lbRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/leaderboard'),
        ])

        const profileData = await profileRes.json()
        const loadedProfile = profileData.profile ?? null
        setProfile(loadedProfile)
        if (loadedProfile) {
          setEditName(loadedProfile.name ?? '')
          setEditLearningLevel(loadedProfile.learning_level ?? 'beginner')
        }

        const lbData = await lbRes.json()
        const rankEntry = (lbData.leaderboard ?? []).find((e: { id: string; rank: number }) => e.id === user.id)
        setUserRank(rankEntry?.rank ?? null)
      } catch (err) {
        console.error('Profile load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('edit') === 'true') {
      setIsEditing(true)
    }
  }, [])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          learning_level: editLearningLevel,
        }),
      })

      if (!res.ok) return
      const data = await res.json()
      if (data.profile) {
        setProfile((prev) => prev ? { ...prev, ...data.profile } : prev)
      }
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
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

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Could not load profile. Please log in again.</p>
        </div>
      </AppLayout>
    )
  }

  const xpToNextLevel = (profile.level * 500) - profile.xp
  const levelProgress = ((profile.xp % 500) / 500) * 100
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  const earnedBadges = new Set(profile.badges ?? [])

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Profile Header */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/30">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <p className="text-muted-foreground capitalize">{profile.learning_level} Learner</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">Joined {joinedDate}</span>
                      {userRank && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-warning" />
                          Rank #{userRank}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => setIsEditing((prev) => !prev)}>
                  <Settings className="h-4 w-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary">Level {profile.level}</span>
                  <span className="text-sm text-muted-foreground">{xpToNextLevel} XP to Level {profile.level + 1}</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isEditing && (
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="learning-level">Learning Level</Label>
                  <select
                    id="learning-level"
                    value={editLearningLevel}
                    onChange={(e) => setEditLearningLevel(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{profile.xp}</div>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">{profile.streak}</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">{profile.problems_solved}</div>
              <p className="text-sm text-muted-foreground">Problems Solved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-chart-2 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userRank ? `#${userRank}` : '—'}</div>
              <p className="text-sm text-muted-foreground">Global Rank</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {badgeDefinitions.map((badge) => {
                  const earned = earnedBadges.has(badge.id)
                  return (
                    <motion.div
                      key={badge.id}
                      className={`p-3 rounded-lg border ${
                        earned ? 'bg-primary/10 border-primary/30' : 'bg-secondary/50 border-border opacity-50'
                      }`}
                      whileHover={{ scale: earned ? 1.02 : 1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${earned ? badge.color : 'bg-muted'}`}>
                          <badge.icon className={`h-4 w-4 ${earned ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity hint */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;re on a <strong className="text-primary">{profile.streak}-day streak</strong>! Keep solving problems daily to maintain it.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

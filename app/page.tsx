'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import {
  Zap, Flame, Target, TrendingUp, CheckCircle2,
  Clock, ArrowRight, Trophy, BookOpen, Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Problem {
  id: number
  name: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xp: number
  description: string
  solved?: boolean
}

interface Module {
  id: number
  name: string
  description: string
  problem_ids: number[]
  completed: boolean
}

interface Profile {
  name: string
  xp: number
  level: number
  streak: number
  problems_solved: number
  learning_level: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}
const levelLabels: Record<string, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced'
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [progressMap, setProgressMap] = useState<Record<number, { solved: boolean }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, problemsRes, modulesRes, progressRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/problems'),
          fetch('/api/modules'),
          fetch('/api/progress'),
        ])

        const profileData = await profileRes.json()
        const problemsData = await problemsRes.json()
        const modulesData = await modulesRes.json()
        const progressData = await progressRes.json()

        setProfile(profileData.profile ?? null)
        setProblems(problemsData.problems ?? [])
        setModules(modulesData.modules ?? [])
        setProgressMap(progressData.progress ?? {})
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()

    // Update streak on visit
    fetch('/api/leaderboard', { method: 'POST' }).catch(() => {})
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  const problemsWithProgress = problems.map(p => ({ ...p, solved: progressMap[p.id]?.solved ?? false }))
  const solvedCount = problemsWithProgress.filter(p => p.solved).length
  const totalProblems = problems.length
  const xp = profile?.xp ?? 0
  const level = profile?.level ?? 1
  const xpToNextLevel = (level * 500) - xp
  const levelProgress = ((xp % 500) / 500) * 100

  const todaysChallenge = problemsWithProgress.find(p => !p.solved) || problemsWithProgress[0]
  const continueLearning = modules.find(m => !m.completed) || modules[0]

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Welcome Section */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Welcome back{profile?.name ? `, ${profile.name}` : ''}!
                  </h1>
                  <p className="text-muted-foreground">
                    {profile?.learning_level && `${levelLabels[profile.learning_level]} Level — `}
                    Ready to continue your AI/ML journey?
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">Level {level}</div>
                  <p className="text-sm text-muted-foreground">{xpToNextLevel} XP to next level</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Level Progress</span>
                  <span className="text-primary font-medium">{Math.round(levelProgress)}%</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: xp, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Day Streak', value: profile?.streak ?? 0, icon: Flame, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Problems Solved', value: `${solvedCount}/${totalProblems}`, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Current Level', value: level, icon: TrendingUp, color: 'text-chart-2', bg: 'bg-chart-2/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Challenge */}
          {todaysChallenge && (
            <motion.div variants={item} className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Today&apos;s Challenge
                  </CardTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    todaysChallenge.difficulty === 'Easy' ? 'bg-easy/10 text-easy' :
                    todaysChallenge.difficulty === 'Medium' ? 'bg-medium/10 text-medium' :
                    'bg-hard/10 text-hard'
                  }`}>
                    {todaysChallenge.difficulty}
                  </span>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">{todaysChallenge.name}</h3>
                  <p className="text-muted-foreground mb-4">{todaysChallenge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 inline mr-1 text-primary" />
                        +{todaysChallenge.xp} XP
                      </span>
                      <span className="text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        ~15 min
                      </span>
                    </div>
                    <Link href={`/problems/${todaysChallenge.id}`}>
                      <Button className="gap-2">
                        {todaysChallenge.solved ? 'Review' : 'Start'} Challenge
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Continue Learning */}
          {continueLearning && (
            <motion.div variants={item}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary">
                    <h4 className="font-medium mb-1">{continueLearning.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{continueLearning.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {continueLearning.problem_ids?.length ?? 0} problems
                      </span>
                      <Link href="/modules">
                        <Button variant="outline" size="sm">Continue</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Link href="/problems" className="block">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <CheckCircle2 className="h-4 w-4" />Browse Problems
                        </Button>
                      </Link>
                      <Link href="/games" className="block">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <Trophy className="h-4 w-4" />Play Mini Games
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Recent Problems */}
        {problemsWithProgress.length > 0 && (
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Problems</CardTitle>
                <Link href="/problems">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {problemsWithProgress.slice(0, 5).map((problem) => (
                    <Link key={problem.id} href={`/problems/${problem.id}`}>
                      <motion.div
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-2 w-2 rounded-full ${problem.solved ? 'bg-success' : 'bg-muted-foreground'}`} />
                          <div>
                            <p className="font-medium">{problem.name}</p>
                            <p className="text-sm text-muted-foreground">{problem.topic}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            problem.difficulty === 'Easy' ? 'bg-easy/10 text-easy' :
                            problem.difficulty === 'Medium' ? 'bg-medium/10 text-medium' :
                            'bg-hard/10 text-hard'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-sm text-muted-foreground">+{problem.xp} XP</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  )
}

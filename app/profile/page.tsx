'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Flame,
  Trophy,
  Target,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Sparkles,
  Settings
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const badges = [
  { id: 'beginner', name: 'Beginner', description: 'Started your AI/ML journey', icon: Star, earned: true },
  { id: 'explorer', name: 'Explorer', description: 'Solve 5 problems', icon: Target, earned: false },
  { id: 'streak-3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: Flame, earned: false },
  { id: 'first-hard', name: 'Challenger', description: 'Solve your first hard problem', icon: Trophy, earned: false },
  { id: 'module-complete', name: 'Graduate', description: 'Complete a learning module', icon: Award, earned: false },
  { id: 'game-master', name: 'Game Master', description: 'Play all mini games', icon: Sparkles, earned: false },
]

export default function ProfilePage() {
  const { user, problems, leaderboard } = useAppStore()

  const solvedCount = problems.filter(p => p.solved).length
  const totalProblems = problems.length
  const xpToNextLevel = (user.level * 500) - user.xp
  const levelProgress = ((user.xp % 500) / 500) * 100
  
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp)
  const currentUserRank = sortedLeaderboard.findIndex(e => e.isCurrentUser) + 1

  const easySolved = problems.filter(p => p.difficulty === 'Easy' && p.solved).length
  const mediumSolved = problems.filter(p => p.difficulty === 'Medium' && p.solved).length
  const hardSolved = problems.filter(p => p.difficulty === 'Hard' && p.solved).length

  // Calculate activity for the last 30 days (mock data)
  const activityData = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    active: Math.random() > 0.6
  }))

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Profile Header */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/30">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">AI/ML Enthusiast</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        Joined March 2024
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-warning" />
                        Rank #{currentUserRank}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {/* Level Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">Level {user.level}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {xpToNextLevel} XP to Level {user.level + 1}
                  </span>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{user.xp}</div>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">{user.streak}</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">{solvedCount}</div>
              <p className="text-sm text-muted-foreground">Problems Solved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-chart-2 mx-auto mb-2" />
              <div className="text-2xl font-bold">{user.accuracy}%</div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Stats */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Problem Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Solved by Difficulty */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-easy font-medium">Easy</span>
                      <span>{easySolved}/{problems.filter(p => p.difficulty === 'Easy').length}</span>
                    </div>
                    <Progress 
                      value={(easySolved / problems.filter(p => p.difficulty === 'Easy').length) * 100} 
                      className="h-2 [&>div]:bg-easy"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-medium font-medium">Medium</span>
                      <span>{mediumSolved}/{problems.filter(p => p.difficulty === 'Medium').length}</span>
                    </div>
                    <Progress 
                      value={(mediumSolved / problems.filter(p => p.difficulty === 'Medium').length) * 100} 
                      className="h-2 [&>div]:bg-medium"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-hard font-medium">Hard</span>
                      <span>{hardSolved}/{problems.filter(p => p.difficulty === 'Hard').length}</span>
                    </div>
                    <Progress 
                      value={(hardSolved / problems.filter(p => p.difficulty === 'Hard').length) * 100} 
                      className="h-2 [&>div]:bg-hard"
                    />
                  </div>

                  {/* Topics Progress */}
                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="font-medium mb-3">Topics Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(problems.map(p => p.topic))).map((topic) => {
                        const topicProblems = problems.filter(p => p.topic === topic)
                        const topicSolved = topicProblems.filter(p => p.solved).length
                        return (
                          <div
                            key={topic}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              topicSolved > 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {topic} ({topicSolved}/{topicProblems.length})
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      className={`p-3 rounded-lg border ${
                        badge.earned 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-secondary/50 border-border opacity-50'
                      }`}
                      whileHover={{ scale: badge.earned ? 1.02 : 1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          badge.earned ? 'bg-primary' : 'bg-muted'
                        }`}>
                          <badge.icon className={`h-4 w-4 ${
                            badge.earned ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activity Calendar */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 flex-wrap">
                {activityData.map((day, index) => (
                  <motion.div
                    key={index}
                    className={`w-4 h-4 rounded-sm ${
                      day.active ? 'bg-primary' : 'bg-secondary'
                    }`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    title={`Day ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Keep solving problems to maintain your activity streak!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

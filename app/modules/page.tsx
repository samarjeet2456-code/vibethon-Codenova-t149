'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Zap,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

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

interface Module {
  id: number
  name: string
  description: string
  problem_ids: number[]
  order_index: number
}

interface Problem {
  id: number
  name: string
  xp: number
}

interface ProgressMap {
  [problemId: number]: { solved: boolean; attempts: number; solvedAt: string | null }
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [progress, setProgress] = useState<ProgressMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [modulesRes, problemsRes, progressRes] = await Promise.all([
          fetch('/api/modules'),
          fetch('/api/problems'),
          fetch('/api/progress'),
        ])

        const modulesData = await modulesRes.json()
        const problemsData = await problemsRes.json()
        const progressData = progressRes.ok ? await progressRes.json() : { progress: {} }

        setModules(modulesData.modules ?? [])
        setProblems(problemsData.problems ?? [])
        setProgress(progressData.progress ?? {})
      } catch (err) {
        console.error('Failed to load modules data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getModuleProgress = (mod: Module) => {
    const moduleProblems = problems.filter(p => mod.problem_ids.includes(p.id))
    const solvedCount = moduleProblems.filter(p => progress[p.id]?.solved).length
    return {
      solved: solvedCount,
      total: moduleProblems.length,
      percent: moduleProblems.length > 0 ? (solvedCount / moduleProblems.length) * 100 : 0
    }
  }

  const getModuleXp = (mod: Module) => {
    return problems
      .filter(p => mod.problem_ids.includes(p.id))
      .reduce((acc, p) => acc + p.xp, 0)
  }

  const isModuleUnlocked = (orderIndex: number) => {
    if (orderIndex === 1) return true
    const prevModule = modules.find(m => m.order_index === orderIndex - 1)
    if (!prevModule) return true
    const prog = getModuleProgress(prevModule)
    return prog.percent >= 50
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Learning Modules</h1>
              <p className="text-muted-foreground">
                Structured learning path from Python basics to advanced AI/ML
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Your Progress</h2>
                  <p className="text-muted-foreground">
                    {modules.filter(m => getModuleProgress(m).percent === 100).length} of {modules.length} modules completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {modules.length > 0 ? Math.round(modules.reduce((acc, m) => acc + getModuleProgress(m).percent, 0) / modules.length) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module Cards */}
        <motion.div variants={item} className="relative">
          {/* Connection Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

          <div className="space-y-4">
            {modules.sort((a, b) => a.order_index - b.order_index).map((mod) => {
              const prog = getModuleProgress(mod)
              const moduleXp = getModuleXp(mod)
              const unlocked = isModuleUnlocked(mod.order_index)
              const isComplete = prog.percent === 100

              return (
                <motion.div
                  key={mod.id}
                  variants={item}
                  className="relative"
                >
                  {/* Connection Dot */}
                  <div className={`absolute left-6 top-8 w-4 h-4 rounded-full border-2 hidden lg:flex items-center justify-center z-10 ${
                    isComplete 
                      ? 'bg-primary border-primary' 
                      : unlocked 
                        ? 'bg-background border-primary' 
                        : 'bg-background border-muted'
                  }`}>
                    {isComplete && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                  </div>

                  <Card className={`ml-0 lg:ml-16 ${!unlocked ? 'opacity-60' : ''} ${isComplete ? 'border-primary/30' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                            isComplete ? 'bg-primary' : unlocked ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            {!unlocked ? (
                              <Lock className="h-6 w-6 text-muted-foreground" />
                            ) : isComplete ? (
                              <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                            ) : (
                              <BookOpen className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{mod.name}</h3>
                              <span className="text-xs text-muted-foreground">Module {mod.order_index}</span>
                            </div>
                            <p className="text-muted-foreground mt-1">{mod.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-muted-foreground">
                                {prog.solved}/{prog.total} problems
                              </span>
                              <span className="flex items-center gap-1 text-sm text-primary">
                                <Zap className="h-4 w-4" />
                                {moduleXp} XP
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                          <div className="w-full">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{Math.round(prog.percent)}%</span>
                            </div>
                            <Progress value={prog.percent} className="h-2" />
                          </div>
                          
                          {unlocked && (
                            <Link href={`/problems?module=${mod.id}`}>
                              <Button 
                                variant={isComplete ? 'outline' : 'default'} 
                                size="sm" 
                                className="gap-2"
                              >
                                {isComplete ? 'Review' : 'Continue'}
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

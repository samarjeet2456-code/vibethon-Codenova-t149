'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Zap
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

export default function ModulesPage() {
  const { modules, problems } = useAppStore()

  const getModuleProgress = (module: typeof modules[0]) => {
    const moduleProblems = problems.filter(p => module.problems.includes(p.id))
    const solvedCount = moduleProblems.filter(p => p.solved).length
    return {
      solved: solvedCount,
      total: moduleProblems.length,
      percent: moduleProblems.length > 0 ? (solvedCount / moduleProblems.length) * 100 : 0
    }
  }

  const getModuleXp = (module: typeof modules[0]) => {
    return problems
      .filter(p => module.problems.includes(p.id))
      .reduce((acc, p) => acc + p.xp, 0)
  }

  const isModuleUnlocked = (moduleOrder: number) => {
    if (moduleOrder === 1) return true
    const prevModule = modules.find(m => m.order === moduleOrder - 1)
    if (!prevModule) return true
    const progress = getModuleProgress(prevModule)
    return progress.percent >= 50
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
                    {Math.round(modules.reduce((acc, m) => acc + getModuleProgress(m).percent, 0) / modules.length)}%
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
            {modules.sort((a, b) => a.order - b.order).map((module) => {
              const progress = getModuleProgress(module)
              const moduleXp = getModuleXp(module)
              const unlocked = isModuleUnlocked(module.order)
              const isComplete = progress.percent === 100

              return (
                <motion.div
                  key={module.id}
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
                              <h3 className="text-lg font-semibold">{module.name}</h3>
                              <span className="text-xs text-muted-foreground">Module {module.order}</span>
                            </div>
                            <p className="text-muted-foreground mt-1">{module.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-muted-foreground">
                                {progress.solved}/{progress.total} problems
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
                              <span className="font-medium">{Math.round(progress.percent)}%</span>
                            </div>
                            <Progress value={progress.percent} className="h-2" />
                          </div>
                          
                          {unlocked && (
                            <Link href={`/problems?module=${module.id}`}>
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore, LearningLevel } from '@/lib/store'
import { motion } from 'framer-motion'
import { Brain, Rocket, Target, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const levels: {
  id: LearningLevel
  name: string
  description: string
  icon: React.ElementType
  color: string
  borderColor: string
  bgColor: string
  features: string[]
}[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Focus on visual understanding',
    icon: Brain,
    color: 'text-success',
    borderColor: 'border-success',
    bgColor: 'bg-success/10',
    features: ['Visual explanations', 'Interactive diagrams', 'Step-by-step tutorials'],
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Focus on coding practice',
    icon: Target,
    color: 'text-warning',
    borderColor: 'border-warning',
    bgColor: 'bg-warning/10',
    features: ['Hands-on coding', 'Algorithm challenges', 'Project-based learning'],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Focus on model tuning',
    icon: Rocket,
    color: 'text-destructive',
    borderColor: 'border-destructive',
    bgColor: 'bg-destructive/10',
    features: ['Model optimization', 'Research papers', 'Production deployment'],
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function ModeSelectPage() {
  const [selected, setSelected] = useState<LearningLevel | null>(null)
  const { setLearningLevel } = useAppStore()
  const router = useRouter()

  const handleContinue = () => {
    if (selected) {
      setLearningLevel(selected)
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Choose Your Learning Level</h1>
          <p className="text-muted-foreground">
            Select the path that best matches your current skill level
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {levels.map((level) => {
            const Icon = level.icon
            const isSelected = selected === level.id

            return (
              <motion.div key={level.id} variants={item}>
                <Card
                  className={cn(
                    'cursor-pointer transition-all duration-300 hover:-translate-y-1',
                    'border-2',
                    isSelected
                      ? `${level.borderColor} ${level.bgColor}`
                      : 'border-border/50 hover:border-border'
                  )}
                  onClick={() => setSelected(level.id)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      <div className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl',
                        level.bgColor
                      )}>
                        <Icon className={cn('h-7 w-7', level.color)} />
                      </div>
                    </div>
                    <CardTitle className={cn('text-xl', isSelected && level.color)}>
                      {level.name}
                    </CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {level.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className={cn('h-4 w-4', level.color)} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 flex justify-center"
                      >
                        <div className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          level.bgColor,
                          level.color
                        )}>
                          Selected
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            disabled={!selected}
            onClick={handleContinue}
            className="gap-2 px-8"
          >
            <Zap className="h-4 w-4" />
            Start Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { use, useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  CheckCircle2, 
  Zap,
  ArrowLeft,
  Lightbulb,
  ChevronDown,
  Terminal,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++']

export default function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { problems, solveProblem } = useAppStore()
  const problem = problems.find(p => p.id === parseInt(resolvedParams.id))
  
  const [selectedLanguage, setSelectedLanguage] = useState('Python')
  const [code, setCode] = useState(problem?.starterCode || '')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showXpAnimation, setShowXpAnimation] = useState(false)

  if (!problem) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Problem not found</p>
        </div>
      </AppLayout>
    )
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    
    // Simulate running code
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setOutput(`Running ${problem.name}...\n\n✓ Test case 1 passed\n✓ Test case 2 passed\n✓ Test case 3 passed\n\nAll tests passed! 🎉`)
    setIsRunning(false)
  }

  const handleSubmit = async () => {
    if (problem.solved) return
    
    setIsRunning(true)
    setOutput('')
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setOutput(`Submitting solution...\n\n✓ Test case 1 passed\n✓ Test case 2 passed\n✓ Test case 3 passed\n✓ Test case 4 passed\n✓ Test case 5 passed\n\nAccepted! +${problem.xp} XP 🎉`)
    setIsRunning(false)
    
    // Show XP animation
    setShowXpAnimation(true)
    setTimeout(() => setShowXpAnimation(false), 2000)
    
    // Update store
    solveProblem(problem.id)
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* XP Animation */}
        <AnimatePresence>
          {showXpAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                <Sparkles className="h-8 w-8" />
                <span className="text-3xl font-bold">+{problem.xp} XP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/problems">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">{problem.name}</h1>
                {problem.solved && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  problem.difficulty === 'Easy' ? 'bg-easy/10 text-easy' :
                  problem.difficulty === 'Medium' ? 'bg-medium/10 text-medium' :
                  'bg-hard/10 text-hard'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="text-sm text-muted-foreground">{problem.topic}</span>
                <span className="flex items-center gap-1 text-sm text-primary">
                  <Zap className="h-4 w-4" />
                  {problem.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
          {/* Left - Problem Description */}
          <div className="space-y-4 overflow-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{problem.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-secondary p-4 rounded-lg text-sm font-mono overflow-x-auto">
                  {problem.example}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center justify-between w-full"
                >
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    Explanation
                  </CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
                </button>
              </CardHeader>
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{problem.explanation}</p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Right - Code Editor */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base">Code Editor</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      {selectedLanguage}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {languages.map((lang) => (
                      <DropdownMenuItem key={lang} onClick={() => setSelectedLanguage(lang)}>
                        {lang}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="h-full border-t border-border">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-4 bg-secondary/50 font-mono text-sm resize-none focus:outline-none"
                    spellCheck={false}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/50 p-4 rounded-lg min-h-[120px] font-mono text-sm">
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Play className="h-4 w-4" />
                      </motion.div>
                      Running...
                    </div>
                  ) : output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <span className="text-muted-foreground">Click &quot;Run&quot; to execute your code</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleRun}
                disabled={isRunning}
              >
                <Play className="h-4 w-4" />
                Run
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSubmit}
                disabled={isRunning || problem.solved}
              >
                {problem.solved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Solved
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  )
}

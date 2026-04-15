'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle, CheckCircle2, XCircle, ArrowRight,
  Trophy, RotateCcw, Zap, Sparkles, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [source, setSource] = useState<'ai' | 'static'>('static')

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [finalXp, setFinalXp] = useState(0)
  const [savingResult, setSavingResult] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    setLoadingQuestions(true)
    try {
      const res = await fetch('/api/quiz')
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setSource(data.source ?? 'static')
    } catch {
      setQuestions([])
    } finally {
      setLoadingQuestions(false)
    }
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    if (idx === questions[currentQuestion].correct) setScore(prev => prev + 1)
    setShowExplanation(true)
  }

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      const lastCorrect = selectedAnswer === questions[currentQuestion].correct ? 1 : 0
      const finalScore = score + lastCorrect
      const xpEarned = finalScore * 10
      setFinalXp(xpEarned)
      setQuizComplete(true)
      setShowXpAnimation(true)
      setTimeout(() => setShowXpAnimation(false), 2500)

      // Save to DB
      setSavingResult(true)
      try {
        await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correct: finalScore, total: questions.length }),
        })
      } catch { /* ignore */ } finally {
        setSavingResult(false)
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setQuizComplete(false)
    fetchQuestions()
  }

  if (loadingQuestions) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating AI quiz questions...</p>
        </div>
      </AppLayout>
    )
  }

  if (questions.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">No questions available. Please try again.</p>
          <Button onClick={fetchQuestions}>Retry</Button>
        </div>
      </AppLayout>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <AppLayout>
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
              <span className="text-3xl font-bold">+{finalXp} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI/ML Quiz</h1>
              <p className="text-muted-foreground">
                {source === 'ai' ? '✨ AI-generated questions' : 'Test your knowledge'}
                {' — '}earn 10 XP per correct answer
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">10 XP / correct answer</span>
            </div>
          </div>
        </motion.div>

        {!quizComplete ? (
          <>
            {/* Progress */}
            <motion.div variants={item}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-primary font-medium">Score: {score}/{currentQuestion + (selectedAnswer !== null ? 1 : 0)}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </motion.div>

            {/* Question Card */}
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {currentQ.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      {currentQ.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx
                        const isCorrect = idx === currentQ.correct
                        const showResult = selectedAnswer !== null
                        return (
                          <Button
                            key={idx}
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left h-auto py-4 px-4',
                              showResult && isCorrect && 'bg-success/20 border-success text-success hover:bg-success/20',
                              showResult && isSelected && !isCorrect && 'bg-destructive/20 border-destructive text-destructive hover:bg-destructive/20',
                              !showResult && 'hover:border-primary'
                            )}
                            onClick={() => handleAnswer(idx)}
                            disabled={selectedAnswer !== null}
                          >
                            <span className="mr-3 font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                            <span className="flex-1">{option}</span>
                            {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 ml-2 text-success" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 ml-2 text-destructive" />}
                          </Button>
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-secondary/50 rounded-lg p-4 mt-4"
                      >
                        <p className="text-sm">
                          <span className="font-semibold text-primary">Explanation: </span>
                          <span className="text-muted-foreground">{currentQ.explanation}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {showExplanation && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end pt-4">
                      <Button onClick={handleNext} className="gap-2" disabled={savingResult}>
                        {currentQuestion < questions.length - 1 ? (
                          <>Next Question <ArrowRight className="h-4 w-4" /></>
                        ) : (
                          <>{savingResult ? 'Saving...' : 'Finish Quiz'} <Trophy className="h-4 w-4" /></>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <motion.div variants={item} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-primary" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-muted-foreground mb-6">
                  You answered {score} out of {questions.length} questions correctly
                </p>
                <div className="flex justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{Math.round((score / questions.length) * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">+{finalXp}</div>
                    <div className="text-sm text-muted-foreground">XP Earned</div>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetQuiz} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Try Again
                  </Button>
                  <Button className="gap-2" onClick={resetQuiz}>
                    New Quiz <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  )
}

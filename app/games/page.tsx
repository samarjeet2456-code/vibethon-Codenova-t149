'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gamepad2, 
  Zap,
  Trophy,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Mail,
  Shield
} from 'lucide-react'

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

// Classification Game Data
const classificationItems = [
  { item: 'Linear Regression', category: 'Regression', hint: 'Predicts continuous values' },
  { item: 'Logistic Regression', category: 'Classification', hint: 'Despite the name, used for classification' },
  { item: 'Decision Tree', category: 'Classification', hint: 'Can be used for both, but primarily classification' },
  { item: 'Random Forest', category: 'Classification', hint: 'Ensemble of decision trees' },
  { item: 'K-Means', category: 'Clustering', hint: 'Unsupervised grouping' },
  { item: 'Neural Network', category: 'Classification', hint: 'Can do many tasks, often classification' },
  { item: 'SVM', category: 'Classification', hint: 'Support Vector Machine' },
  { item: 'Ridge Regression', category: 'Regression', hint: 'Regularized linear regression' },
]

// Spam Messages Data
const spamMessages = [
  { text: 'WIN A FREE IPHONE NOW!!!', isSpam: true, explanation: 'Excessive caps, exclamation marks, and too-good-to-be-true offers are common spam indicators.' },
  { text: 'Hey, are we still meeting for coffee tomorrow?', isSpam: false, explanation: 'Personal, conversational messages from known contacts are typically not spam.' },
  { text: 'CONGRATULATIONS! You have been selected to receive $1,000,000!!!', isSpam: true, explanation: 'Unsolicited prize notifications with urgency and large amounts are classic spam patterns.' },
  { text: 'Your Amazon order #12345 has been shipped', isSpam: false, explanation: 'Order confirmations from services you use are legitimate, but always verify the sender.' },
  { text: 'Click here to claim your FREE GIFT CARD before it expires!!!', isSpam: true, explanation: 'Urgency, free offers, and suspicious links are red flags for spam.' },
  { text: 'Reminder: Your dentist appointment is tomorrow at 2pm', isSpam: false, explanation: 'Appointment reminders from your healthcare providers are legitimate communications.' },
]

// Algorithm Problems Data
const algorithmProblems = [
  { 
    problem: 'You want to classify emails as spam or not spam',
    options: ['Linear Regression', 'Logistic Regression', 'K-Means'],
    correct: 1,
    explanation: 'Logistic Regression is ideal for binary classification problems like spam detection.'
  },
  { 
    problem: 'You want to predict house prices based on features',
    options: ['Decision Tree', 'Linear Regression', 'K-Means'],
    correct: 1,
    explanation: 'Linear Regression is best for predicting continuous values like prices.'
  },
  { 
    problem: 'You want to group customers by purchasing behavior',
    options: ['Random Forest', 'Linear Regression', 'K-Means'],
    correct: 2,
    explanation: 'K-Means clustering groups similar data points, perfect for customer segmentation.'
  },
  { 
    problem: 'You want to recognize objects in images',
    options: ['CNN', 'Linear Regression', 'Decision Tree'],
    correct: 0,
    explanation: 'Convolutional Neural Networks (CNNs) are specifically designed for image recognition tasks.'
  },
  { 
    problem: 'You want to predict whether a tumor is malignant or benign',
    options: ['K-Means', 'Random Forest', 'Linear Regression'],
    correct: 1,
    explanation: 'Random Forest is excellent for classification tasks and handles complex decision boundaries well.'
  },
]

// Quiz Data
const quizQuestions = [
  {
    question: 'What does CNN stand for in deep learning?',
    options: ['Convolutional Neural Network', 'Connected Neuron Network', 'Computed Neural Node', 'Central Network Node'],
    correct: 0,
    explanation: 'CNN stands for Convolutional Neural Network, commonly used for image processing.'
  },
  {
    question: 'Which activation function outputs values between 0 and 1?',
    options: ['ReLU', 'Sigmoid', 'Tanh', 'Leaky ReLU'],
    correct: 1,
    explanation: 'Sigmoid function squashes values to the range (0, 1), useful for binary classification.'
  },
  {
    question: 'What is the purpose of dropout in neural networks?',
    options: ['Speed up training', 'Prevent overfitting', 'Increase accuracy', 'Reduce model size'],
    correct: 1,
    explanation: 'Dropout randomly deactivates neurons during training to prevent overfitting.'
  },
  {
    question: 'Which algorithm is used for finding the optimal path in a decision tree?',
    options: ['Gradient Descent', 'Information Gain', 'Backpropagation', 'Adam'],
    correct: 1,
    explanation: 'Information Gain measures the reduction in entropy when splitting on a feature.'
  },
  {
    question: 'What is the main advantage of using batch normalization?',
    options: ['Reduces training time', 'Increases model size', 'Adds more parameters', 'Removes outliers'],
    correct: 0,
    explanation: 'Batch normalization accelerates training by normalizing layer inputs.'
  },
]

type GameType = 'none' | 'classification' | 'quiz' | 'spam' | 'algorithm'

export default function GamesPage() {
  const { addXp, gameScores, updateGameScore } = useAppStore()
  const [activeGame, setActiveGame] = useState<GameType>('none')
  const [classificationScore, setClassificationScore] = useState(0)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  
  // Spam game state
  const [spamIndex, setSpamIndex] = useState(0)
  const [spamScore, setSpamScore] = useState(0)
  const [spamFeedback, setSpamFeedback] = useState<'correct' | 'wrong' | null>(null)
  
  // Algorithm game state
  const [algoIndex, setAlgoIndex] = useState(0)
  const [algoScore, setAlgoScore] = useState(0)
  const [algoSelected, setAlgoSelected] = useState<number | null>(null)
  const [algoShowExplanation, setAlgoShowExplanation] = useState(false)

  const handleCategorySelect = (category: string) => {
    const currentItem = classificationItems[currentItemIndex]
    const isCorrect = category === currentItem.category

    if (isCorrect) {
      setClassificationScore(prev => prev + 10)
      setShowFeedback('correct')
    } else {
      setShowFeedback('wrong')
    }

    setTimeout(() => {
      setShowFeedback(null)
      if (currentItemIndex < classificationItems.length - 1) {
        setCurrentItemIndex(prev => prev + 1)
      } else {
        // Game over
        const finalScore = classificationScore + (isCorrect ? 10 : 0)
        const xp = Math.round(finalScore / 2)
        setXpGained(xp)
        addXp(xp)
        updateGameScore('classification', finalScore)
        setShowXpAnimation(true)
        setTimeout(() => {
          setShowXpAnimation(false)
          setActiveGame('none')
          setClassificationScore(0)
          setCurrentItemIndex(0)
        }, 2000)
      }
    }, 1000)
  }

  const handleQuizAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    const isCorrect = answerIndex === quizQuestions[currentQuestionIndex].correct

    if (isCorrect) {
      setQuizScore(prev => prev + 20)
    }

    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // Quiz complete
      const xp = quizScore + (selectedAnswer === quizQuestions[currentQuestionIndex].correct ? 20 : 0)
      setXpGained(Math.round(xp / 2))
      addXp(Math.round(xp / 2))
      updateGameScore('quiz', xp)
      setShowXpAnimation(true)
      setTimeout(() => {
        setShowXpAnimation(false)
        setActiveGame('none')
        setQuizScore(0)
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
      }, 2000)
    }
  }

  // Spam game handlers
  const handleSpamGuess = (guess: boolean) => {
    const current = spamMessages[spamIndex]
    const isCorrect = guess === current.isSpam

    if (isCorrect) {
      setSpamScore(prev => prev + 15)
      setSpamFeedback('correct')
    } else {
      setSpamFeedback('wrong')
    }

    setTimeout(() => {
      setSpamFeedback(null)
      if (spamIndex < spamMessages.length - 1) {
        setSpamIndex(prev => prev + 1)
      } else {
        const finalScore = spamScore + (isCorrect ? 15 : 0)
        const xp = Math.round(finalScore / 3)
        setXpGained(xp)
        addXp(xp)
        updateGameScore('spam', finalScore)
        setShowXpAnimation(true)
        setTimeout(() => {
          setShowXpAnimation(false)
          setActiveGame('none')
          setSpamIndex(0)
          setSpamScore(0)
        }, 2000)
      }
    }, 1500)
  }

  // Algorithm game handlers
  const handleAlgoSelect = (idx: number) => {
    if (algoSelected !== null) return
    setAlgoSelected(idx)
    const current = algorithmProblems[algoIndex]
    if (idx === current.correct) {
      setAlgoScore(prev => prev + 20)
    }
    setAlgoShowExplanation(true)
  }

  const handleAlgoNext = () => {
    if (algoIndex < algorithmProblems.length - 1) {
      setAlgoIndex(prev => prev + 1)
      setAlgoSelected(null)
      setAlgoShowExplanation(false)
    } else {
      const finalScore = algoScore + (algoSelected === algorithmProblems[algoIndex].correct ? 20 : 0)
      const xp = Math.round(finalScore / 2)
      setXpGained(xp)
      addXp(xp)
      updateGameScore('algorithm', finalScore)
      setShowXpAnimation(true)
      setTimeout(() => {
        setShowXpAnimation(false)
        setActiveGame('none')
        setAlgoIndex(0)
        setAlgoScore(0)
        setAlgoSelected(null)
        setAlgoShowExplanation(false)
      }, 2000)
    }
  }

  const resetGame = (game: GameType) => {
    if (game === 'classification') {
      setClassificationScore(0)
      setCurrentItemIndex(0)
      setShowFeedback(null)
    } else if (game === 'quiz') {
      setQuizScore(0)
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else if (game === 'spam') {
      setSpamIndex(0)
      setSpamScore(0)
      setSpamFeedback(null)
    } else if (game === 'algorithm') {
      setAlgoIndex(0)
      setAlgoScore(0)
      setAlgoSelected(null)
      setAlgoShowExplanation(false)
    }
    setActiveGame(game)
  }

  const classificationHighScore = gameScores.find(g => g.gameId === 'classification')?.highScore || 0
  const quizHighScore = gameScores.find(g => g.gameId === 'quiz')?.highScore || 0
  const spamHighScore = gameScores.find(g => g.gameId === 'spam')?.highScore || 0
  const algoHighScore = gameScores.find(g => g.gameId === 'algorithm')?.highScore || 0

  return (
    <AppLayout>
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
              <span className="text-3xl font-bold">+{xpGained} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h1 className="text-2xl font-bold">Mini Games</h1>
              <p className="text-muted-foreground">
                Learn AI/ML concepts through fun interactive games
              </p>
            </div>
          </div>
        </motion.div>

        {activeGame === 'none' ? (
          /* Game Selection */
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Classification Game Card */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  Classification Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Categorize ML algorithms into Regression, Classification, or Clustering!
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warning" />
                    <span className="text-sm">High Score: {classificationHighScore}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Up to 40 XP</span>
                  </div>
                </div>
                <Button onClick={() => resetGame('classification')} className="w-full gap-2">
                  Play Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Quiz Game Card */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  ML Quiz Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Test your knowledge with multiple choice questions about AI/ML!
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warning" />
                    <span className="text-sm">High Score: {quizHighScore}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Up to 50 XP</span>
                  </div>
                </div>
                <Button onClick={() => resetGame('quiz')} className="w-full gap-2">
                  Play Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Spam Detector Game Card */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-warning" />
                  Spam Detector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Train your spam detection skills! Identify if messages are spam or safe.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warning" />
                    <span className="text-sm">High Score: {spamHighScore}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Up to 30 XP</span>
                  </div>
                </div>
                <Button onClick={() => resetGame('spam')} className="w-full gap-2">
                  Play Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Algorithm Selector Game Card */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-success" />
                  Algorithm Selector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Pick the right ML algorithm for each problem scenario!
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-warning" />
                    <span className="text-sm">High Score: {algoHighScore}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Up to 50 XP</span>
                  </div>
                </div>
                <Button onClick={() => resetGame('algorithm')} className="w-full gap-2">
                  Play Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : activeGame === 'spam' ? (
          /* Spam Detector Game */
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Spam Detector</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {spamIndex + 1}/{spamMessages.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{spamScore}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setActiveGame('none')}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">Is this message spam or safe?</p>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={spamIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-secondary/50 rounded-lg p-6 mb-6 max-w-lg mx-auto"
                    >
                      <p className="text-lg font-medium">&quot;{spamMessages[spamIndex].text}&quot;</p>
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {spamFeedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mb-4"
                      >
                        <div className={`text-xl font-bold ${spamFeedback === 'correct' ? 'text-success' : 'text-destructive'}`}>
                          {spamFeedback === 'correct' ? (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-6 w-6" />
                              Correct! +15 points
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <XCircle className="h-6 w-6" />
                              Wrong!
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                          {spamMessages[spamIndex].explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={() => handleSpamGuess(true)}
                      disabled={spamFeedback !== null}
                      className="min-w-[140px]"
                    >
                      Spam
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleSpamGuess(false)}
                      disabled={spamFeedback !== null}
                      className="min-w-[140px] border-success text-success hover:bg-success/10"
                    >
                      Safe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : activeGame === 'algorithm' ? (
          /* Algorithm Selector Game */
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Algorithm Selector</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {algoIndex + 1}/{algorithmProblems.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{algoScore}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setActiveGame('none')}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">Which algorithm is best for this problem?</p>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={algoIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-secondary/50 rounded-lg p-6 mb-6 max-w-lg mx-auto"
                    >
                      <p className="text-lg font-medium">{algorithmProblems[algoIndex].problem}</p>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex justify-center gap-4 flex-wrap mb-4">
                    {algorithmProblems[algoIndex].options.map((option, idx) => (
                      <Button
                        key={idx}
                        variant={algoSelected === null 
                          ? 'outline' 
                          : idx === algorithmProblems[algoIndex].correct
                            ? 'default'
                            : algoSelected === idx
                              ? 'destructive'
                              : 'outline'
                        }
                        size="lg"
                        onClick={() => handleAlgoSelect(idx)}
                        disabled={algoSelected !== null}
                        className={`min-w-[160px] ${
                          algoSelected !== null && idx === algorithmProblems[algoIndex].correct
                            ? 'bg-success text-success-foreground hover:bg-success'
                            : ''
                        }`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {algoShowExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-secondary/50 rounded-lg p-4 max-w-lg mx-auto"
                      >
                        <p className="text-sm text-muted-foreground">
                          {algorithmProblems[algoIndex].explanation}
                        </p>
                        <Button onClick={handleAlgoNext} className="mt-4 gap-2">
                          {algoIndex < algorithmProblems.length - 1 ? (
                            <>
                              Next Problem
                              <ArrowRight className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Finish Game
                              <CheckCircle2 className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : activeGame === 'classification' ? (
          /* Classification Game */
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Classification Game</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {currentItemIndex + 1}/{classificationItems.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{classificationScore}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setActiveGame('none')}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentItemIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="mb-2 text-sm text-muted-foreground">
                        {classificationItems[currentItemIndex].hint}
                      </div>
                      <div className="text-3xl font-bold mb-8">
                        {classificationItems[currentItemIndex].item}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`mb-4 text-xl font-bold ${showFeedback === 'correct' ? 'text-success' : 'text-destructive'}`}
                      >
                        {showFeedback === 'correct' ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-6 w-6" />
                            Correct! +10 points
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <XCircle className="h-6 w-6" />
                            Wrong! It was {classificationItems[currentItemIndex].category}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center gap-4">
                    {['Regression', 'Classification', 'Clustering'].map((category) => (
                      <Button
                        key={category}
                        variant="outline"
                        size="lg"
                        onClick={() => handleCategorySelect(category)}
                        disabled={showFeedback !== null}
                        className="min-w-[140px]"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Quiz Game */
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ML Quiz Challenge</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1}/{quizQuestions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{quizScore}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setActiveGame('none')}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="py-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h3 className="text-xl font-semibold mb-6 text-center">
                        {quizQuestions[currentQuestionIndex].question}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedAnswer === null 
                              ? 'outline' 
                              : index === quizQuestions[currentQuestionIndex].correct
                                ? 'default'
                                : selectedAnswer === index
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className={`h-auto py-4 px-6 text-left justify-start ${
                              selectedAnswer !== null && index === quizQuestions[currentQuestionIndex].correct
                                ? 'bg-success text-success-foreground hover:bg-success'
                                : ''
                            }`}
                            onClick={() => handleQuizAnswer(index)}
                            disabled={selectedAnswer !== null}
                          >
                            <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </Button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {showExplanation && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 rounded-lg bg-secondary max-w-2xl mx-auto"
                          >
                            <p className="text-sm text-muted-foreground">
                              {quizQuestions[currentQuestionIndex].explanation}
                            </p>
                            <Button onClick={handleNextQuestion} className="mt-4 gap-2">
                              {currentQuestionIndex < quizQuestions.length - 1 ? (
                                <>
                                  Next Question
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  Finish Quiz
                                  <CheckCircle2 className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Instructions */}
        {activeGame === 'none' && (
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Classification Game</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• You&apos;ll see an ML algorithm name</li>
                      <li>• Categorize it as Regression, Classification, or Clustering</li>
                      <li>• Earn 10 points for each correct answer</li>
                      <li>• Complete all items to earn XP!</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">ML Quiz Challenge</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Answer multiple choice questions about AI/ML</li>
                      <li>• Each correct answer earns 20 points</li>
                      <li>• Read explanations to learn from mistakes</li>
                      <li>• Complete the quiz to earn XP!</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  )
}

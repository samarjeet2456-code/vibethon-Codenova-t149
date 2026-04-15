'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Trophy,
  RotateCcw,
  Zap,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const quizQuestions = [
  {
    question: 'What is the main difference between supervised and unsupervised learning?',
    options: [
      'Supervised uses labeled data, unsupervised uses unlabeled data',
      'Supervised is faster than unsupervised',
      'Unsupervised requires more data',
      'There is no difference'
    ],
    correct: 0,
    explanation: 'Supervised learning uses labeled training data (input-output pairs), while unsupervised learning finds patterns in unlabeled data.'
  },
  {
    question: 'Which algorithm is commonly used for classification tasks?',
    options: [
      'Linear Regression',
      'K-Means Clustering',
      'Random Forest',
      'Principal Component Analysis'
    ],
    correct: 2,
    explanation: 'Random Forest is an ensemble classification algorithm. Linear Regression is for regression, K-Means for clustering, and PCA for dimensionality reduction.'
  },
  {
    question: 'What does "overfitting" mean in machine learning?',
    options: [
      'The model is too simple',
      'The model performs well on training data but poorly on new data',
      'The model needs more training data',
      'The model trains too quickly'
    ],
    correct: 1,
    explanation: 'Overfitting occurs when a model learns the training data too well, including noise, making it perform poorly on unseen data.'
  },
  {
    question: 'What is the purpose of the activation function in neural networks?',
    options: [
      'To speed up training',
      'To reduce the model size',
      'To introduce non-linearity',
      'To normalize the weights'
    ],
    correct: 2,
    explanation: 'Activation functions introduce non-linearity, allowing neural networks to learn complex patterns that linear functions cannot capture.'
  },
  {
    question: 'Which metric is commonly used for evaluating classification models?',
    options: [
      'Mean Squared Error',
      'R-squared',
      'Accuracy, Precision, Recall',
      'Mean Absolute Error'
    ],
    correct: 2,
    explanation: 'Accuracy, Precision, and Recall are classification metrics. MSE, R-squared, and MAE are typically used for regression tasks.'
  },
  {
    question: 'What is "gradient descent" used for?',
    options: [
      'Data preprocessing',
      'Feature selection',
      'Optimizing model parameters',
      'Data visualization'
    ],
    correct: 2,
    explanation: 'Gradient descent is an optimization algorithm used to minimize the loss function by iteratively updating model parameters.'
  },
  {
    question: 'What does CNN stand for in deep learning?',
    options: [
      'Connected Neural Network',
      'Convolutional Neural Network',
      'Computed Node Network',
      'Central Neuron Network'
    ],
    correct: 1,
    explanation: 'CNN stands for Convolutional Neural Network, commonly used for image processing and computer vision tasks.'
  },
  {
    question: 'What is the purpose of dropout in neural networks?',
    options: [
      'To speed up training',
      'To prevent overfitting',
      'To increase model accuracy',
      'To reduce model size'
    ],
    correct: 1,
    explanation: 'Dropout randomly deactivates neurons during training to prevent overfitting and improve generalization.'
  },
  {
    question: 'Which type of problem does K-Means solve?',
    options: [
      'Classification',
      'Regression',
      'Clustering',
      'Reinforcement Learning'
    ],
    correct: 2,
    explanation: 'K-Means is a clustering algorithm that groups similar data points together based on distance to centroids.'
  },
  {
    question: 'What is transfer learning?',
    options: [
      'Moving data between databases',
      'Using a pre-trained model for a new task',
      'Transferring weights manually',
      'Converting models between frameworks'
    ],
    correct: 1,
    explanation: 'Transfer learning uses knowledge from a pre-trained model on one task to improve performance on a related task, saving time and resources.'
  }
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

export default function QuizPage() {
  const { addXp, updateQuizScore } = useAppStore()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [showXpAnimation, setShowXpAnimation] = useState(false)

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    const isCorrect = answerIndex === quizQuestions[currentQuestion].correct
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
    
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // Quiz complete
      const finalScore = score + (selectedAnswer === quizQuestions[currentQuestion].correct ? 1 : 0)
      const xpEarned = finalScore * 10
      
      addXp(xpEarned)
      updateQuizScore(finalScore, quizQuestions.length)
      setQuizComplete(true)
      setShowXpAnimation(true)
      setTimeout(() => setShowXpAnimation(false), 2000)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setQuizComplete(false)
  }

  const currentQ = quizQuestions[currentQuestion]

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
              <span className="text-3xl font-bold">+{(score + (selectedAnswer === quizQuestions[currentQuestion]?.correct ? 1 : 0)) * 10} XP</span>
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
              <h1 className="text-2xl font-bold">AI/ML Quiz</h1>
              <p className="text-muted-foreground">
                Test your knowledge and earn XP
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">10 XP per correct answer</span>
            </div>
          </div>
        </motion.div>

        {!quizComplete ? (
          <>
            {/* Progress */}
            <motion.div variants={item}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Question {currentQuestion + 1} of {quizQuestions.length}</span>
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
                            {showResult && isCorrect && (
                              <CheckCircle2 className="h-5 w-5 ml-2 text-success" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <XCircle className="h-5 w-5 ml-2 text-destructive" />
                            )}
                          </Button>
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* Explanation */}
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

                  {/* Next Button */}
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-end pt-4"
                    >
                      <Button onClick={handleNext} className="gap-2">
                        {currentQuestion < quizQuestions.length - 1 ? (
                          <>
                            Next Question
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Finish Quiz
                            <Trophy className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          /* Quiz Complete */
          <motion.div
            variants={item}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
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
                  You answered {score} out of {quizQuestions.length} questions correctly
                </p>

                <div className="flex justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{Math.round((score / quizQuestions.length) * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">+{score * 10}</div>
                    <div className="text-sm text-muted-foreground">XP Earned</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetQuiz} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button className="gap-2">
                    Next Quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tips */}
        {!quizComplete && (
          <motion.div variants={item}>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pro Tip</p>
                    <p className="text-sm text-muted-foreground">
                      Read each question carefully. Even if you get it wrong, the explanation will help you learn!
                    </p>
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

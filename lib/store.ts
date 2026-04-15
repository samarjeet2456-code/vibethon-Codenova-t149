import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Problem {
  id: number
  name: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xp: number
  solved: boolean
  description: string
  example: string
  explanation: string
  starterCode: string
}

export interface Module {
  id: number
  name: string
  description: string
  problems: number[]
  completed: boolean
  order: number
}

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced'

export interface User {
  name: string
  email: string
  avatar: string
  xp: number
  level: number
  streak: number
  problemsSolved: number
  accuracy: number
  badges: string[]
  learningLevel: LearningLevel
  isLoggedIn: boolean
  isGuest: boolean
}

interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  level: number
  isCurrentUser?: boolean
}

interface GameScore {
  gameId: string
  score: number
  highScore: number
}

interface AppState {
  user: User
  problems: Problem[]
  modules: Module[]
  leaderboard: LeaderboardEntry[]
  gameScores: GameScore[]
  quizScores: { correct: number; total: number }
  completedModulesCount: number
  solveProblem: (problemId: number) => void
  addXp: (amount: number) => void
  updateStreak: () => void
  updateGameScore: (gameId: string, score: number) => void
  login: (name: string, email: string) => void
  signup: (name: string, email: string) => void
  loginAsGuest: () => void
  logout: () => void
  setLearningLevel: (level: LearningLevel) => void
  updateQuizScore: (correct: number, total: number) => void
  incrementCompletedModules: () => void
}

const initialProblems: Problem[] = [
  {
    id: 1,
    name: 'Linear Regression Basics',
    topic: 'Regression',
    difficulty: 'Easy',
    xp: 50,
    solved: false,
    description: 'Implement a simple linear regression model to predict housing prices based on square footage.',
    example: 'Input: [[1000], [1500], [2000]]\nOutput: [200000, 300000, 400000]',
    explanation: 'Linear regression finds the best-fit line through data points. The formula is y = mx + b where m is the slope and b is the y-intercept.',
    starterCode: `import numpy as np

def linear_regression(X, y):
    # Your code here
    # Calculate slope (m) and intercept (b)
    # Return predictions
    pass

# Test data
X = np.array([[1000], [1500], [2000]])
y = np.array([200000, 300000, 400000])
predictions = linear_regression(X, y)`
  },
  {
    id: 2,
    name: 'Binary Classification',
    topic: 'Classification',
    difficulty: 'Easy',
    xp: 50,
    solved: false,
    description: 'Build a binary classifier to predict whether an email is spam or not spam.',
    example: 'Input: "Buy now! Limited offer!"\nOutput: "spam"',
    explanation: 'Binary classification assigns data points to one of two classes. Common algorithms include logistic regression and naive bayes.',
    starterCode: `def classify_email(email_text, model):
    # Your code here
    # Preprocess text
    # Use model to predict
    pass`
  },
  {
    id: 3,
    name: 'K-Means Clustering',
    topic: 'Clustering',
    difficulty: 'Medium',
    xp: 100,
    solved: false,
    description: 'Implement K-Means clustering algorithm to group similar customers.',
    example: 'Input: Customer data points\nOutput: Cluster assignments',
    explanation: 'K-Means partitions data into k clusters by minimizing within-cluster variance.',
    starterCode: `import numpy as np

def kmeans(X, k, max_iters=100):
    # Your code here
    # Initialize centroids
    # Iterate until convergence
    pass`
  },
  {
    id: 4,
    name: 'Neural Network Forward Pass',
    topic: 'Neural Networks',
    difficulty: 'Medium',
    xp: 100,
    solved: false,
    description: 'Implement the forward pass of a simple neural network with one hidden layer.',
    example: 'Input: X, weights W1, W2\nOutput: Predictions',
    explanation: 'The forward pass computes activations layer by layer using weights and activation functions.',
    starterCode: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def forward_pass(X, W1, W2):
    # Your code here
    pass`
  },
  {
    id: 5,
    name: 'Sentiment Analysis with NLP',
    topic: 'NLP',
    difficulty: 'Medium',
    xp: 100,
    solved: false,
    description: 'Build a sentiment analyzer to classify movie reviews as positive or negative.',
    example: 'Input: "This movie was amazing!"\nOutput: "positive"',
    explanation: 'Sentiment analysis uses NLP techniques to determine the emotional tone of text.',
    starterCode: `def analyze_sentiment(text):
    # Your code here
    # Tokenize and process text
    # Return sentiment
    pass`
  },
  {
    id: 6,
    name: 'Convolutional Neural Network',
    topic: 'Deep Learning',
    difficulty: 'Hard',
    xp: 200,
    solved: false,
    description: 'Implement a CNN for image classification on the MNIST dataset.',
    example: 'Input: 28x28 grayscale image\nOutput: Digit (0-9)',
    explanation: 'CNNs use convolutional layers to extract spatial features from images.',
    starterCode: `import torch.nn as nn

class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        # Your code here
        
    def forward(self, x):
        # Your code here
        pass`
  },
  {
    id: 7,
    name: 'Transformer Attention',
    topic: 'Deep Learning',
    difficulty: 'Hard',
    xp: 200,
    solved: false,
    description: 'Implement the self-attention mechanism used in Transformers.',
    example: 'Input: Query, Key, Value matrices\nOutput: Attention output',
    explanation: 'Self-attention computes weighted sums of values based on query-key similarities.',
    starterCode: `import numpy as np

def self_attention(Q, K, V):
    # Your code here
    # Compute attention scores
    # Apply softmax
    # Return weighted values
    pass`
  },
  {
    id: 8,
    name: 'Decision Tree Classifier',
    topic: 'Classification',
    difficulty: 'Medium',
    xp: 100,
    solved: false,
    description: 'Build a decision tree classifier from scratch using information gain.',
    example: 'Input: Feature matrix, labels\nOutput: Decision tree',
    explanation: 'Decision trees split data recursively based on feature values that maximize information gain.',
    starterCode: `class DecisionTree:
    def __init__(self, max_depth=5):
        self.max_depth = max_depth
        
    def fit(self, X, y):
        # Your code here
        pass
        
    def predict(self, X):
        # Your code here
        pass`
  },
  {
    id: 9,
    name: 'Gradient Descent Optimization',
    topic: 'Optimization',
    difficulty: 'Easy',
    xp: 50,
    solved: false,
    description: 'Implement batch gradient descent for minimizing a cost function.',
    example: 'Input: Cost function, learning rate\nOutput: Optimal parameters',
    explanation: 'Gradient descent iteratively updates parameters in the direction of steepest descent.',
    starterCode: `def gradient_descent(X, y, learning_rate=0.01, iterations=1000):
    # Your code here
    # Initialize weights
    # Update weights using gradients
    pass`
  },
  {
    id: 10,
    name: 'Reinforcement Learning Q-Table',
    topic: 'Reinforcement Learning',
    difficulty: 'Hard',
    xp: 200,
    solved: false,
    description: 'Implement Q-learning algorithm for a simple grid world environment.',
    example: 'State: (0,0), Action: right → State: (0,1)',
    explanation: 'Q-learning learns action values through trial and error using the Bellman equation.',
    starterCode: `import numpy as np

class QLearning:
    def __init__(self, states, actions, alpha=0.1, gamma=0.99):
        self.q_table = np.zeros((states, actions))
        self.alpha = alpha
        self.gamma = gamma
        
    def update(self, state, action, reward, next_state):
        # Your code here
        pass`
  },
]

const initialModules: Module[] = [
  {
    id: 1,
    name: 'Python Fundamentals',
    description: 'Master Python basics for ML: NumPy, Pandas, and data manipulation.',
    problems: [1, 9],
    completed: false,
    order: 1
  },
  {
    id: 2,
    name: 'Machine Learning Basics',
    description: 'Learn fundamental ML concepts: supervised vs unsupervised learning.',
    problems: [1, 2, 3],
    completed: false,
    order: 2
  },
  {
    id: 3,
    name: 'Regression & Classification',
    description: 'Deep dive into regression and classification algorithms.',
    problems: [1, 2, 8],
    completed: false,
    order: 3
  },
  {
    id: 4,
    name: 'Neural Networks',
    description: 'Build and train neural networks from scratch.',
    problems: [4, 6, 7],
    completed: false,
    order: 4
  },
  {
    id: 5,
    name: 'Natural Language Processing',
    description: 'Process and analyze text data with NLP techniques.',
    problems: [5, 7],
    completed: false,
    order: 5
  },
  {
    id: 6,
    name: 'Advanced Topics',
    description: 'Explore cutting-edge ML: Transformers, RL, and more.',
    problems: [6, 7, 10],
    completed: false,
    order: 6
  },
]

const initialLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex Chen', xp: 5420, level: 15 },
  { rank: 2, name: 'Sarah Kim', xp: 4890, level: 14 },
  { rank: 3, name: 'Mike Johnson', xp: 4350, level: 13 },
  { rank: 4, name: 'Emily Davis', xp: 3980, level: 12 },
  { rank: 5, name: 'You', xp: 0, level: 1, isCurrentUser: true },
  { rank: 6, name: 'Chris Brown', xp: 3200, level: 10 },
  { rank: 7, name: 'Lisa Wang', xp: 2890, level: 9 },
  { rank: 8, name: 'David Lee', xp: 2450, level: 8 },
  { rank: 9, name: 'Anna Smith', xp: 2100, level: 7 },
  { rank: 10, name: 'Tom Wilson', xp: 1850, level: 6 },
]

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 500) + 1
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        name: '',
        email: '',
        avatar: '/avatar.png',
        xp: 0,
        level: 1,
        streak: 0,
        problemsSolved: 0,
        accuracy: 0,
        badges: ['Beginner'],
        learningLevel: 'beginner',
        isLoggedIn: false,
        isGuest: false,
      },
      problems: initialProblems,
      modules: initialModules,
      leaderboard: initialLeaderboard,
      gameScores: [],
      quizScores: { correct: 0, total: 0 },
      completedModulesCount: 0,
      
      solveProblem: (problemId: number) => {
        const state = get()
        const problem = state.problems.find(p => p.id === problemId)
        if (!problem || problem.solved) return
        
        set(state => ({
          problems: state.problems.map(p => 
            p.id === problemId ? { ...p, solved: true } : p
          ),
          user: {
            ...state.user,
            xp: state.user.xp + problem.xp,
            level: calculateLevel(state.user.xp + problem.xp),
            problemsSolved: state.user.problemsSolved + 1,
            accuracy: Math.min(100, state.user.accuracy + 5),
          },
          leaderboard: state.leaderboard.map(entry => 
            entry.isCurrentUser 
              ? { ...entry, xp: state.user.xp + problem.xp, level: calculateLevel(state.user.xp + problem.xp) }
              : entry
          ).sort((a, b) => b.xp - a.xp).map((entry, index) => ({ ...entry, rank: index + 1 }))
        }))
      },
      
      addXp: (amount: number) => {
        set(state => ({
          user: {
            ...state.user,
            xp: state.user.xp + amount,
            level: calculateLevel(state.user.xp + amount),
          },
          leaderboard: state.leaderboard.map(entry => 
            entry.isCurrentUser 
              ? { ...entry, xp: state.user.xp + amount, level: calculateLevel(state.user.xp + amount) }
              : entry
          ).sort((a, b) => b.xp - a.xp).map((entry, index) => ({ ...entry, rank: index + 1 }))
        }))
      },
      
      updateStreak: () => {
        set(state => ({
          user: {
            ...state.user,
            streak: state.user.streak + 1,
          }
        }))
      },
      
      updateGameScore: (gameId: string, score: number) => {
        set(state => {
          const existingScore = state.gameScores.find(g => g.gameId === gameId)
          if (existingScore) {
            return {
              gameScores: state.gameScores.map(g => 
                g.gameId === gameId 
                  ? { ...g, score, highScore: Math.max(g.highScore, score) }
                  : g
              )
            }
          }
          return {
            gameScores: [...state.gameScores, { gameId, score, highScore: score }]
          }
        })
      },

      login: (name: string, email: string) => {
        set(state => ({
          user: {
            ...state.user,
            name,
            email,
            isLoggedIn: true,
            isGuest: false,
          }
        }))
      },

      signup: (name: string, email: string) => {
        set(state => ({
          user: {
            ...state.user,
            name,
            email,
            isLoggedIn: true,
            isGuest: false,
          }
        }))
      },

      loginAsGuest: () => {
        set(state => ({
          user: {
            ...state.user,
            name: 'Guest',
            email: '',
            isLoggedIn: true,
            isGuest: true,
          }
        }))
      },

      logout: () => {
        set(state => ({
          user: {
            ...state.user,
            name: '',
            email: '',
            isLoggedIn: false,
            isGuest: false,
          }
        }))
      },

      setLearningLevel: (level: LearningLevel) => {
        set(state => ({
          user: {
            ...state.user,
            learningLevel: level,
          }
        }))
      },

      updateQuizScore: (correct: number, total: number) => {
        set(state => ({
          quizScores: {
            correct: state.quizScores.correct + correct,
            total: state.quizScores.total + total,
          }
        }))
      },

      incrementCompletedModules: () => {
        set(state => ({
          completedModulesCount: state.completedModulesCount + 1,
        }))
      },
    }),
    {
      name: 'aiml-practice-storage',
    }
  )
)

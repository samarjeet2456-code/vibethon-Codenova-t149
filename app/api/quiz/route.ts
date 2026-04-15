import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import Groq from 'groq-sdk'

// Static fallback questions (shown when Groq AI is not available)
const STATIC_QUESTIONS = [
  {
    question: 'What is the main difference between supervised and unsupervised learning?',
    options: [
      'Supervised uses labeled data, unsupervised uses unlabeled data',
      'Supervised is faster than unsupervised',
      'Unsupervised requires more data',
      'There is no difference',
    ],
    correct: 0,
    explanation: 'Supervised learning uses labeled training data (input-output pairs), while unsupervised learning finds patterns in unlabeled data.',
  },
  {
    question: 'Which algorithm is commonly used for classification tasks?',
    options: ['Linear Regression', 'K-Means Clustering', 'Random Forest', 'Principal Component Analysis'],
    correct: 2,
    explanation: 'Random Forest is an ensemble classification algorithm. Linear Regression is for regression, K-Means for clustering, and PCA for dimensionality reduction.',
  },
  {
    question: 'What does "overfitting" mean in machine learning?',
    options: [
      'The model is too simple',
      'The model performs well on training data but poorly on new data',
      'The model needs more training data',
      'The model trains too quickly',
    ],
    correct: 1,
    explanation: 'Overfitting occurs when a model learns the training data too well, including noise, making it perform poorly on unseen data.',
  },
  {
    question: 'What is the purpose of the activation function in neural networks?',
    options: ['To speed up training', 'To reduce the model size', 'To introduce non-linearity', 'To normalize the weights'],
    correct: 2,
    explanation: 'Activation functions introduce non-linearity, allowing neural networks to learn complex patterns.',
  },
  {
    question: 'Which metric is used for evaluating classification models?',
    options: ['Mean Squared Error', 'R-squared', 'Accuracy, Precision, Recall', 'Mean Absolute Error'],
    correct: 2,
    explanation: 'Accuracy, Precision, and Recall are classification metrics. MSE, R-squared, and MAE are for regression.',
  },
  {
    question: 'What is "gradient descent" used for?',
    options: ['Data preprocessing', 'Feature selection', 'Optimizing model parameters', 'Data visualization'],
    correct: 2,
    explanation: 'Gradient descent is an optimization algorithm that minimizes the loss function by iteratively updating model parameters.',
  },
  {
    question: 'What does CNN stand for in deep learning?',
    options: ['Connected Neural Network', 'Convolutional Neural Network', 'Computed Node Network', 'Central Neuron Network'],
    correct: 1,
    explanation: 'CNN stands for Convolutional Neural Network, used for image processing and computer vision tasks.',
  },
  {
    question: 'What is the purpose of dropout in neural networks?',
    options: ['To speed up training', 'To prevent overfitting', 'To increase model accuracy', 'To reduce model size'],
    correct: 1,
    explanation: 'Dropout randomly deactivates neurons during training to prevent overfitting and improve generalization.',
  },
  {
    question: 'Which type of problem does K-Means solve?',
    options: ['Classification', 'Regression', 'Clustering', 'Reinforcement Learning'],
    correct: 2,
    explanation: 'K-Means is a clustering algorithm that groups similar data points together based on distance to centroids.',
  },
  {
    question: 'What is transfer learning?',
    options: [
      'Moving data between databases',
      'Using a pre-trained model for a new task',
      'Transferring weights manually',
      'Converting models between frameworks',
    ],
    correct: 1,
    explanation: 'Transfer learning uses a pre-trained model on one task to improve performance on a related task.',
  },
]

async function generateQuestionsWithGroq(topic?: string): Promise<typeof STATIC_QUESTIONS | null> {
  try {
    if (!process.env.GROQ_API_KEY) return null

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `Generate 10 multiple choice questions about ${topic || 'machine learning and AI'}.
Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0,
    "explanation": "brief explanation of the correct answer"
  }
]
- "correct" is the 0-based index of the correct option
- Make questions progressively harder
- Focus on practical ML/AI concepts`

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_completion_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const text = chatCompletion.choices[0]?.message?.content?.trim() ?? ''

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null

    const questions = JSON.parse(jsonMatch[0])
    if (!Array.isArray(questions) || questions.length === 0) return null

    return questions
  } catch (err) {
    console.error('Groq quiz generation failed:', err)
    return null
  }
}

// GET /api/quiz — return quiz questions (AI-generated or static)
export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get('topic') || undefined

  // Try AI-generated first, fall back to static
  const aiQuestions = await generateQuestionsWithGroq(topic)
  const questions = aiQuestions ?? STATIC_QUESTIONS

  return NextResponse.json({ questions, source: aiQuestions ? 'ai' : 'static' })
}

// POST /api/quiz — save quiz result
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { correct, total } = await req.json()
    const xpEarned = correct * 10

    // Save quiz attempt
    const { error } = await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      correct,
      total,
      xp_earned: xpEarned,
    })

    if (error) throw error

    // Add XP to profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .single()

    const newXp = (profile?.xp ?? 0) + xpEarned
    const newLevel = Math.floor(newXp / 500) + 1

    await supabase
      .from('profiles')
      .update({ xp: newXp, level: newLevel })
      .eq('id', user.id)

    return NextResponse.json({ xpEarned, newXp, newLevel })
  } catch (error) {
    console.error('POST /api/quiz error:', error)
    return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 })
  }
}

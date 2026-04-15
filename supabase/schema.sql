-- ================================================
-- AIML Practice Platform – Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ================================================

-- ─── 1. PROFILES ──────────────────────────────────────────────────
-- Extends auth.users. Created automatically on signup via trigger.
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name            TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  xp              INTEGER NOT NULL DEFAULT 0,
  level           INTEGER NOT NULL DEFAULT 1,
  streak          INTEGER NOT NULL DEFAULT 0,
  last_active     DATE,
  learning_level  TEXT NOT NULL DEFAULT 'beginner',   -- 'beginner'|'intermediate'|'advanced'
  problems_solved INTEGER NOT NULL DEFAULT 0,
  badges          TEXT[] NOT NULL DEFAULT ARRAY['Beginner']::TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. PROBLEMS ──────────────────────────────────────────────────
-- Stores all ML coding problems.
CREATE TABLE IF NOT EXISTS problems (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  topic        TEXT NOT NULL,
  difficulty   TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  xp           INTEGER NOT NULL,
  description  TEXT NOT NULL,
  example      TEXT NOT NULL,
  explanation  TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  test_cases   JSONB NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. MODULES ───────────────────────────────────────────────────
-- Learning modules that group problems together.
CREATE TABLE IF NOT EXISTS modules (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_ids INTEGER[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. USER PROGRESS ─────────────────────────────────────────────
-- Tracks which problems each user has solved.
CREATE TABLE IF NOT EXISTS user_progress (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  solved     BOOLEAN NOT NULL DEFAULT FALSE,
  solved_at  TIMESTAMPTZ,
  attempts   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, problem_id)
);

-- ─── 5. SUBMISSIONS ───────────────────────────────────────────────
-- Logs every code submission a user makes.
CREATE TABLE IF NOT EXISTS submissions (
  id           SERIAL PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  problem_id   INTEGER REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  code         TEXT NOT NULL,
  language     TEXT NOT NULL DEFAULT 'Python',
  status       TEXT NOT NULL DEFAULT 'Pending', -- 'Accepted'|'Wrong Answer'|'Error'
  output       TEXT,
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 6. QUIZ ATTEMPTS ─────────────────────────────────────────────
-- Records every quiz attempt and score.
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id           SERIAL PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  correct      INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  xp_earned    INTEGER NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 7. GAME SCORES ───────────────────────────────────────────────
-- Stores high scores for each mini game per user.
CREATE TABLE IF NOT EXISTS game_scores (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_id    TEXT NOT NULL,
  score      INTEGER NOT NULL DEFAULT 0,
  high_score INTEGER NOT NULL DEFAULT 0,
  played_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems     ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores  ENABLE ROW LEVEL SECURITY;

-- Problems & Modules are public (read-only for everyone)
CREATE POLICY "problems_public_read"  ON problems  FOR SELECT USING (true);
CREATE POLICY "modules_public_read"   ON modules   FOR SELECT USING (true);

-- Profiles: public read (for leaderboard), own write
CREATE POLICY "profiles_public_read"  ON profiles  FOR SELECT USING (true);
CREATE POLICY "profiles_own_insert"   ON profiles  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update"   ON profiles  FOR UPDATE USING (auth.uid() = id);

-- user_progress: users manage their own
CREATE POLICY "progress_own_select"   ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_own_insert"   ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_own_update"   ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- submissions: users manage their own
CREATE POLICY "submissions_own_select" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "submissions_own_insert" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- quiz_attempts: users manage their own
CREATE POLICY "quiz_own_select" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quiz_own_insert" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- game_scores: users manage their own
CREATE POLICY "games_own_select" ON game_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "games_own_insert" ON game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "games_own_update" ON game_scores FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- TRIGGER: Auto-create profile on signup
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- SEED DATA: Problems
-- ================================================
INSERT INTO problems (name, topic, difficulty, xp, description, example, explanation, starter_code, test_cases) VALUES
(
  'Linear Regression Basics', 'Regression', 'Easy', 50,
  'Implement a simple linear regression model to predict housing prices based on square footage.',
  'Input: [[1000], [1500], [2000]]' || chr(10) || 'Output: [200000, 300000, 400000]',
  'Linear regression finds the best-fit line through data points. The formula is y = mx + b where m is the slope and b is the y-intercept.',
  'import numpy as np' || chr(10) || chr(10) || 'def linear_regression(X, y):' || chr(10) || '    # Calculate slope (m) and intercept (b)' || chr(10) || '    # Return predictions' || chr(10) || '    pass' || chr(10) || chr(10) || 'X = np.array([[1000], [1500], [2000]])' || chr(10) || 'y = np.array([200000, 300000, 400000])' || chr(10) || 'predictions = linear_regression(X, y)' || chr(10) || 'print(predictions)',
  '[{"input": "[[1000],[1500],[2000]] [200000,300000,400000]", "expected_output": "[200000. 300000. 400000.]"}]'
),
(
  'Binary Classification', 'Classification', 'Easy', 50,
  'Build a binary classifier to predict whether an email is spam or not spam.',
  'Input: "Buy now! Limited offer!"' || chr(10) || 'Output: "spam"',
  'Binary classification assigns data points to one of two classes. Common algorithms include logistic regression and naive bayes.',
  'def classify_email(email_text, threshold=0.5):' || chr(10) || '    # Preprocess text' || chr(10) || '    # Return "spam" or "not spam"' || chr(10) || '    pass' || chr(10) || chr(10) || 'print(classify_email("Buy now! Limited offer!"))',
  '[{"input": "Buy now! Limited offer!", "expected_output": "spam"}]'
),
(
  'K-Means Clustering', 'Clustering', 'Medium', 100,
  'Implement K-Means clustering algorithm to group similar customers.',
  'Input: Customer data points' || chr(10) || 'Output: Cluster assignments',
  'K-Means partitions data into k clusters by minimizing within-cluster variance.',
  'import numpy as np' || chr(10) || chr(10) || 'def kmeans(X, k, max_iters=100):' || chr(10) || '    # Initialize centroids' || chr(10) || '    # Iterate until convergence' || chr(10) || '    pass' || chr(10) || chr(10) || 'X = np.array([[1,2],[1,4],[1,0],[10,2],[10,4],[10,0]])' || chr(10) || 'labels = kmeans(X, k=2)' || chr(10) || 'print(labels)',
  '[]'
),
(
  'Neural Network Forward Pass', 'Neural Networks', 'Medium', 100,
  'Implement the forward pass of a simple neural network with one hidden layer.',
  'Input: X, weights W1, W2' || chr(10) || 'Output: Predictions',
  'The forward pass computes activations layer by layer using weights and activation functions.',
  'import numpy as np' || chr(10) || chr(10) || 'def sigmoid(x):' || chr(10) || '    return 1 / (1 + np.exp(-x))' || chr(10) || chr(10) || 'def forward_pass(X, W1, W2):' || chr(10) || '    # Compute hidden layer' || chr(10) || '    # Compute output layer' || chr(10) || '    pass' || chr(10) || chr(10) || 'X = np.array([[0.5, 0.8]])' || chr(10) || 'W1 = np.random.randn(2, 3)' || chr(10) || 'W2 = np.random.randn(3, 1)' || chr(10) || 'print(forward_pass(X, W1, W2))',
  '[]'
),
(
  'Sentiment Analysis with NLP', 'NLP', 'Medium', 100,
  'Build a sentiment analyzer to classify movie reviews as positive or negative.',
  'Input: "This movie was amazing!"' || chr(10) || 'Output: "positive"',
  'Sentiment analysis uses NLP techniques to determine the emotional tone of text.',
  'def analyze_sentiment(text):' || chr(10) || '    positive_words = ["amazing", "great", "excellent", "good", "love"]' || chr(10) || '    negative_words = ["terrible", "bad", "awful", "hate", "boring"]' || chr(10) || '    # Count positive vs negative words' || chr(10) || '    pass' || chr(10) || chr(10) || 'print(analyze_sentiment("This movie was amazing!"))' || chr(10) || 'print(analyze_sentiment("Terrible and boring film."))',
  '[{"input": "This movie was amazing!", "expected_output": "positive"}, {"input": "Terrible and boring film.", "expected_output": "negative"}]'
),
(
  'Convolutional Neural Network', 'Deep Learning', 'Hard', 200,
  'Implement a CNN for image classification on the MNIST dataset.',
  'Input: 28x28 grayscale image' || chr(10) || 'Output: Digit (0-9)',
  'CNNs use convolutional layers to extract spatial features from images.',
  'import torch.nn as nn' || chr(10) || chr(10) || 'class CNN(nn.Module):' || chr(10) || '    def __init__(self):' || chr(10) || '        super().__init__()' || chr(10) || '        # Define conv layers, pooling, fc layers' || chr(10) || '        pass' || chr(10) || chr(10) || '    def forward(self, x):' || chr(10) || '        # Forward pass through layers' || chr(10) || '        pass' || chr(10) || chr(10) || 'model = CNN()' || chr(10) || 'print(model)',
  '[]'
),
(
  'Transformer Self-Attention', 'Deep Learning', 'Hard', 200,
  'Implement the self-attention mechanism used in Transformers.',
  'Input: Query, Key, Value matrices' || chr(10) || 'Output: Attention output',
  'Self-attention computes weighted sums of values based on query-key similarities.',
  'import numpy as np' || chr(10) || chr(10) || 'def self_attention(Q, K, V):' || chr(10) || '    d_k = Q.shape[-1]' || chr(10) || '    # Compute attention scores' || chr(10) || '    # Apply softmax' || chr(10) || '    # Return weighted values' || chr(10) || '    pass' || chr(10) || chr(10) || 'Q = np.random.randn(4, 8)' || chr(10) || 'K = np.random.randn(4, 8)' || chr(10) || 'V = np.random.randn(4, 8)' || chr(10) || 'print(self_attention(Q, K, V))',
  '[]'
),
(
  'Decision Tree Classifier', 'Classification', 'Medium', 100,
  'Build a decision tree classifier from scratch using information gain.',
  'Input: Feature matrix, labels' || chr(10) || 'Output: Predicted labels',
  'Decision trees split data recursively based on feature values that maximize information gain.',
  'class DecisionTree:' || chr(10) || '    def __init__(self, max_depth=5):' || chr(10) || '        self.max_depth = max_depth' || chr(10) || chr(10) || '    def fit(self, X, y):' || chr(10) || '        # Build the tree' || chr(10) || '        pass' || chr(10) || chr(10) || '    def predict(self, X):' || chr(10) || '        # Traverse tree for each sample' || chr(10) || '        pass' || chr(10) || chr(10) || 'dt = DecisionTree()' || chr(10) || 'print("Decision Tree created")',
  '[]'
),
(
  'Gradient Descent Optimization', 'Optimization', 'Easy', 50,
  'Implement batch gradient descent for minimizing a cost function.',
  'Input: Cost function, learning rate=0.01' || chr(10) || 'Output: Optimal weights',
  'Gradient descent iteratively updates parameters in the direction of steepest descent.',
  'import numpy as np' || chr(10) || chr(10) || 'def gradient_descent(X, y, learning_rate=0.01, iterations=1000):' || chr(10) || '    m, n = X.shape' || chr(10) || '    weights = np.zeros(n)' || chr(10) || '    # Update weights using gradients' || chr(10) || '    pass' || chr(10) || chr(10) || 'X = np.array([[1,1],[1,2],[1,3]])' || chr(10) || 'y = np.array([1, 2, 3])' || chr(10) || 'w = gradient_descent(X, y)' || chr(10) || 'print(w)',
  '[]'
),
(
  'Q-Learning Agent', 'Reinforcement Learning', 'Hard', 200,
  'Implement Q-learning algorithm for a simple grid world environment.',
  'State: (0,0), Action: right → State: (0,1)' || chr(10) || 'Reward: -1 per step, +100 at goal',
  'Q-learning learns action values through trial and error using the Bellman equation.',
  'import numpy as np' || chr(10) || chr(10) || 'class QLearning:' || chr(10) || '    def __init__(self, states, actions, alpha=0.1, gamma=0.99, epsilon=0.1):' || chr(10) || '        self.q_table = np.zeros((states, actions))' || chr(10) || '        self.alpha = alpha' || chr(10) || '        self.gamma = gamma' || chr(10) || '        self.epsilon = epsilon' || chr(10) || chr(10) || '    def choose_action(self, state):' || chr(10) || '        # Epsilon-greedy exploration' || chr(10) || '        pass' || chr(10) || chr(10) || '    def update(self, state, action, reward, next_state):' || chr(10) || '        # Bellman equation update' || chr(10) || '        pass' || chr(10) || chr(10) || 'agent = QLearning(states=16, actions=4)' || chr(10) || 'print("Q-Table shape:", agent.q_table.shape)',
  '[]'
);

-- ================================================
-- SEED DATA: Modules
-- ================================================
INSERT INTO modules (name, description, problem_ids, order_index) VALUES
('Python Fundamentals',       'Master Python basics for ML: NumPy, Pandas, and data manipulation.', ARRAY[1, 9],           1),
('Machine Learning Basics',   'Learn fundamental ML concepts: supervised vs unsupervised learning.', ARRAY[1, 2, 3],        2),
('Regression & Classification','Deep dive into regression and classification algorithms.',            ARRAY[1, 2, 8],        3),
('Neural Networks',           'Build and train neural networks from scratch.',                       ARRAY[4, 6, 7],        4),
('Natural Language Processing','Process and analyze text data with NLP techniques.',                 ARRAY[5, 7],           5),
('Advanced Topics',           'Explore cutting-edge ML: Transformers, RL, and more.',               ARRAY[6, 7, 10],       6);

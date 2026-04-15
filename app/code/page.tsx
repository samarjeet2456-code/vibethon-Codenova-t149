'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Code, 
  Sparkles,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react'

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

const defaultCode = `# Welcome to the AI/ML Code Editor
# Try running some Python code!

print("Hello AI/ML World!")

# Simple ML example
data = [1, 2, 3, 4, 5]
mean = sum(data) / len(data)
print(f"Mean: {mean}")

# List comprehension
squares = [x**2 for x in data]
print(f"Squares: {squares}")`

const codeExamples = [
  {
    name: 'Hello AI',
    code: `print("Hello AI/ML World!")`,
    output: 'Hello AI/ML World!'
  },
  {
    name: 'Linear Regression',
    code: `import numpy as np

# Simple Linear Regression
X = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 5])

# Calculate coefficients
mean_x = np.mean(X)
mean_y = np.mean(y)
slope = np.sum((X - mean_x) * (y - mean_y)) / np.sum((X - mean_x)**2)
intercept = mean_y - slope * mean_x

print(f"Slope: {slope:.2f}")
print(f"Intercept: {intercept:.2f}")
print(f"Equation: y = {slope:.2f}x + {intercept:.2f}")`,
    output: `Slope: 0.60
Intercept: 2.20
Equation: y = 0.60x + 2.20`
  },
  {
    name: 'K-Means',
    code: `import numpy as np

# Simple K-Means clustering
def kmeans(X, k=2, max_iters=10):
    # Random initialization
    centroids = X[np.random.choice(len(X), k, replace=False)]
    
    for _ in range(max_iters):
        # Assign clusters
        distances = np.array([[np.linalg.norm(x - c) for c in centroids] for x in X])
        labels = np.argmin(distances, axis=1)
        
        # Update centroids
        new_centroids = np.array([X[labels == i].mean(axis=0) for i in range(k)])
        centroids = new_centroids
    
    return labels, centroids

# Sample data
X = np.array([[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]])
labels, centroids = kmeans(X, k=2)

print(f"Cluster labels: {labels}")
print(f"Centroids: {centroids}")`,
    output: `Cluster labels: [0 0 1 1 0 1]
Centroids: [[1.17 1.47]
 [7.33 9.00]]`
  }
]

export default function CodePage() {
  const [code, setCode] = useState(defaultCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const simulateRun = () => {
    setIsRunning(true)
    setOutput('')
    
    // Simulate code execution
    setTimeout(() => {
      let simulatedOutput = ''
      
      // Simple parser to detect print statements
      const printRegex = /print\(['"](.*?)['"]\)/g
      const fPrintRegex = /print\(f['"](.*?)['"]\)/g
      
      let match
      const outputs: string[] = []
      
      // Check for basic print statements
      while ((match = printRegex.exec(code)) !== null) {
        outputs.push(match[1])
      }
      
      // If no print found, check for f-strings (simplified)
      if (outputs.length === 0) {
        while ((match = fPrintRegex.exec(code)) !== null) {
          // Simplified f-string handling
          outputs.push(match[1].replace(/\{.*?\}/g, '<computed>'))
        }
      }
      
      if (outputs.length > 0) {
        simulatedOutput = outputs.join('\n')
      } else {
        // Default output for code without print statements
        simulatedOutput = 'Code executed successfully.\n(Add print() statements to see output)'
      }
      
      // Check for specific examples
      if (code.includes('Hello AI')) {
        simulatedOutput = 'Hello AI/ML World!'
      }
      
      if (code.includes('Mean:')) {
        simulatedOutput = 'Hello AI/ML World!\nMean: 3.0\nSquares: [1, 4, 9, 16, 25]'
      }
      
      setOutput(simulatedOutput)
      setIsRunning(false)
    }, 1000)
  }

  const loadExample = (example: typeof codeExamples[0]) => {
    setCode(example.code)
    setOutput('')
  }

  const resetCode = () => {
    setCode(defaultCode)
    setOutput('')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              <h1 className="text-2xl font-bold">Code Editor</h1>
              <p className="text-muted-foreground">
                Write and run Python code for AI/ML practice
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Code className="h-3 w-3" />
                Python
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Example Buttons */}
        <motion.div variants={item}>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground py-2 mr-2">Examples:</span>
            {codeExamples.map((example, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => loadExample(example)}
                className="gap-1"
              >
                <Sparkles className="h-3 w-3" />
                {example.name}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Code Editor */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Code Editor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={copyCode}>
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={resetCode}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-zinc-950 border-border resize-none"
                placeholder="Write your Python code here..."
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Run Button */}
        <motion.div variants={item} className="flex justify-center">
          <Button
            size="lg"
            onClick={simulateRun}
            disabled={isRunning}
            className="gap-2 px-8"
          >
            {isRunning ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RotateCcw className="h-4 w-4" />
                </motion.div>
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        </motion.div>

        {/* Output Console */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Output Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-950 rounded-lg p-4 min-h-[150px] font-mono text-sm">
                <AnimatePresence mode="wait">
                  {isRunning ? (
                    <motion.div
                      key="running"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-muted-foreground"
                    >
                      <span className="inline-block animate-pulse">Running code...</span>
                    </motion.div>
                  ) : output ? (
                    <motion.div
                      key="output"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2 text-success mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Execution successful</span>
                      </div>
                      <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground"
                    >
                      Click &quot;Run Code&quot; to see output...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use <code className="text-primary">print()</code> statements to see output</li>
                <li>• Try the example buttons above for ML code snippets</li>
                <li>• This is a simulated environment for learning purposes</li>
                <li>• For actual ML development, use Jupyter Notebook or Google Colab</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

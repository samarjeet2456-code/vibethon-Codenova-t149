'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  Code
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

export default function LearnPage() {
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
              <h1 className="text-2xl font-bold">Learn AI/ML Concepts</h1>
              <p className="text-muted-foreground">
                Master machine learning fundamentals with interactive lessons
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" />
              Lesson 1 of 6
            </Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Introduction to Decision Trees
                </CardTitle>
                <Badge>Beginner Friendly</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction */}
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  A <strong className="text-foreground">Decision Tree</strong> is one of the most intuitive and widely used 
                  machine learning algorithms. It works by splitting data into smaller subsets based on feature values, 
                  creating a tree-like structure of decisions.
                </p>
              </div>

              {/* Key Concepts */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Key Concepts
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong className="text-foreground">Root Node:</strong> The topmost node that represents the entire dataset</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong className="text-foreground">Internal Nodes:</strong> Nodes that represent a test on an attribute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong className="text-foreground">Leaf Nodes:</strong> Terminal nodes that represent the final decision/class</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                    <span><strong className="text-foreground">Branches:</strong> Connections between nodes representing decision rules</span>
                  </li>
                </ul>
              </div>

              {/* Visual Flowchart */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="font-semibold mb-4 text-center">Decision Tree Example: Should I Play Tennis?</h3>
                <div className="flex flex-col items-center">
                  {/* Root Node */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-primary/20 border-2 border-primary rounded-lg px-6 py-3 font-medium"
                  >
                    Weather?
                  </motion.div>
                  
                  {/* Branches */}
                  <div className="flex items-center justify-center w-full mt-2">
                    <div className="w-32 h-8 border-l-2 border-b-2 border-muted-foreground/30" />
                    <div className="w-8 h-8 border-b-2 border-muted-foreground/30" />
                    <div className="w-32 h-8 border-r-2 border-b-2 border-muted-foreground/30" />
                  </div>
                  
                  {/* Second Level */}
                  <div className="flex items-start justify-center gap-16 mt-2">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-2">Sunny</span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-warning/20 border-2 border-warning rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        Humidity?
                      </motion.div>
                      <div className="flex items-center mt-2">
                        <div className="w-12 h-6 border-l-2 border-b-2 border-muted-foreground/30" />
                        <div className="w-12 h-6 border-r-2 border-b-2 border-muted-foreground/30" />
                      </div>
                      <div className="flex gap-8 mt-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1">High</span>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-destructive/20 border-2 border-destructive rounded-lg px-3 py-1 text-xs"
                          >
                            No
                          </motion.div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1">Normal</span>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-success/20 border-2 border-success rounded-lg px-3 py-1 text-xs"
                          >
                            Yes
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-2">Overcast</span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-success/20 border-2 border-success rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        Yes
                      </motion.div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-2">Rainy</span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-warning/20 border-2 border-warning rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        Wind?
                      </motion.div>
                      <div className="flex items-center mt-2">
                        <div className="w-12 h-6 border-l-2 border-b-2 border-muted-foreground/30" />
                        <div className="w-12 h-6 border-r-2 border-b-2 border-muted-foreground/30" />
                      </div>
                      <div className="flex gap-8 mt-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1">Strong</span>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-destructive/20 border-2 border-destructive rounded-lg px-3 py-1 text-xs"
                          >
                            No
                          </motion.div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1">Weak</span>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-success/20 border-2 border-success rounded-lg px-3 py-1 text-xs"
                          >
                            Yes
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Algorithm Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    How It Works
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Select the best feature using Information Gain or Gini Index</li>
                    <li>Split the dataset based on the selected feature</li>
                    <li>Repeat recursively for each subset</li>
                    <li>Stop when all samples belong to one class or max depth reached</li>
                  </ol>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Advantages
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-success" />
                      Easy to understand and interpret
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-success" />
                      Requires little data preprocessing
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-success" />
                      Can handle both numerical and categorical data
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-success" />
                      Works well with non-linear relationships
                    </li>
                  </ul>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" disabled>
                  Previous Lesson
                </Button>
                <Button className="gap-2">
                  Next Lesson
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Topics */}
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Random Forests', desc: 'Ensemble of decision trees', locked: false },
              { title: 'Information Gain', desc: 'Feature selection metric', locked: false },
              { title: 'Pruning Techniques', desc: 'Prevent overfitting', locked: true },
            ].map((topic, idx) => (
              <Card key={idx} className={topic.locked ? 'opacity-50' : 'hover:border-primary/50 transition-colors cursor-pointer'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground">{topic.desc}</p>
                    </div>
                    {topic.locked ? (
                      <Badge variant="secondary">Locked</Badge>
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

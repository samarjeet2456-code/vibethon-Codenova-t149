'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  Brain, 
  BookOpen, 
  Code, 
  HelpCircle, 
  Gamepad2, 
  Trophy,
  Target,
  Zap,
  Users,
  Github,
  Twitter,
  Linkedin
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

const features = [
  {
    icon: BookOpen,
    title: 'Learn Concepts',
    description: 'Interactive lessons with visual explanations of AI/ML fundamentals, from decision trees to neural networks.'
  },
  {
    icon: Code,
    title: 'Practice Coding',
    description: 'Write and test Python code in our built-in editor. Practice implementing ML algorithms from scratch.'
  },
  {
    icon: HelpCircle,
    title: 'Take Quizzes',
    description: 'Test your knowledge with multiple-choice questions and detailed explanations for every answer.'
  },
  {
    icon: Gamepad2,
    title: 'Play Games',
    description: 'Learn through fun mini-games like algorithm classification and spam detection challenges.'
  },
  {
    icon: Trophy,
    title: 'Earn Achievements',
    description: 'Track your progress with XP points, levels, badges, and compete on the global leaderboard.'
  },
  {
    icon: Target,
    title: 'Solve Problems',
    description: 'Practice with LeetCode-style ML problems ranging from easy to hard difficulty.'
  }
]

const stats = [
  { value: '50+', label: 'Practice Problems' },
  { value: '10+', label: 'Learning Modules' },
  { value: '100+', label: 'Quiz Questions' },
  { value: '5+', label: 'Mini Games' }
]

export default function AboutPage() {
  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Hero Section */}
        <motion.div variants={item} className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="h-10 w-10 text-primary-foreground" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              About AIML Practice
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A gamified learning platform designed to help you master AI and Machine Learning concepts through interactive lessons, coding practice, quizzes, and games.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* What You Can Do */}
        <motion.div variants={item}>
          <h2 className="text-2xl font-bold mb-6 text-center">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We believe that learning AI and Machine Learning should be accessible, engaging, and fun. Our platform combines the best practices from coding challenge sites like LeetCode with gamification elements to create an effective learning experience.
              </p>
              <p className="text-muted-foreground">
                Whether you&apos;re a complete beginner wanting to understand the basics or an experienced developer looking to sharpen your skills, AIML Practice provides the tools and content to help you succeed.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Machine Learning</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Deep Learning</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Neural Networks</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Python</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Data Science</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: 1, title: 'Choose Your Level', desc: 'Select beginner, intermediate, or advanced based on your experience' },
                  { step: 2, title: 'Learn & Practice', desc: 'Study concepts, write code, and solve problems at your own pace' },
                  { step: 3, title: 'Earn XP & Badges', desc: 'Complete challenges to earn experience points and unlock achievements' },
                  { step: 4, title: 'Track Progress', desc: 'Monitor your growth and compete with others on the leaderboard' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Community */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Join Our Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with fellow learners, share your progress, and get help when you need it.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" className="gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button variant="outline" className="gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-6">
            Begin your AI/ML journey today and join thousands of learners worldwide.
          </p>
          <Button size="lg" className="gap-2">
            <Zap className="h-4 w-4" />
            Get Started Now
          </Button>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

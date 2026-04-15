'use client'

import { useState, useMemo, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, CheckCircle2, Circle, Zap, ArrowUpDown, X, Loader2
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface Problem {
  id: number
  name: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xp: number
  solved: boolean
}

const topics = ['All', 'Regression', 'Classification', 'Clustering', 'Neural Networks', 'NLP', 'Deep Learning', 'Optimization', 'Reinforcement Learning']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [progressMap, setProgressMap] = useState<Record<number, { solved: boolean }>>({})
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'xp'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showSolvedOnly, setShowSolvedOnly] = useState(false)
  const [showUnsolvedOnly, setShowUnsolvedOnly] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [problemsRes, progressRes] = await Promise.all([
          fetch('/api/problems'),
          fetch('/api/progress'),
        ])
        const problemsData = await problemsRes.json()
        const progressData = await progressRes.json()

        setProblems(problemsData.problems ?? [])
        setProgressMap(progressData.progress ?? {})
      } catch (err) {
        console.error('Failed to load problems:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Merge solved status from progress
  const problemsWithProgress = useMemo(() =>
    problems.map(p => ({ ...p, solved: progressMap[p.id]?.solved ?? false })),
    [problems, progressMap]
  )

  const filteredProblems = useMemo(() => {
    let filtered = [...problemsWithProgress]
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (selectedTopic !== 'All') filtered = filtered.filter(p => p.topic === selectedTopic)
    if (selectedDifficulty !== 'All') filtered = filtered.filter(p => p.difficulty === selectedDifficulty)
    if (showSolvedOnly) filtered = filtered.filter(p => p.solved)
    if (showUnsolvedOnly) filtered = filtered.filter(p => !p.solved)

    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name)
      else if (sortBy === 'difficulty') {
        const diffOrder = { Easy: 1, Medium: 2, Hard: 3 }
        comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty]
      } else if (sortBy === 'xp') comparison = a.xp - b.xp
      return sortOrder === 'asc' ? comparison : -comparison
    })
    return filtered
  }, [problemsWithProgress, searchQuery, selectedTopic, selectedDifficulty, sortBy, sortOrder, showSolvedOnly, showUnsolvedOnly])

  const solvedCount = problemsWithProgress.filter(p => p.solved).length
  const totalXp = problemsWithProgress.filter(p => p.solved).reduce((acc, p) => acc + p.xp, 0)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTopic('All')
    setSelectedDifficulty('All')
    setShowSolvedOnly(false)
    setShowUnsolvedOnly(false)
  }

  const hasActiveFilters = searchQuery || selectedTopic !== 'All' || selectedDifficulty !== 'All' || showSolvedOnly || showUnsolvedOnly

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Problems</h1>
            <p className="text-muted-foreground">
              {solvedCount} of {problems.length} solved • {totalXp} XP earned
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
            const total = problemsWithProgress.filter(p => p.difficulty === diff).length
            const solved = problemsWithProgress.filter(p => p.difficulty === diff && p.solved).length
            return (
              <Card key={diff} className={`bg-${diff.toLowerCase()}/5 border-${diff.toLowerCase()}/20`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-${diff.toLowerCase()} font-medium`}>{diff}</span>
                    <span className={`text-2xl font-bold text-${diff.toLowerCase()}`}>{solved}/{total}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-none"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />Topic: {selectedTopic}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Topic</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {topics.map(topic => (
                    <DropdownMenuCheckboxItem key={topic} checked={selectedTopic === topic} onCheckedChange={() => setSelectedTopic(topic)}>
                      {topic}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />Difficulty: {selectedDifficulty}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Difficulty</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {difficulties.map(diff => (
                    <DropdownMenuCheckboxItem key={diff} checked={selectedDifficulty === diff} onCheckedChange={() => setSelectedDifficulty(diff)}>
                      {diff}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(['name', 'difficulty', 'xp'] as const).map(s => (
                    <DropdownMenuCheckboxItem key={s} checked={sortBy === s} onCheckedChange={() => setSortBy(s)}>
                      {s === 'xp' ? 'XP Reward' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked={sortOrder === 'asc'} onCheckedChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Problems Table */}
        <Card>
          <CardHeader>
            <CardTitle>Problem List ({filteredProblems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Status</div>
                <div className="col-span-5">Problem</div>
                <div className="col-span-2">Topic</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2 text-right">XP</div>
              </div>
              <AnimatePresence mode="popLayout">
                {filteredProblems.map((problem, index) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Link href={`/problems/${problem.id}`}>
                      <motion.div
                        className="grid grid-cols-12 gap-4 p-4 border-t border-border hover:bg-secondary/30 transition-colors cursor-pointer items-center"
                        whileHover={{ x: 4 }}
                      >
                        <div className="col-span-1">
                          {problem.solved
                            ? <CheckCircle2 className="h-5 w-5 text-success" />
                            : <Circle className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="col-span-5">
                          <p className="font-medium">{problem.name}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-muted-foreground">{problem.topic}</span>
                        </div>
                        <div className="col-span-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            problem.difficulty === 'Easy' ? 'bg-easy/10 text-easy' :
                            problem.difficulty === 'Medium' ? 'bg-medium/10 text-medium' :
                            'bg-hard/10 text-hard'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="flex items-center justify-end gap-1 text-sm">
                            <Zap className="h-4 w-4 text-primary" />
                            {problem.xp}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredProblems.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No problems found matching your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  )
}

import { create } from 'zustand'

// ─── Types ────────────────────────────────────────────────────────────────────
// These are kept for local UI state only.
// All real data (problems, modules, leaderboard, profile) is fetched from Supabase.

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced'

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
  starter_code: string
}

export interface Module {
  id: number
  name: string
  description: string
  problem_ids: number[]
  completed: boolean
  order_index: number
}

// ─── UI/Client-only State ─────────────────────────────────────────────────────
// This store is ONLY used for UI-local state, NOT for storing real user data.
// All persistent data comes from Supabase via API routes.

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

// ─── Legacy store (kept for backwards compat during migration) ────────────────
// TODO: Remove once all pages are migrated to API-based data fetching

interface LegacyState {
  learningLevel: LearningLevel
  setLearningLevel: (level: LearningLevel) => void
}

export const useAppStore = create<LegacyState>((set) => ({
  learningLevel: 'beginner',
  setLearningLevel: (level) => set({ learningLevel: level }),
}))

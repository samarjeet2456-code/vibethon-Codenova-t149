import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/progress — get user's solved problems and module progress
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all user progress records
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('problem_id, solved, solved_at, attempts')
      .eq('user_id', user.id)

    if (error) throw error

    // Build a map { problemId -> { solved, attempts } }
    const progressMap: Record<number, { solved: boolean; attempts: number; solvedAt: string | null }> = {}
    for (const row of progress ?? []) {
      progressMap[row.problem_id] = {
        solved: row.solved,
        attempts: row.attempts,
        solvedAt: row.solved_at,
      }
    }

    return NextResponse.json({ progress: progressMap })
  } catch (error) {
    console.error('GET /api/progress error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

// POST /api/progress — record quiz XP + attempt
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
    await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      correct,
      total,
      xp_earned: xpEarned,
    })

    // Update profile XP
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
    console.error('POST /api/progress error:', error)
    return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 })
  }
}

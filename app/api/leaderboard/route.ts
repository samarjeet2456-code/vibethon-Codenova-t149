import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/leaderboard — top 20 users sorted by XP
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, xp, level, problems_solved, avatar_url')
      .order('xp', { ascending: false })
      .limit(20)

    if (error) throw error

    const leaderboard = data.map((entry, index) => ({
      rank: index + 1,
      id: entry.id,
      name: entry.name || 'Anonymous',
      xp: entry.xp,
      level: entry.level,
      problemsSolved: entry.problems_solved,
      avatarUrl: entry.avatar_url,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('GET /api/leaderboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

// POST /api/leaderboard — update streak for current user
export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, last_active')
      .eq('id', user.id)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const lastActive = profile?.last_active
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let newStreak = profile?.streak ?? 0
    if (lastActive === yesterday) {
      newStreak += 1
    } else if (lastActive !== today) {
      newStreak = 1
    }

    await supabase
      .from('profiles')
      .update({ streak: newStreak, last_active: today })
      .eq('id', user.id)

    return NextResponse.json({ streak: newStreak })
  } catch (error) {
    console.error('POST /api/leaderboard error:', error)
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/problems/[id] — fetch single problem + user solve status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch problem
    const { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // If logged in, check if user has solved this problem
    let solved = false
    if (user) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('solved')
        .eq('user_id', user.id)
        .eq('problem_id', parseInt(id))
        .single()
      solved = progress?.solved ?? false
    }

    return NextResponse.json({ problem: { ...problem, solved } })
  } catch (error) {
    console.error('GET /api/problems/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/problems — fetch all problems
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return NextResponse.json({ problems: data })
  } catch (error) {
    console.error('GET /api/problems error:', error)
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 })
  }
}

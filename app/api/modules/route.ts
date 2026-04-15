import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/modules — fetch all modules from Supabase
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error
    return NextResponse.json({ modules: data })
  } catch (error) {
    console.error('GET /api/modules error:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

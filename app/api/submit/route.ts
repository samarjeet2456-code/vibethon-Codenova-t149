import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Piston API language mapping (free, no API key required)
// See: https://emkc.org/api/v2/piston/runtimes for all supported languages
const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
  Python:     { language: 'python',     version: '3.10.0' },
  JavaScript: { language: 'javascript', version: '18.15.0' },
  TypeScript: { language: 'typescript', version: '5.0.3' },
  Java:       { language: 'java',       version: '15.0.2' },
  'C++':      { language: 'c++',        version: '10.2.0' },
}

interface PistonResult {
  stdout: string
  stderr: string
  output: string
  code: number | null
  signal: string | null
}

interface PistonResponse {
  run: PistonResult
  compile?: PistonResult
}

async function runOnPiston(
  code: string,
  language: string
): Promise<PistonResponse> {
  const langConfig = PISTON_LANGUAGES[language] ?? PISTON_LANGUAGES['Python']

  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: langConfig.language,
      version: langConfig.version,
      files: [{ content: code }],
      stdin: '',
      run_timeout: 10000,      // 10 second timeout
      compile_timeout: 10000,
    }),
  })

  if (!res.ok) {
    throw new Error(`Piston API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// POST /api/submit — execute user code via Piston and record submission
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, language, problemId, isSubmit } = await req.json()

    if (!code || !language || !problemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Run code via Piston (free, no API key needed)
    let result: PistonResponse
    try {
      result = await runOnPiston(code, language)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution engine unavailable'
      if (message.includes('401')) {
        return NextResponse.json(
          { error: 'Execution engine authentication failed. Please try again later.' },
          { status: 503 }
        )
      }
      throw err
    }

    const compileError = result.compile?.stderr || result.compile?.output || ''
    const runOutput = result.run.stdout || ''
    const runError = result.run.stderr || ''
    const output = compileError || runOutput || runError || 'No output'

    // Determine status
    const hasError = !!(compileError || runError || (result.run.code !== null && result.run.code !== 0))
    const accepted = !hasError && runOutput.trim().length > 0

    const statusText = compileError
      ? 'Compilation Error'
      : runError || (result.run.code !== null && result.run.code !== 0)
        ? 'Runtime Error'
        : accepted
          ? 'Accepted'
          : 'Wrong Answer'

    // If this is a submit (not just a run), update progress
    if (isSubmit && accepted) {
      // Fetch problem to get XP
      const { data: problem } = await supabase
        .from('problems')
        .select('xp')
        .eq('id', problemId)
        .single()

      const xpEarned = problem?.xp ?? 0

      // Upsert user_progress
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          problem_id: problemId,
          solved: true,
          solved_at: new Date().toISOString(),
          attempts: 1,
        }, { onConflict: 'user_id,problem_id' })

      // Update profile xp + problems_solved + level
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, problems_solved')
        .eq('id', user.id)
        .single()

      const newXp = (profile?.xp ?? 0) + xpEarned
      const newLevel = Math.floor(newXp / 500) + 1

      await supabase
        .from('profiles')
        .update({
          xp: newXp,
          level: newLevel,
          problems_solved: (profile?.problems_solved ?? 0) + 1,
          last_active: new Date().toISOString().split('T')[0],
        })
        .eq('id', user.id)

      // Log submission
      await supabase.from('submissions').insert({
        user_id: user.id,
        problem_id: problemId,
        code,
        language,
        status: statusText,
        output,
        xp_earned: xpEarned,
      })

      return NextResponse.json({
        status: statusText,
        output: `${output}\n\n✅ Accepted! +${xpEarned} XP 🎉`,
        accepted: true,
        xpEarned,
      })
    }

    // Just a "run" — return output only
    return NextResponse.json({
      status: statusText,
      output,
      accepted,
    })
  } catch (error) {
    console.error('POST /api/submit error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    )
  }
}


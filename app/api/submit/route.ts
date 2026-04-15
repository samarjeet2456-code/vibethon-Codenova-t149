import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Language ID map for Judge0
const LANGUAGE_IDS: Record<string, number> = {
  Python:     71,
  JavaScript: 63,
  TypeScript: 74,
  Java:       62,
  'C++':      54,
}

interface Judge0Result {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  status: { id: number; description: string }
}

async function runOnJudge0(
  code: string,
  languageId: number
): Promise<Judge0Result> {
  const encoded = Buffer.from(code).toString('base64')

  // Submit code
  const submitRes = await fetch(
    'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!,
        'X-RapidAPI-Host': process.env.JUDGE0_API_HOST!,
      },
      body: JSON.stringify({
        source_code: encoded,
        language_id: languageId,
        stdin: '',
      }),
    }
  )

  const { token } = await submitRes.json()

  // Poll for result (max 10 seconds)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const resultRes = await fetch(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!,
          'X-RapidAPI-Host': process.env.JUDGE0_API_HOST!,
        },
      }
    )
    const result: Judge0Result = await resultRes.json()

    // Status 1 = In Queue, 2 = Processing
    if (result.status.id > 2) {
      // Decode base64 outputs
      if (result.stdout) result.stdout = Buffer.from(result.stdout, 'base64').toString()
      if (result.stderr) result.stderr = Buffer.from(result.stderr, 'base64').toString()
      if (result.compile_output) result.compile_output = Buffer.from(result.compile_output, 'base64').toString()
      return result
    }
  }

  throw new Error('Code execution timed out')
}

// POST /api/submit — execute user code via Judge0 and record submission
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

    const languageId = LANGUAGE_IDS[language] ?? 71

    // Run code via Judge0
    const result = await runOnJudge0(code, languageId)

    const output = result.stdout || result.stderr || result.compile_output || 'No output'
    const accepted = result.status.id === 3 // 3 = Accepted

    const statusText = accepted ? 'Accepted' :
      result.status.id === 6 ? 'Wrong Answer' :
      result.status.id === 11 ? 'Time Limit Exceeded' :
      result.status.id >= 7 ? 'Runtime Error' :
      result.status.description

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

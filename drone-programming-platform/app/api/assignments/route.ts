import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const TEACHER_HEADER = 'x-teacher-key'
const EXPECTED_TOKEN = process.env.TEACHER_TOKEN || 'dev-teacher-token'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST: Create assignment (teacher-only)
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const token = req.headers.get(TEACHER_HEADER)

  if (EXPECTED_TOKEN && token !== EXPECTED_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const missions = Array.isArray(body.missions) ? body.missions : []
    const title = body.title || null
    const description = body.description || null
    const deadline = body.deadline ? new Date(body.deadline).toISOString() : null

    if (!missions.length) {
      return NextResponse.json({ error: 'missions required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        code: generateCode(),
        title,
        description,
        missions,
        deadline,
      })
      .select()
      .single()

    if (error) throw error

    // Map fields to match ApiAssignment interface (camelCase)
    const result = {
      code: data.code,
      title: data.title,
      description: data.description,
      missions: data.missions,
      deadline: data.deadline,
      createdAt: data.created_at,
    }

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('Assignment creation error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// GET: List assignments (teacher-only)
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const token = req.headers.get(TEACHER_HEADER)

  if (EXPECTED_TOKEN && token !== EXPECTED_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch assignments error:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }

  // Map fields to match ApiAssignment interface (camelCase)
  const result = data.map(item => ({
    code: item.code,
    title: item.title,
    description: item.description,
    missions: item.missions,
    deadline: item.deadline,
    createdAt: item.created_at,
  }))

  return NextResponse.json(result)
}

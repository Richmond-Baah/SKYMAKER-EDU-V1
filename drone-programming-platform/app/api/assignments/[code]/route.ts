import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Public lookup for code-based redemption (students use this to redeem assignments)
export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabaseClient()
  const code = (params && params.code) || ''

  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !assignment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    code: assignment.code,
    title: assignment.title,
    description: assignment.description || null,
    missions: assignment.missions,
    deadline: assignment.deadline || null,
    createdAt: assignment.created_at,
  })
}

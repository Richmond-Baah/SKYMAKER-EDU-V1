import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { gradeMission } from '@/lib/grading'

const STUDENT_HEADER = 'x-student-id'

// POST: Submit code for a mission (student)
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabaseClient()
  const code = (params && params.code) || ''
  const studentId = req.headers.get(STUDENT_HEADER) || `anon-${Date.now()}-${Math.random()}`

  try {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id || null

    const body = await req.json()
    const missionId = body.missionId || ''
    const studentCode = body.code || ''
    const flightData = body.flightData || null

    if (!missionId || !studentCode) {
      return NextResponse.json(
        { error: 'missionId and code required' },
        { status: 400 }
      )
    }

    // Find assignment by code
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('code', code)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify mission is in assignment
    if (!assignment.missions.includes(missionId)) {
      return NextResponse.json(
        { error: 'Mission not in this assignment' },
        { status: 400 }
      )
    }

    // Call grading engine
    const gradeResult = gradeMission(missionId, studentCode, flightData)
    const feedbackStr = Array.isArray(gradeResult.feedback) ? gradeResult.feedback.join(' ') : gradeResult.feedback

    // Create submission record
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignment.id,
        user_id: userId,
        student_id: studentId,
        mission_id: missionId,
        code: studentCode,
        flight_data: flightData,
      })
      .select()
      .single()

    if (subError) throw subError

    // Create grade record
    const { data: grade, error: gradeError } = await supabase
      .from('grades')
      .insert({
        submission_id: submission.id,
        score: gradeResult.score,
        passed: gradeResult.passed,
        feedback: feedbackStr,
        breakdown: gradeResult.breakdown || {},
      })
      .select()
      .single()

    if (gradeError) throw gradeError

    return NextResponse.json(
      {
        submission: {
          id: submission.id,
          studentId: submission.student_id,
          missionId: submission.mission_id,
          createdAt: submission.created_at,
        },
        grade: {
          score: grade.score,
          passed: grade.passed,
          feedback: grade.feedback,
          breakdown: grade.breakdown,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// GET: Retrieve submission results (includes student name and submitted code)
export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const supabase = createServerSupabaseClient()
  const code = (params && params.code) || ''

  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select(`
      *,
      submissions (
        *,
        grades (*)
      )
    `)
    .eq('code', code)
    .single()

  if (assignmentError || !assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  // Collect unique user_ids to fetch profile names
  const userIds = Array.from(
    new Set(
      assignment.submissions
        .map((s: any) => s.user_id)
        .filter((id: string | null) => id !== null)
    )
  ) as string[]

  // Fetch profile names for all submitting users
  let profileMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', userIds)

    if (profiles) {
      for (const p of profiles) {
        profileMap[p.id] = p.full_name || p.username || `Student ${p.id.slice(0, 8)}`
      }
    }
  }

  return NextResponse.json({
    code: assignment.code,
    title: assignment.title,
    missions: assignment.missions,
    submissions: assignment.submissions.map((s: any) => ({
      id: s.id,
      studentId: s.student_id,
      userId: s.user_id,
      studentName: s.user_id ? (profileMap[s.user_id] || `Student ${s.student_id.slice(0, 8)}`) : `Anonymous ${s.student_id.slice(0, 8)}`,
      missionId: s.mission_id,
      code: s.code,
      createdAt: s.created_at,
      grade: s.grades && s.grades.length > 0
        ? {
          score: s.grades[0].score,
          passed: s.grades[0].passed,
          feedback: s.grades[0].feedback,
          breakdown: s.grades[0].breakdown,
        }
        : null,
    })),
  })
}

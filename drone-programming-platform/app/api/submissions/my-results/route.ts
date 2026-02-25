import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/submissions/my-results
 * Returns all submissions and grades for the currently authenticated user.
 * Students use this to see their results after teacher/auto grading.
 */
export async function GET(_req: NextRequest) {
    const supabase = createServerSupabaseClient()

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    if (!userId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch all submissions for this user, joined with grades and assignment info
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select(`
      id,
      mission_id,
      code,
      created_at,
      assignment_id,
      assignments (
        code,
        title,
        description
      ),
      grades (
        score,
        passed,
        feedback,
        breakdown,
        graded_at
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch my results error:', error)
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    const results = (submissions || []).map((s: any) => ({
        id: s.id,
        missionId: s.mission_id,
        code: s.code,
        createdAt: s.created_at,
        assignmentCode: s.assignments?.code || null,
        assignmentTitle: s.assignments?.title || null,
        assignmentDescription: s.assignments?.description || null,
        grade: s.grades && s.grades.length > 0
            ? {
                score: s.grades[0].score,
                passed: s.grades[0].passed,
                feedback: s.grades[0].feedback,
                breakdown: s.grades[0].breakdown,
                gradedAt: s.grades[0].graded_at,
            }
            : null,
    }))

    return NextResponse.json({ results })
}

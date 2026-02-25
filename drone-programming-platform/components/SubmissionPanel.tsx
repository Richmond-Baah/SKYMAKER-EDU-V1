"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface GradeResult {
  score: number
  passed: boolean
  feedback: string
}

interface SubmissionState {
  assignmentCode: string
  missionId: string
  code: string
  flightData: string
  submitting: boolean
  result: (GradeResult & { submissionId: string }) | null
}

export function SubmissionPanel() {
  const [state, setState] = useState<SubmissionState>({
    assignmentCode: '',
    missionId: '',
    code: '',
    flightData: '{}',
    submitting: false,
    result: null,
  })

  const [missions, setMissions] = useState<string[]>([])
  const [assignmentDescription, setAssignmentDescription] = useState<string | null>(null)
  const [assignmentTitle, setAssignmentTitle] = useState<string | null>(null)
  const [loadingMissions, setLoadingMissions] = useState(false)

  async function handleLoadAssignment() {
    if (!state.assignmentCode.trim()) {
      toast.error('Enter assignment code')
      return
    }

    setLoadingMissions(true)
    try {
      const res = await fetch(`/api/assignments/${encodeURIComponent(state.assignmentCode)}`)
      if (res.ok) {
        const assignment = await res.json()
        setMissions(assignment.missions)
        setAssignmentDescription(assignment.description || null)
        setAssignmentTitle(assignment.title || null)
        setState(s => ({ ...s, missionId: assignment.missions[0] || '' }))
        toast.success('Assignment loaded')
      } else {
        toast.error('Assignment not found')
      }
    } catch (err) {
      toast.error('Failed to load assignment')
    } finally {
      setLoadingMissions(false)
    }
  }

  async function handleSubmit() {
    if (!state.assignmentCode || !state.missionId || !state.code) {
      toast.error('Fill in all fields')
      return
    }

    setState(s => ({ ...s, submitting: true }))
    try {
      let flightData = null
      try {
        flightData = JSON.parse(state.flightData)
      } catch {
        flightData = null
      }

      const res = await fetch(`/api/submissions/${encodeURIComponent(state.assignmentCode)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          missionId: state.missionId,
          code: state.code,
          flightData,
        }),
      })

      if (res.ok) {
        const { submission, grade } = await res.json()
        setState(s => ({
          ...s,
          result: { ...grade, submissionId: submission.id },
        }))
        toast.success(grade.passed ? 'Submission passed!' : 'Submission graded')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Submission failed')
      }
    } catch (err) {
      toast.error('Error submitting code')
      console.error(err)
    } finally {
      setState(s => ({ ...s, submitting: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Assignment Selection */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">Submit Your Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Assignment Code</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 6-digit code"
                value={state.assignmentCode}
                onChange={e => setState(s => ({ ...s, assignmentCode: e.target.value.toUpperCase() }))}
                disabled={missions.length > 0}
                className="font-mono bg-background text-foreground border-input"
              />
              <Button onClick={handleLoadAssignment} disabled={loadingMissions || missions.length > 0}>
                {loadingMissions ? 'Loading...' : 'Load'}
              </Button>
            </div>
          </div>

          {missions.length > 0 && (
            <>
              {/* Assignment Info */}
              {(assignmentTitle || assignmentDescription) && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg space-y-1">
                  {assignmentTitle && (
                    <div className="font-bold text-sm text-foreground">{assignmentTitle}</div>
                  )}
                  {assignmentDescription && (
                    <div className="text-xs text-muted-foreground">{assignmentDescription}</div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Mission</label>
                <select
                  value={state.missionId}
                  onChange={e => setState(s => ({ ...s, missionId: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {missions.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Your Code</label>
                <Textarea
                  placeholder="Paste your Python code here..."
                  value={state.code}
                  onChange={e => setState(s => ({ ...s, code: e.target.value }))}
                  className="font-mono h-32 bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Flight Data (JSON, optional)</label>
                <Textarea
                  placeholder='{"altitude": 1.5, "roll": 0.1}'
                  value={state.flightData}
                  onChange={e => setState(s => ({ ...s, flightData: e.target.value }))}
                  className="font-mono h-16 bg-background text-foreground border-input"
                />
              </div>

              <Button onClick={handleSubmit} disabled={state.submitting} className="w-full">
                {state.submitting ? 'Submitting...' : 'Submit for Grading'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Grade Result */}
      {state.result && (
        <Card className={`bg-card border-2 ${state.result.passed ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-foreground">
              Grade Result
              <Badge className={state.result.passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}>
                {state.result.passed ? 'PASSED' : 'REVIEW'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Score</span>
              <span className="text-2xl font-bold text-foreground">{state.result.score}%</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Feedback</span>
              <p className="text-sm mt-1 text-foreground">{state.result.feedback}</p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setState(s => ({ ...s, result: null, code: '', assignmentCode: '', missionId: '' }))}
                className="w-full"
              >
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

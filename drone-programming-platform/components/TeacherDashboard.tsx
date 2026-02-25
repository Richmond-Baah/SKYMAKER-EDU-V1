"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AssignmentBuilder } from './AssignmentBuilder'
import { listAssignments } from '@/lib/assignments'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Code2, User, CheckCircle, XCircle, Users, Activity, Target, Download, Shield, Trophy } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

interface SubmissionDetail {
  id: string
  studentId: string
  userId: string | null
  studentName: string
  missionId: string
  code: string
  createdAt: string
  grade: {
    score: number
    passed: boolean
    feedback: string
    breakdown?: Record<string, any>
  } | null
}

interface StudentStats {
  id: string
  name: string
  missionsCompleted: number
  averageScore: number
}

interface ApiAssignment {
  code: string
  title: string | null
  description: string | null
  missions: string[]
  createdAt: string
  deadline?: string | null
}

interface AssignmentWithSubmissions extends ApiAssignment {
  submissions: SubmissionDetail[]
}

export function TeacherDashboard() {
  const [assignments, setAssignments] = useState<AssignmentWithSubmissions[]>([])
  const [studentStats, setStudentStats] = useState<StudentStats[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchAssignmentsAndStats()
  }, [])

  async function fetchAssignmentsAndStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/assignments', {
        headers: { 'x-teacher-key': process.env.NEXT_PUBLIC_TEACHER_TOKEN || 'dev-teacher-token' },
      })

      if (res.ok) {
        const serverAssignments: ApiAssignment[] = await res.json()
        const studentsMap = new Map<string, { name: string; scores: number[]; missions: Set<string> }>()
        const assignmentsWithSubs: AssignmentWithSubmissions[] = []

        for (const assignment of serverAssignments) {
          const subRes = await fetch(`/api/submissions/${assignment.code}`)
          let submissions: SubmissionDetail[] = []

          if (subRes.ok) {
            const data = await subRes.json()
            submissions = data.submissions || []

            for (const sub of submissions) {
              const key = sub.userId || sub.studentId
              if (!studentsMap.has(key)) {
                studentsMap.set(key, { name: sub.studentName, scores: [], missions: new Set() })
              }
              const stats = studentsMap.get(key)!
              if (sub.studentName && !sub.studentName.startsWith('Anonymous')) {
                stats.name = sub.studentName
              }
              stats.missions.add(sub.missionId)
              if (sub.grade) {
                stats.scores.push(sub.grade.score)
              }
            }
          }
          assignmentsWithSubs.push({ ...assignment, submissions })
        }
        setAssignments(assignmentsWithSubs)

        const students: StudentStats[] = Array.from(studentsMap.entries()).map(([id, stats]) => ({
          id,
          name: stats.name,
          missionsCompleted: stats.missions.size,
          averageScore: stats.scores.length > 0 ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) : 0,
        }))
        setStudentStats(students.sort((a, b) => b.averageScore - a.averageScore))
      } else {
        fallbackLocal()
      }
    } catch (err) {
      fallbackLocal()
    } finally {
      setLoading(false)
    }
  }

  function fallbackLocal() {
    const localAssignments = listAssignments()
    setAssignments(
      localAssignments.map(a => ({
        code: a.code,
        title: a.title || null,
        description: a.description || null,
        missions: a.missions,
        createdAt: a.createdAt,
        deadline: a.deadline || null,
        submissions: [],
      }))
    )
  }

  function toggleAssignment(code: string) {
    setExpandedAssignment(prev => prev === code ? null : code)
    setExpandedCode(null)
  }

  function toggleCode(submissionId: string) {
    setExpandedCode(prev => prev === submissionId ? null : submissionId)
  }

  // Calculate top line metrics
  const totalStudents = studentStats.length;
  const totalSubmissions = assignments.reduce((acc, curr) => acc + curr.submissions.length, 0);
  const avgCohortScore = totalStudents > 0 ? Math.round(studentStats.reduce((acc, curr) => acc + curr.averageScore, 0) / totalStudents) : 0;

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40 flex items-center gap-4">
            TEACHER DASHBOARD
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest h-fit mt-1">
              INSTRUCTOR VIEW
            </Badge>
          </h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            CLASSROOM OPERATIONS & METRICS
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AssignmentBuilder onAssignmentCreated={() => fetchAssignmentsAndStats()} />
          <Button
            variant="outline"
            className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10 font-bold tracking-widest text-xs h-10 px-6 rounded-xl transition-all"
            onClick={() => toast.info('CSV export coming soon')}
          >
            <Download className="w-4 h-4 mr-2" /> EXPORT CSV
          </Button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="TOTAL STUDENTS"
          value={totalStudents.toString()}
          subtitle="ACTIVE IN COHORT"
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="ACTIVE ASSIGNMENTS"
          value={assignments.length.toString()}
          subtitle="CIRCULATING MODULES"
          icon={<Target className="w-5 h-5 text-amber-500" />}
        />
        <MetricCard
          title="TOTAL SUBMISSIONS"
          value={totalSubmissions.toString()}
          subtitle="CODE & FLIGHT DATA"
          icon={<Activity className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="COHORT AVG SCORE"
          value={`${avgCohortScore}%`}
          subtitle="OVERALL PERFORMANCE"
          icon={<Trophy className="w-5 h-5 text-purple-500" />}
          progress={avgCohortScore}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Assignments Accordion */}
        <Card className="lg:col-span-2 bg-card border-border shadow-xl overflow-hidden rounded-3xl">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Mission Dispenser</CardTitle>
            <CardDescription className="text-muted-foreground">Manage ongoing assignments and review flight submissions</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Syncing Operational Data...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                No assignments circulating. Create a new module to begin.
              </div>
            ) : (
              <div className="grid gap-4">
                {assignments.map(a => (
                  <div key={a.code} className="border border-border rounded-2xl overflow-hidden bg-muted/10 hover:border-purple-500/30 transition-all duration-300">
                    <button
                      onClick={() => toggleAssignment(a.code)}
                      className="w-full p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-lg text-foreground tracking-tight">{a.title || 'Classroom Assignment'}</div>
                        {a.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">{a.description}</div>
                        )}
                        <div className="text-xs font-mono text-muted-foreground/80 pt-2 flex gap-4">
                          <span>CODE: <span className="text-purple-400">{a.code}</span></span>
                          <span>MISSIONS: {a.missions.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {a.submissions.length > 0 && (
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 font-bold whitespace-nowrap">
                            {a.submissions.length} SUBMISSIONS
                          </Badge>
                        )}
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {expandedAssignment === a.code ? (
                            <ChevronUp className="w-4 h-4 text-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Submissions List */}
                    {expandedAssignment === a.code && (
                      <div className="border-t border-border bg-background/50 backdrop-blur">
                        {a.submissions.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">No telemetry recorded yet for this module.</div>
                        ) : (
                          <div className="divide-y divide-border">
                            {a.submissions.map(sub => (
                              <div key={sub.id} className="p-6 space-y-4 hover:bg-muted/10 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-border">
                                      <User className="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-foreground">{sub.studentName}</div>
                                      <div className="text-[10px] text-muted-foreground font-mono mt-1">
                                        ID: {sub.missionId} | {new Date(sub.createdAt).toLocaleString(undefined, {
                                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {sub.grade ? (
                                      <>
                                        <Badge className={`px-3 py-1 font-black text-[10px] tracking-widest uppercase ${sub.grade.passed
                                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                          }`}>
                                          {sub.grade.passed ? <><CheckCircle className="w-3 h-3 mr-1.5" /> PASSED</> : <><XCircle className="w-3 h-3 mr-1.5" /> REVIEW</>}
                                        </Badge>
                                        <div className="text-2xl font-black text-foreground w-16 text-right">{sub.grade.score}%</div>
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="text-muted-foreground">PENDING</Badge>
                                    )}
                                  </div>
                                </div>

                                {sub.grade?.feedback && (
                                  <div className="ml-14 text-sm text-muted-foreground bg-muted/30 border border-border rounded-xl p-4 leading-relaxed">
                                    <span className="font-bold text-foreground text-[10px] uppercase tracking-widest block mb-2">System Feedback</span>
                                    {sub.grade.feedback}
                                  </div>
                                )}

                                <div className="ml-14">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleCode(sub.id)}
                                    className="h-8 text-xs font-bold tracking-widest bg-transparent border-border hover:bg-muted"
                                  >
                                    <Code2 className="w-3 h-3 mr-2" />
                                    {expandedCode === sub.id ? 'HIDE FLIGHT DATA' : 'VIEW SOURCE'}
                                  </Button>

                                  {expandedCode === sub.id && (
                                    <div className="mt-4 bg-[#0d1117] border border-border rounded-xl p-4 overflow-x-auto shadow-inner">
                                      <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap break-words">
                                        {sub.code}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Improved Leaderboard / Roster */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-2xl rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />

            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-500" /> TOP PERFORMERS
            </h3>

            {studentStats.length === 0 ? (
              <div className="text-sm text-center py-8 text-muted-foreground">Radar is clear. No cadets classified yet.</div>
            ) : (
              <div className="space-y-4">
                {studentStats.map((student, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <div
                      key={student.id}
                      className={`relative flex items-center p-3 rounded-2xl transition-all duration-300 hover:bg-muted/50 ${idx === 0 ? 'bg-amber-500/5 border border-amber-500/20' :
                        idx === 1 ? 'bg-gray-400/5 border border-gray-400/20' :
                          idx === 2 ? 'bg-amber-700/5 border border-amber-700/20' : 'border border-transparent'
                        }`}
                    >
                      <div className="flex-1 flex items-center gap-4">
                        <div className={`w-8 text-center font-black text-xl italic ${idx === 0 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                          idx === 1 ? 'text-gray-400 drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]' :
                            idx === 2 ? 'text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]' : 'text-muted-foreground'
                          }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${isTop3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {student.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={student.averageScore} className="h-1 w-16 bg-muted">
                              <div className="h-full bg-purple-500" style={{ width: `${student.averageScore}%` }} />
                            </Progress>
                            <span className="text-[10px] font-mono text-muted-foreground">{student.averageScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pr-2">
                        <div className="text-sm font-bold text-foreground">{student.missionsCompleted}</div>
                        <div className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Missions</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, progress }: { title: string, value: string, subtitle: string, icon: React.ReactNode, progress?: number }) {
  return (
    <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-6">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-muted/50 border border-border group-hover:bg-muted transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-3xl font-black tracking-tighter mb-1 text-foreground">{value}</div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{subtitle}</div>

        {progress !== undefined && (
          <div className="mt-4">
            <Progress value={progress} className="h-1.5 bg-muted">
              <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-1000" style={{ width: `${progress}%` }} />
            </Progress>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Code2, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useDroneStore } from '@/lib/store'

interface GradeInfo {
    score: number
    passed: boolean
    feedback: string
    breakdown?: Record<string, any>
    gradedAt: string
}

interface SubmissionResult {
    id: string
    missionId: string
    code: string
    createdAt: string
    assignmentCode: string | null
    assignmentTitle: string | null
    assignmentDescription: string | null
    grade: GradeInfo | null
}

export function StudentResults() {
    const user = useDroneStore(state => state.user)
    const [results, setResults] = useState<SubmissionResult[]>([])
    const [loading, setLoading] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            fetchResults()
        }
    }, [user])

    async function fetchResults() {
        setLoading(true)
        try {
            const res = await fetch('/api/submissions/my-results')
            if (res.ok) {
                const data = await res.json()
                setResults(data.results || [])
            }
        } catch (err) {
            console.error('Failed to fetch results:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null
    if (loading) {
        return (
            <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground">Loading your results...</div>
                </CardContent>
            </Card>
        )
    }
    if (results.length === 0) return null

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                My Submission Results
            </h2>
            <div className="grid gap-3">
                {results.map(result => (
                    <Card key={result.id} className={`bg-card border-border shadow-sm overflow-hidden ${result.grade?.passed ? 'border-l-4 border-l-emerald-500' : result.grade ? 'border-l-4 border-l-amber-500' : ''}`}>
                        <div className="p-4">
                            {/* Header Row */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-foreground text-sm">
                                        {result.assignmentTitle || 'Assignment'}{' '}
                                        <span className="text-muted-foreground font-mono text-xs">
                                            ({result.assignmentCode || 'N/A'})
                                        </span>
                                    </div>
                                    {result.assignmentDescription && (
                                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {result.assignmentDescription}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                        Mission: {result.missionId} • Submitted: {new Date(result.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {result.grade ? (
                                        <>
                                            <Badge className={result.grade.passed
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                            }>
                                                {result.grade.passed ? (
                                                    <><CheckCircle className="w-3 h-3 mr-1" /> PASSED</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3 mr-1" /> NEEDS REVIEW</>
                                                )}
                                            </Badge>
                                            <span className="text-xl font-bold text-foreground">{result.grade.score}%</span>
                                        </>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground border-border">
                                            AWAITING GRADE
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Grade Feedback */}
                            {result.grade && result.grade.feedback && (
                                <div className="mt-3 text-xs text-muted-foreground bg-muted/20 rounded p-3">
                                    <span className="font-bold uppercase tracking-widest text-[9px] text-foreground">Feedback: </span>
                                    {result.grade.feedback}
                                </div>
                            )}

                            {/* Grade Breakdown */}
                            {result.grade?.breakdown && Object.keys(result.grade.breakdown).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {Object.entries(result.grade.breakdown).map(([key, value]) => (
                                        <span key={key} className="text-[10px] bg-muted/30 text-muted-foreground rounded px-2 py-1 font-mono">
                                            {key}: {typeof value === 'number' ? value : String(value)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Toggle Code View */}
                            <div className="mt-3">
                                <button
                                    onClick={() => setExpandedId(prev => prev === result.id ? null : result.id)}
                                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors font-bold uppercase tracking-widest"
                                >
                                    <Code2 className="w-3.5 h-3.5" />
                                    {expandedId === result.id ? 'Hide My Code' : 'View My Code'}
                                    {expandedId === result.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                {expandedId === result.id && (
                                    <div className="mt-2 bg-muted/40 border border-border rounded-lg p-3 overflow-x-auto">
                                        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                                            {result.code}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

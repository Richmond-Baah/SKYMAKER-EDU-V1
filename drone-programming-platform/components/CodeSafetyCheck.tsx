"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { CodeSafetyAnalyzer } from '@/lib/codeSafety'

interface CodeSafetyCheckProps {
  code: string
}

export function CodeSafetyCheck({ code }: CodeSafetyCheckProps) {
  const analysis = useMemo(() => CodeSafetyAnalyzer.analyze(code), [code])

  const errorCount = analysis.issues.filter(i => i.type === 'error').length
  const warningCount = analysis.issues.filter(i => i.type === 'warning').length

  if (!code.trim()) {
    return null
  }

  return (
    <Card className={`glass border-2 ${analysis.safe ? 'border-emerald-500/20' : 'border-orange-500/20'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {analysis.safe ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Safe Code
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Safety Issues Found
              </>
            )}
          </span>
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 gap-1">
                <AlertCircle className="w-3 h-3" /> {errorCount} Error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 gap-1">
                <AlertTriangle className="w-3 h-3" /> {warningCount} Warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flight Estimate */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-white/3 rounded">
            <div className="text-white/40 uppercase tracking-wider">Est. Flight Time</div>
            <div className="text-lg font-bold text-cyan-400">{analysis.estimatedFlightTime}s</div>
          </div>
          <div className="p-2 bg-white/3 rounded">
            <div className="text-white/40 uppercase tracking-wider">Est. Distance</div>
            <div className="text-lg font-bold text-cyan-400">{analysis.estimatedDistance}m</div>
          </div>
        </div>

        {/* Issues List */}
        {analysis.issues.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-bold uppercase text-white/60">Issues</div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {analysis.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border-l-4 ${
                    issue.type === 'error'
                      ? 'bg-red-500/10 border-red-500 text-red-100'
                      : 'bg-amber-500/10 border-amber-500 text-amber-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {issue.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 text-xs">
                      <div className="font-bold">
                        Line {issue.line}: {issue.message}
                      </div>
                      <div className="text-xs opacity-75 mt-1 font-mono bg-black/20 p-1 rounded">
                        {issue.code}
                      </div>
                      <div className="mt-2 text-xs opacity-90">
                        <strong>💡 Fix:</strong> {issue.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Summary */}
        {analysis.safe && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-100 text-xs">
            ✅ This code meets safety requirements. Ready for simulation or real drone deployment.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

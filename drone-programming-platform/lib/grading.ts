import { SuccessCriteria } from '@/types/mission'

export interface FlightPoint { x: number; y: number; z: number }
export interface FlightData {
  path?: FlightPoint[]
  time?: number
  maxAltitude?: number
  landed?: boolean
}

export interface GradeResult {
  score: number
  passed: boolean
  feedback: string[]
  breakdown?: Record<string, number>
}

/**
 * Basic grading engine for Phase‑2 MVP.
 * - Scores against simple mission success criteria
 * - Provides feedback and a numeric score (0-100)
 */
export function gradeMission(
  missionId: string,
  userCode: string,
  flightData: FlightData,
  criteria?: SuccessCriteria
): GradeResult {
  const feedback: string[] = []
  let score = 0
  const breakdown: Record<string, number> = {}

  // 1) Landing / required boolean criteria
  if (criteria?.landed) {
    const landed = !!flightData.landed
    if (landed) {
      score += 30
      breakdown.landed = 30
    } else {
      feedback.push('Drone did not land as required.')
      breakdown.landed = 0
    }
  }

  // 2) Altitude check
  if (criteria?.minAltitude !== undefined) {
    const reached = (flightData.maxAltitude || 0) >= criteria.minAltitude
    if (reached) {
      score += 20
      breakdown.altitude = 20
    } else {
      feedback.push(`Reach at least ${criteria.minAltitude}m altitude.`)
      breakdown.altitude = 0
    }
  }

  // 3) Time / speed bonus
  if (criteria?.maxTime !== undefined && flightData.time !== undefined) {
    const within = flightData.time <= criteria.maxTime
    if (within) {
      score += 15
      breakdown.time = 15
    } else {
      feedback.push(`Try to complete the mission faster (target ${criteria.maxTime}s).`)
      breakdown.time = 0
    }
  }

  // 4) Position accuracy: check final point distance to origin (0,0)
  if (criteria?.positionAccuracy !== undefined && flightData.path && flightData.path.length > 0) {
    const last = flightData.path[flightData.path.length - 1]
    const dist = Math.sqrt(last.x * last.x + last.y * last.y)
    const ok = dist <= (criteria.positionAccuracy || 0)
    if (ok) {
      score += 20
      breakdown.accuracy = 20
    } else {
      feedback.push(`Final position off by ${dist.toFixed(2)}m (allowed ${criteria.positionAccuracy}m).`)
      breakdown.accuracy = Math.max(0, 20 - Math.min(20, Math.round((dist / (criteria.positionAccuracy || 1)) * 20)))
    }
  }

  // 5) Code quality heuristics (loops / variables)
  const usesLoop = /for\s*\(|for\s+\w+|while\s*\(/.test(userCode)
  const usesVar = /\bdef\b|\bvar\b|\breturn\b|\b=\b/.test(userCode)
  if (usesLoop) {
    score += 10
    breakdown.loops = 10
  } else {
    breakdown.loops = 0
  }
  if (usesVar) {
    score += 5
    breakdown.code = 5
  } else {
    breakdown.code = 0
  }

  // Cap score at 100
  score = Math.min(100, score)

  // Passed threshold
  const passed = score >= 70
  if (passed) feedback.unshift('Mission passed — well done!')
  else feedback.unshift('Mission did not meet pass criteria. See hints.')

  return { score, passed, feedback, breakdown }
}

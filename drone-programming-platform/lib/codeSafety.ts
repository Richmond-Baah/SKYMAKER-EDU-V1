// Code safety analyzer for Phase 3 - validates drone code before execution

export interface SafetyIssue {
  type: 'warning' | 'error'
  line: number
  code: string
  message: string
  suggestion: string
}

export interface CodeAnalysisResult {
  safe: boolean
  issues: SafetyIssue[]
  estimatedFlightTime: number // seconds
  estimatedDistance: number // meters
}

export class CodeSafetyAnalyzer {
  private static readonly DANGEROUS_PATTERNS = [
    {
      pattern: /fly.*(?:very\s+)?high|altitude.*>.*[1-9]\d{2,}/i,
      message: 'Code attempts extreme altitude (>100m)',
      suggestion: 'Indoor flying should not exceed 5-10m. Outdoor? Add altitude validation.',
      type: 'warning' as const,
    },
    {
      pattern: /speed.*(?:very\s+)?fast|velocity.*=.*[1-9]\d/i,
      message: 'Code sets very high speed',
      suggestion: 'For safety, limit speed to < 15 m/s. Add speed validation.',
      type: 'warning' as const,
    },
    {
      pattern: /fly\s+(?:forward|backward|left|right)\s+(?:1000|\.{3}|∞)/i,
      message: 'Infinite or very large movement detected',
      suggestion: 'Add bounds checking. Use finite loops with distance limits.',
      type: 'error' as const,
    },
    {
      pattern: /while\s+true|for\s+.*in\s+range\s*\(\s*∞/i,
      message: 'Infinite loop detected',
      suggestion: 'Replace with bounded loop: for i in range(10).',
      type: 'error' as const,
    },
    {
      pattern: /no.*emergency.*stop|disable.*safety/i,
      message: 'Code attempts to disable safety features',
      suggestion: 'Emergency stop is always enabled and cannot be disabled.',
      type: 'error' as const,
    },
    {
      pattern: /import\s+os|exec\(|eval\(/i,
      message: 'Unsafe code execution detected',
      suggestion: 'Use only provided drone API. No system access allowed.',
      type: 'error' as const,
    },
  ]

  static analyze(code: string): CodeAnalysisResult {
    const lines = code.split('\n')
    const issues: SafetyIssue[] = []

    lines.forEach((line, index) => {
      // Check against dangerous patterns
      this.DANGEROUS_PATTERNS.forEach(({ pattern, message, suggestion, type }) => {
        if (pattern.test(line)) {
          issues.push({
            type,
            line: index + 1,
            code: line.trim(),
            message,
            suggestion,
          })
        }
      })

      // Check for variables not defined
      if (line.includes('drone') && !line.includes('Drone(') && !line.includes('=')) {
        const match = line.match(/drone\d+/)
        if (match && !code.includes(`${match[0]} = Drone(`)) {
          issues.push({
            type: 'error',
            line: index + 1,
            code: line.trim(),
            message: `Drone '${match[0]}' not defined`,
            suggestion: `Define it first: ${match[0]} = Drone(id=1)`,
          })
        }
      }
    })

    // Estimate flight time and distance (simple heuristics)
    const takeoffCount = (code.match(/\.takeoff\(\)/g) || []).length
    const landCount = (code.match(/\.land\(\)/g) || []).length
    const moveCommands = code.match(/\.move_\w+\((\d+(?:\.\d+)?)\)/g) || []

    const estimatedDistance = moveCommands.reduce((sum, cmd) => {
      const match = cmd.match(/\((\d+(?:\.\d+)?)\)/)
      return sum + (match ? parseFloat(match[1]) : 0)
    }, 0)

    // Rough estimate: 1m per second + acceleration/deceleration time
    const estimatedFlightTime = Math.max(takeoffCount * 2, estimatedDistance + 5)

    return {
      safe: issues.filter(i => i.type === 'error').length === 0,
      issues,
      estimatedFlightTime,
      estimatedDistance,
    }
  }

  static formatIssues(result: CodeAnalysisResult): string {
    if (result.issues.length === 0) {
      return '✅ No safety issues detected'
    }

    return result.issues
      .map(
        issue =>
          `[Line ${issue.line}] ${issue.type.toUpperCase()}: ${issue.message}\n` +
          `  💡 Suggestion: ${issue.suggestion}\n` +
          `  Code: ${issue.code}`
      )
      .join('\n\n')
  }
}

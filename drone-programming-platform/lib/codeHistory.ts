/**
 * Code history and versioning utilities
 * Manages code snapshots, auto-save, and version history
 */

export interface CodeSnapshot {
  id: string
  code: string
  timestamp: number // ms since epoch
  score?: number
  passed?: boolean
  description?: string // e.g., "First attempt", "After hint"
}

const STORAGE_KEY = 'skymakers:code_history'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

/**
 * Save a code snapshot to history
 */
export function saveCodeSnapshot(
  missionId: string,
  code: string,
  score?: number,
  passed?: boolean,
  description?: string
): CodeSnapshot {
  const snapshot: CodeSnapshot = {
    id: `${missionId}_${Date.now()}`,
    code,
    timestamp: Date.now(),
    score,
    passed,
    description,
  }

  // Load existing history
  const history = getCodeHistory(missionId)
  history.push(snapshot)

  // Keep only last 50 versions per mission
  if (history.length > 50) {
    history.shift()
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    const allHistory = loadAllHistory()
    allHistory[missionId] = history
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory))
  }

  return snapshot
}

/**
 * Get all code snapshots for a mission
 */
export function getCodeHistory(missionId: string): CodeSnapshot[] {
  if (typeof window === 'undefined') return []

  try {
    const allHistory = loadAllHistory()
    return allHistory[missionId] || []
  } catch (e) {
    return []
  }
}

/**
 * Load all mission history from storage
 */
function loadAllHistory(): Record<string, CodeSnapshot[]> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY) || '{}'
    return JSON.parse(stored)
  } catch (e) {
    return {}
  }
}

/**
 * Get the best (highest score) version for a mission
 */
export function getBestVersion(missionId: string): CodeSnapshot | undefined {
  const history = getCodeHistory(missionId)
  if (history.length === 0) return undefined

  return history.reduce((best, current) => {
    const currentScore = current.score ?? -1
    const bestScore = best.score ?? -1
    return currentScore > bestScore ? current : best
  })
}

/**
 * Get the latest version for a mission
 */
export function getLatestVersion(missionId: string): CodeSnapshot | undefined {
  const history = getCodeHistory(missionId)
  return history[history.length - 1]
}

/**
 * Restore code from a specific snapshot
 */
export function restoreFromSnapshot(missionId: string, snapshotId: string): string | null {
  const history = getCodeHistory(missionId)
  const snapshot = history.find(s => s.id === snapshotId)
  return snapshot?.code || null
}

/**
 * Clear code history for a mission
 */
export function clearCodeHistory(missionId: string): void {
  if (typeof window === 'undefined') return

  const allHistory = loadAllHistory()
  delete allHistory[missionId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory))
}

/**
 * Clear all code history
 */
export function clearAllHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

/**
 * Auto-save setup (call this in useEffect)
 */
export function setupAutoSave(
  missionId: string,
  codeGetter: () => string,
  interval: number = AUTO_SAVE_INTERVAL
): () => void {
  if (typeof window === 'undefined') return () => {}

  const timer = setInterval(() => {
    const code = codeGetter()
    saveCodeSnapshot(missionId, code, undefined, undefined, 'Auto-saved')
  }, interval)

  return () => clearInterval(timer)
}

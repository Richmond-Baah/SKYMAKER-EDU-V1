import badgesData from '@/data/badges.json'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  tier: 'beginner' | 'intermediate' | 'advanced'
  unlockedAt: number // mission index when typically unlocked
  missionId?: string
  missions?: string[]
  requirement?: string
}

export const BADGES = badgesData as Badge[]

/**
 * Get a single badge by ID
 */
export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGES.find(b => b.id === badgeId)
}

/**
 * Get all beginner badges
 */
export function getBeginnerBadges(): Badge[] {
  return BADGES.filter(b => b.tier === 'beginner')
}

/**
 * Check if a badge is earned based on mission completion
 * Returns true if badge criteria are met
 */
export function checkBadgeEarned(
  badgeId: string,
  completedMissions: string[],
  Score: number, // average score
  timeStats: Record<string, number> // mission times
): boolean {
  const badge = getBadgeById(badgeId)
  if (!badge) return false

  // Single mission unlock
  if (badge.missionId) {
    return completedMissions.includes(badge.missionId)
  }

  // Multiple missions unlock
  if (badge.missions) {
    return badge.missions.every(m => completedMissions.includes(m))
  }

  // Score-based unlock
  if (badge.requirement === 'avg_score_80') {
    return Score >= 80
  }

  // Time-based unlock (e.g., beat mission_10 in under 20s)
  if (badge.requirement === 'time_under_20' && badge.missionId) {
    const time = timeStats[badge.missionId] || Number.MAX_VALUE
    return time <= 20
  }

  // Safety-based (zero warnings on 10 missions)
  if (badge.requirement === 'zero_warnings_10') {
    return completedMissions.length >= 10
  }

  // Default: check if completed at or after the unlockedAt index
  if (badge.unlockedAt >= 0) {
    return completedMissions.length > badge.unlockedAt
  }

  return false
}

/**
 * Get newly earned badges
 */
export function getNewlyEarnedBadges(
  previousBadges: string[],
  currentBadges: string[]
): string[] {
  return currentBadges.filter(b => !previousBadges.includes(b))
}

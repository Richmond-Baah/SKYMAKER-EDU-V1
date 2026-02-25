// Community missions for Phase 3 - student-created mission sharing

export interface CommunityMission {
  id: string
  title: string
  description: string
  creatorId: string
  creatorName: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string // e.g., "formation", "choreography", "obstacle", "search_rescue"
  objectives: string // plain text mission objective
  starterCode: string
  successCriteria: SuccessCriteria[]
  videoUrl?: string
  publishedAt: string
  updatedAt: string
  status: 'draft' | 'published' | 'featured'
  popularity: {
    views: number
    attempts: number
    completions: number
    rating: number // 0-5 average
    ratingCount: number
  }
  tags: string[]
}

export interface SuccessCriteria {
  name: string
  description: string
  validator: string // simple code snippet to validate
  points: number
}

export interface MissionComment {
  id: string
  missionId: string
  authorId: string
  text: string
  rating?: number // 1-5 stars
  createdAt: string
}

export interface CommunityMissionDiscoveryFilter {
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  search?: string
  sortBy?: 'newest' | 'popular' | 'rating' | 'trending'
  limit?: number
  offset?: number
}

// Service interface for community missions
export interface ICommunityMissionService {
  // Discovery
  discoverMissions(filter: CommunityMissionDiscoveryFilter): Promise<CommunityMission[]>
  featuredMissions(): Promise<CommunityMission[]>
  searchMissions(query: string): Promise<CommunityMission[]>
  
  // Create/Edit
  createMission(mission: Omit<CommunityMission, 'id' | 'publishedAt' | 'updatedAt' | 'popularity' | 'creatorName'>): Promise<CommunityMission>
  updateMission(id: string, updates: Partial<CommunityMission>): Promise<CommunityMission>
  publishMission(id: string): Promise<CommunityMission>
  
  // Interact
  rateMission(id: string, rating: number): Promise<void>
  addComment(missionId: string, comment: string): Promise<MissionComment>
  trackAttempt(missionId: string): Promise<void>
  
  // Get
  getMission(id: string): Promise<CommunityMission>
  getMyMissions(creatorId: string): Promise<CommunityMission[]>
  getComments(missionId: string): Promise<MissionComment[]>
}

// Peer code review system for Phase 3

export interface CodeReview {
  id: string
  submissionId: string // FK to student submission
  authorId: string // reivewer student ID
  originalAuthorId: string // original code author
  code: string // reviewed code
  comments: CodeComment[]
  overallRating: 'helpful' | 'not_helpful' | null
  status: 'pending' | 'approved' | 'changes_requested'
  createdAt: string
  updatedAt: string
}

export interface CodeComment {
  id: string
  reviewId: string
  lineNumber: number
  lineContent: string
  comment: string
  authorId: string
  replies: CodeComment[]
  createdAt: string
  resolved: boolean
}

export interface ReviewRequest {
  id: string
  submissionId: string
  authorId: string
  missionId: string
  requestedAt: string
  reviewers: string[] // Student IDs assigned to review
  status: 'open' | 'in_progress' | 'completed'
}

export interface PeerStats {
  studentId: string
  reviewsGiven: number
  reviewsReceived: number
  averageHelpfulnessRating: number // 0-1
  badges: ReviewBadge[]
}

export type ReviewBadge = 'helpful_reviewer' | 'code_mentor' | 'peer_star'

// API interface for peer review service (next)
export interface IPeerReviewService {
  // Request a review
  createReviewRequest(authorId: string, submissionId: string): Promise<ReviewRequest>
  
  // Submit a review
  submitReview(request: CodeReview): Promise<CodeReview>
  
  // Get reviews
  getReviewsForSubmission(submissionId: string): Promise<CodeReview[]>
  getReviewRequests(studentId: string): Promise<ReviewRequest[]>
  
  // Comments
  addComment(reviewId: string, comment: CodeComment): Promise<CodeComment>
  replyToComment(commentId: string, reply: CodeComment): Promise<CodeComment>
  
  // Stats
  getStudentStats(studentId: string): Promise<PeerStats>
}

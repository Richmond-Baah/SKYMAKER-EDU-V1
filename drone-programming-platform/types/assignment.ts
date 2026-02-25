export interface Assignment {
  code: string; // 6-digit assignment code
  title?: string | null;
  description?: string | null; // brief description so students know what the assignment is about
  missions: string[]; // mission IDs
  deadline?: string | null; // ISO date string
  createdAt: string; // ISO date string
}

export interface GradeResult {
  score: number
  passed: boolean
  feedback: string | string[]
  breakdown?: Record<string, any>
}


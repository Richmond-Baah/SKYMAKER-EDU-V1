/**
 * Mission type definitions for the SkyMakers curriculum.
 * Phase 1 MVP — beginner through intermediate tiers.
 */

export type MissionTier = 'beginner' | 'intermediate' | 'advanced';

export type MissionState =
  | 'intro'       // Show objective and [Start Mission] button
  | 'coding'      // Code editor + simulator
  | 'running'     // Simulation in progress
  | 'completed'   // Success animation + next steps
  | 'failed';     // Error message + [Retry] button

export interface MissionHint {
  trigger: string;
  message: string;
}

export interface SuccessCriteria {
  requiredCommands?: string[];
  minAltitude?: number;   // meters
  maxTime?: number;       // seconds
  positionAccuracy?: number; // meters
  landed?: boolean;
  distance?: number;      // meters — peak XZ distance from origin
}

export interface Mission {
  id: string;
  tier: MissionTier;
  title: string;
  objective: string;
  estimatedTime: number; // minutes
  starterCode: string;
  successCriteria: SuccessCriteria;
  hints: MissionHint[];
  unlocks: string[];
  /** Optional: learning points shown on completion */
  learningPoints?: string[];
}

/* ── Command / Execution types ─────────────────────── */

export type DroneCommandType =
  | 'takeoff'
  | 'land'
  | 'move_forward'
  | 'move_backward'
  | 'move_left'
  | 'move_right'
  | 'move_up'
  | 'move_down'
  | 'rotate_cw'
  | 'rotate_ccw'
  | 'hover'
  | 'flip'
  | 'print';

export interface DroneCommand {
  type: DroneCommandType;
  distance?: number;
  angle?: number;
  duration?: number;
  value?: string;
  line: number;       // source line (1-indexed)
  raw: string;        // original source text
}

export interface ExecutionResult {
  success: boolean;
  commandsExecuted: number;
  peakAltitude: number;
  peakDistance: number;
  finalPosition: { x: number; y: number; z: number };
  errors: string[];
  duration: number; // ms
}

/* ── Badge types ───────────────────────────────────── */

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;     // emoji or icon name
  condition: string; // human-readable condition
}

/* ── Progress types ────────────────────────────────── */

export interface MissionAttempt {
  missionId: string;
  timestamp: string;
  code: string;
  score: number;
  passed: boolean;
  metrics: {
    accuracy: number;
    stability: number;
    time: number;
  };
}

export interface UserProgress {
  completedMissions: string[];
  badges: string[];
  attempts: MissionAttempt[];
  totalTimeSpent: number; // seconds
  skillLevels: {
    control: number;
    stability: number;
    logic: number;
    efficiency: number;
    creativity: number;
    debugging: number;
    planning: number;
    execution: number;
  };
}

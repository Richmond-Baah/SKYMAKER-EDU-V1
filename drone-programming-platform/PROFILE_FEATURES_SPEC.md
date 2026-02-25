# SkyMakers Profile Section - Feature Specification

## Document Purpose
This document specifies all features, components, and functionality for the student profile section of the SkyMakers drone education platform. Use this as a reference for implementing the profile pages incrementally.

---

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Profile Tabs Structure](#profile-tabs-structure)
4. [Phase 1: MVP Features](#phase-1-mvp-features)
5. [Phase 2: Enhanced Features](#phase-2-enhanced-features)
6. [Phase 3: Advanced Features](#phase-3-advanced-features)
7. [UI Components](#ui-components)
8. [API Endpoints](#api-endpoints)
9. [Implementation Priority](#implementation-priority)

---

## Overview

### Profile Section Goals
- Display student learning progress and achievements
- Motivate continued engagement through gamification
- Provide personalized learning insights
- Enable customization and privacy controls
- Showcase student work and skills

### User Types
- **Students:** Primary users, view/edit own profile
- **Teachers:** View student profiles in their classes (read-only)
- **Parents:** View child's profile (future feature)

### Key Principles
1. **Visual First:** Use charts, icons, progress bars over text
2. **Motivational:** Show progress, celebrate wins, never punish
3. **Privacy Aware:** Student controls visibility settings
4. **Mobile Optimized:** All features work on small screens
5. **Offline Capable:** Cache and display data without connection

---

## Database Schema

### Extend Existing `profiles` Table

```sql
-- Add new columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  school VARCHAR(100),
  grade_level VARCHAR(20),
  country VARCHAR(100),
  preferred_language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'dark',
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_on_leaderboard": true, "share_with_teacher": true}'::jsonb,
  notification_settings JSONB DEFAULT '{"email_enabled": true, "email_frequency": "weekly", "in_app_enabled": true}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW();
```

### Create `user_stats` Table

```sql
CREATE TABLE public.user_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  missions_completed INT DEFAULT 0,
  total_stars INT DEFAULT 0,
  badges_earned INT DEFAULT 0,
  total_time_seconds INT DEFAULT 0,
  current_streak_days INT DEFAULT 0,
  longest_streak_days INT DEFAULT 0,
  last_activity_date DATE,
  total_lines_of_code INT DEFAULT 0,
  missions_created INT DEFAULT 0,
  peer_reviews_given INT DEFAULT 0,
  helpful_review_score INT DEFAULT 0,
  skill_levels JSONB DEFAULT '{
    "control": 0,
    "stability": 0,
    "logic": 0,
    "efficiency": 0,
    "creativity": 0,
    "debugging": 0,
    "planning": 0,
    "execution": 0
  }'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own stats
CREATE POLICY "Users can view own stats"
  ON public.user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can update stats
CREATE POLICY "System can update stats"
  ON public.user_stats
  FOR UPDATE
  USING (true);
```

### Create `user_badges` Table

```sql
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  badge_id VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100),
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own badges
CREATE POLICY "Users can view own badges"
  ON public.user_badges
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Create `user_goals` Table

```sql
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  goal_type VARCHAR(50), -- 'missions', 'streak', 'badge', 'custom'
  goal_description TEXT,
  target_value INT,
  current_value INT DEFAULT 0,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage own goals
CREATE POLICY "Users can manage own goals"
  ON public.user_goals
  FOR ALL
  USING (auth.uid() = user_id);
```

### Create `activity_log` Table

```sql
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  activity_type VARCHAR(50), -- 'mission_completed', 'badge_earned', 'goal_achieved'
  activity_description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_activity_log_user_date ON public.activity_log(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own activity
CREATE POLICY "Users can view own activity"
  ON public.activity_log
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Create `favorite_missions` Table

```sql
CREATE TABLE public.favorite_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  mission_id VARCHAR(50),
  code_snapshot TEXT,
  score INT,
  replay_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Enable RLS
ALTER TABLE public.favorite_missions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage own favorites
CREATE POLICY "Users can manage own favorites"
  ON public.favorite_missions
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## Profile Tabs Structure

### Navigation Tabs

```typescript
interface ProfileTab {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const PROFILE_TABS: ProfileTab[] = [
  { id: 'overview', label: 'Overview', icon: '📊', path: '/profile' },
  { id: 'progress', label: 'Progress', icon: '📈', path: '/profile/progress' },
  { id: 'badges', label: 'Badges', icon: '🏆', path: '/profile/badges' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼', path: '/profile/portfolio' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/profile/settings' },
  { id: 'help', label: 'Help', icon: '❓', path: '/profile/help' },
];
```

---

## Phase 1: MVP Features

### 1.1 Overview Tab (Default Landing Page)

**File:** `app/profile/page.tsx`

#### Components to Display:

**Profile Header:**
```typescript
interface ProfileHeader {
  avatarUrl: string | null;
  username: string;
  fullName: string;
  role: 'student' | 'teacher' | 'admin';
  school?: string;
  gradeLevel?: string;
  country?: string;
  memberSince: Date;
}
```

**Visual Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  [◄ Back to Dashboard]                                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐  Alex Kamau                                   │
│  │  📷    │  @alexk                                        │
│  │ Avatar │  🎓 Student • Grade 9                          │
│  └────────┘  🇰🇪 Nairobi, Kenya                           │
│              Member since January 2026                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Quick Stats Cards:**
```typescript
interface QuickStats {
  missionsCompleted: number;
  totalMissions: number;
  totalStars: number;
  maxStars: number;
  badgesEarned: number;
  totalBadges: number;
  currentStreak: number;
  totalTimeMinutes: number;
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  🎯 Missions Completed     ⭐ Stars Earned             │
│     12 / 30 (40%)             28 / 90                   │
│                                                          │
│  🏆 Badges Unlocked        🔥 Current Streak           │
│     5 / 20                    5 days                    │
└─────────────────────────────────────────────────────────┘
```

**Recent Activity Feed:**
```typescript
interface ActivityItem {
  type: 'mission_completed' | 'badge_earned' | 'streak_milestone';
  description: string;
  timestamp: Date;
  icon: string;
}
```

**Visual Layout:**
```
Recent Activity:
─────────────────────────────────────────
🏆 Earned "Pattern Master" badge
   2 hours ago

🎯 Completed Mission 12 with 92%
   Yesterday at 3:45 PM

🔥 Reached 5-day learning streak!
   2 days ago
```

**Action Buttons:**
- **[Edit Profile]** - Navigate to settings
- **[View Full Progress]** - Navigate to progress tab
- **[Share Profile]** - Copy shareable link (if public)

---

### 1.2 Progress Tab

**File:** `app/profile/progress/page.tsx`

#### Components to Display:

**Skill Radar Chart:**
```typescript
interface SkillData {
  control: number;      // 0-100
  stability: number;
  logic: number;
  efficiency: number;
  creativity: number;
  debugging: number;
  planning: number;
  execution: number;
}
```

**Implementation:**
```typescript
import { Radar } from 'recharts';

const SkillRadarChart = ({ skills }: { skills: SkillData }) => {
  const data = [
    { skill: 'Control', value: skills.control },
    { skill: 'Stability', value: skills.stability },
    { skill: 'Logic', value: skills.logic },
    { skill: 'Efficiency', value: skills.efficiency },
    { skill: 'Creativity', value: skills.creativity },
    { skill: 'Debugging', value: skills.debugging },
    { skill: 'Planning', value: skills.planning },
    { skill: 'Execution', value: skills.execution },
  ];

  return (
    <Radar
      data={data}
      dataKey="value"
      stroke="#4A90E2"
      fill="#4A90E2"
      fillOpacity={0.6}
    />
  );
};
```

**Mission History Table:**
```typescript
interface MissionAttempt {
  missionId: string;
  missionTitle: string;
  score: number;
  timeSpent: number; // seconds
  attempts: number;
  completedAt: Date;
  replayUrl?: string;
}
```

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  Mission History                              [Export CSV]   │
├──────────────────────────────────────────────────────────────┤
│  Mission          Score   Time    Attempts  Date      Replay │
│  ─────────────────────────────────────────────────────────── │
│  Mission 12       92%     4m 12s  2         Feb 18    [▶]   │
│  Mission 11       87%     6m 45s  3         Feb 17    [▶]   │
│  Mission 10       95%     3m 20s  1         Feb 16    [▶]   │
│  Mission 09       78%     8m 10s  4         Feb 15    [▶]   │
└──────────────────────────────────────────────────────────────┘
```

**Learning Streak Calendar:**
```typescript
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  activityDates: Date[]; // Array of dates with activity
}
```

**Visual Layout:**
```
Learning Streak: 🔥 5 days    Longest: 12 days

Feb 2026
─────────────────────────────────────
Mon  Tue  Wed  Thu  Fri  Sat  Sun
                  1    2    3    4
 5    6    7    8    9   10   11
12   13   🟢   🟢   🟢   🟢   🟢   ← Current streak
19   20   21   22   23   24   25

🟢 = Activity that day
```

**Time Spent Graph:**
```typescript
interface TimeSpentData {
  date: string;
  minutes: number;
}
```

**Implementation:**
```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={timeSpentData}>
  <XAxis dataKey="date" />
  <YAxis />
  <Line type="monotone" dataKey="minutes" stroke="#4A90E2" />
</LineChart>
```

---

### 1.3 Badges Tab

**File:** `app/profile/badges/page.tsx`

#### Badge Data Structure:

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or image URL
  category: 'achievement' | 'milestone' | 'social' | 'skill';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}
```

#### Badge Categories:

**Achievement Badges:**
- 🎯 **First Flight** - Complete Mission 1
- 🏆 **Perfect Landing** - Land within 10cm accuracy 
- 🎯 **Precision Pilot** - 10 missions with 95%+ score
- 🚀 **Mission Master** - Complete all beginner missions
- 🌟 **Perfect Score** - Get 100% on any mission

**Milestone Badges:**
- 📈 **Getting Started** - Complete 5 missions
- 💯 **Halfway There** - Complete 15 missions
- 🎓 **Graduate** - Complete all 30 missions
- ⏱️ **Time Invested** - 10 hours of learning
- 📚 **Dedicated Learner** - 50 hours of learning

**Streak Badges:**
- 🔥 **Warm Up** - 3-day streak
- 🔥🔥 **On Fire** - 7-day streak  
- 🔥🔥🔥 **Unstoppable** - 30-day streak
- 📅 **Weekend Warrior** - Learn on 4 consecutive weekends

**Skill Badges:**
- 🧠 **Logic Master** - Complete all loop/conditional missions
- 🎨 **Creative Coder** - 5 unique solutions to same mission
- ⚡ **Speed Demon** - Beat target time on 10 missions
- 🐛 **Bug Squasher** - Fix 20 code errors
- 📐 **Pattern Pro** - Complete all geometry missions

**Social Badges:**
- 👥 **Team Player** - Help 5 peers with code reviews
- ⭐ **Five Star Helper** - Receive 20 helpful votes
- 🌍 **Community Member** - Share 3 missions
- 💬 **Active Participant** - 50 forum posts

**Visual Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Badge Gallery                                           │
│  Earned: 5/20                                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Filter: All | Achievement | Milestone | Skill | Social]│
│  [Sort: Recent | Rarity | Alphabetical]                 │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │   🎯   │  │   🏆   │  │   🔥   │  │   🧠   │       │
│  │ First  │  │Perfect │  │ Week   │  │ Logic  │       │
│  │ Flight │  │Landing │  │Warrior │  │ Master │       │
│  │✓ Earned│  │✓ Earned│  │✓ Earned│  │✓ Earned│       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │   ⚡   │  │   🎓   │  │   👥   │  │   🌟   │       │
│  │ Speed  │  │Graduate│  │  Team  │  │Perfect │       │
│  │ Demon  │  │        │  │ Player │  │ Score  │       │
│  │🔒 7/10 │  │🔒 12/30│  │🔒 2/5  │  │ 🔒 0/1 │       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Badge Click Modal:**
```
┌────────────────────────────────────┐
│  🏆 Perfect Landing                │
│                                    │
│  Land within 10cm of target        │
│  accuracy                          │
│                                    │
│  Earned: Feb 15, 2026             │
│  Rarity: Rare                      │
│                                    │
│  [Share] [Close]                  │
└────────────────────────────────────┘
```

---

### 1.4 Settings Tab

**File:** `app/profile/settings/page.tsx`

#### Settings Sections:

**Profile Information:**
```typescript
interface ProfileSettings {
  username: string;
  fullName: string;
  bio: string;
  school?: string;
  gradeLevel?: string;
  country?: string;
  preferredLanguage: 'en' | 'fr' | 'sw' | 'ha';
}
```

**Form Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Profile Information                                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Email (cannot be changed)                          │
│  [alex.kamau@example.com]                           │
│                                                      │
│  Username *                                          │
│  [alexk________________]                             │
│                                                      │
│  Full Name                                           │
│  [Alex Kamau__________]                             │
│                                                      │
│  Bio (optional)                                      │
│  [I love building things with code!______________] │
│                                                      │
│  School (optional)                                   │
│  [Nairobi Academy____]                              │
│                                                      │
│  Grade Level                                         │
│  [▼ Grade 9]                                        │
│                                                      │
│  Country                                             │
│  [▼ Kenya]                                          │
│                                                      │
│  Preferred Language                                  │
│  [▼ English]                                        │
│                                                      │
│  [Save Changes]                                     │
└──────────────────────────────────────────────────────┘
```

**Avatar Upload:**
```typescript
interface AvatarUpload {
  currentAvatar: string | null;
  allowedFormats: ['jpg', 'png', 'webp'];
  maxSizeKB: 500;
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│  Profile Picture                     │
│                                      │
│  ┌────────┐                         │
│  │        │                         │
│  │  📷    │  [Upload New]           │
│  │        │  [Choose Avatar]        │
│  └────────┘  [Remove]               │
│                                      │
│  Max 500KB, JPG/PNG/WEBP            │
└──────────────────────────────────────┘
```

**Appearance Settings:**
```typescript
interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  codeEditorTheme: 'vs-dark' | 'monokai' | 'solarized-light';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│  Appearance                          │
├──────────────────────────────────────┤
│                                      │
│  Theme                               │
│  ○ Light  ● Dark  ○ Auto            │
│                                      │
│  Code Editor Theme                   │
│  [▼ VS Code Dark+]                  │
│                                      │
│  Font Size                           │
│  ○ Small  ● Medium  ○ Large         │
│                                      │
│  ☐ High Contrast Mode               │
│                                      │
│  [Save Preferences]                 │
└──────────────────────────────────────┘
```

**Privacy Settings:**
```typescript
interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnLeaderboard: boolean;
  showOnLeaderboardAs: 'username' | 'anonymous';
  shareProgressWithTeacher: boolean;
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│  Privacy                             │
├──────────────────────────────────────┤
│                                      │
│  Profile Visibility                  │
│  ○ Public                           │
│  ● Friends Only                      │
│  ○ Private                          │
│                                      │
│  ☑ Show on leaderboards             │
│  Display as: [▼ Username]           │
│                                      │
│  ☑ Share progress with teacher      │
│                                      │
│  [Save Privacy Settings]            │
└──────────────────────────────────────┘
```

**Notification Settings:**
```typescript
interface NotificationSettings {
  emailEnabled: boolean;
  emailFrequency: 'realtime' | 'daily' | 'weekly' | 'never';
  inAppEnabled: boolean;
  notifyOn: {
    badgeEarned: boolean;
    missionAssigned: boolean;
    goalCompleted: boolean;
    streakReminder: boolean;
    peerComment: boolean;
  };
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│  Notifications                       │
├──────────────────────────────────────┤
│                                      │
│  ☑ Email notifications              │
│  Frequency: [▼ Weekly digest]       │
│                                      │
│  ☑ In-app notifications             │
│                                      │
│  Notify me when:                     │
│  ☑ I earn a badge                   │
│  ☑ Teacher assigns mission          │
│  ☑ I complete a goal                │
│  ☑ Streak reminder (daily)          │
│  ☐ Someone comments on my code      │
│                                      │
│  [Save Notification Settings]       │
└──────────────────────────────────────┘
```

**Account Actions:**
```
┌──────────────────────────────────────┐
│  Account Management                  │
├──────────────────────────────────────┤
│                                      │
│  [Change Password]                  │
│                                      │
│  [Download My Data] (GDPR)          │
│                                      │
│  [Delete Account]                   │
│  (This action cannot be undone)     │
│                                      │
└──────────────────────────────────────┘
```

---

## Phase 2: Enhanced Features

### 2.1 Portfolio Tab

**File:** `app/profile/portfolio/page.tsx`

#### Favorite Missions:

```typescript
interface FavoriteMission {
  id: string;
  missionId: string;
  missionTitle: string;
  code: string;
  score: number;
  replayUrl: string;
  notes: string;
  addedAt: Date;
  shareableLink: string;
}
```

**Visual Layout:**
```
┌──────────────────────────────────────────────────────┐
│  My Portfolio                                        │
│  Showcase your best work                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Favorite Missions (3/5)                            │
│                                                      │
│  ┌─────────────────────────────────────┐           │
│  │  Mission 10: The Perfect Square     │           │
│  │  Score: 98% | 2m 15s                │           │
│  │                                      │           │
│  │  [▶ View Replay] [View Code]       │           │
│  │  [Share] [Remove from favorites]   │           │
│  │                                      │           │
│  │  Notes: Used a clever loop to...   │           │
│  └─────────────────────────────────────┘           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Code Statistics:

```typescript
interface CodeStats {
  totalLinesWritten: number;
  mostUsedCommand: string;
  mostUsedCommandCount: number;
  averageCodeLength: number; // lines per mission
  cleanestCode: {
    missionId: string;
    lines: number;
  };
  commandUsageBreakdown: {
    [command: string]: number;
  };
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│  Code Statistics                     │
├──────────────────────────────────────┤
│                                      │
│  Total Lines Written: 1,247         │
│  Most Used Command: move_forward()  │
│  Average Mission Length: 42 lines   │
│                                      │
│  Command Usage:                      │
│  ▓▓▓▓▓▓▓▓░░ move_forward (45%)     │
│  ▓▓▓▓▓░░░░░ takeoff (25%)          │
│  ▓▓▓░░░░░░░ land (15%)             │
│  ▓▓░░░░░░░░ move_left (10%)        │
│                                      │
│  🏆 Cleanest Code Award             │
│  Mission 8: Only 12 lines!          │
│                                      │
└──────────────────────────────────────┘
```

#### Certificates:

```typescript
interface Certificate {
  id: string;
  type: 'beginner_complete' | 'intermediate_complete' | 'advanced_complete';
  title: string;
  issuedDate: Date;
  downloadUrl: string;
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│  Certificates                        │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────┐    │
│  │  🎓 Certificate              │    │
│  │                              │    │
│  │  Python Fundamentals         │    │
│  │  via SkyMakers              │    │
│  │                              │    │
│  │  Alex Kamau                  │    │
│  │  Completed: Feb 18, 2026    │    │
│  │                              │    │
│  │  [Download PDF] [Share]     │    │
│  └────────────────────────────┘    │
│                                      │
└──────────────────────────────────────┘
```

---

### 2.2 Goals & Challenges

**File:** `app/profile/goals/page.tsx`

#### Personal Goals:

```typescript
interface UserGoal {
  id: string;
  type: 'missions' | 'streak' | 'badge' | 'custom';
  description: string;
  targetValue: number;
  currentValue: number;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
}
```

**Visual Layout:**
```
┌──────────────────────────────────────────────────────┐
│  My Goals                           [+ Create Goal]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Active Goals (2)                                   │
│                                                      │
│  🎯 Complete 3 missions this week                   │
│  ▓▓▓▓▓▓░░░░ 2/3 (67%)                             │
│  Due: Feb 20                                        │
│                                                      │
│  🏆 Earn Pattern Master badge                       │
│  ▓▓▓▓▓▓▓▓░░ 4/5 geometry missions                 │
│  No deadline                                         │
│                                                      │
│  Completed Goals (3) [Show]                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Create Goal Modal:**
```
┌─────────────────────────────────────┐
│  Create New Goal                    │
├─────────────────────────────────────┤
│                                     │
│  Goal Type:                         │
│  ○ Complete missions                │
│  ○ Maintain streak                  │
│  ○ Earn specific badge              │
│  ● Custom goal                      │
│                                     │
│  Description:                       │
│  [Learn to use functions______]   │
│                                     │
│  Target:                            │
│  [Complete 5 missions using...]    │
│                                     │
│  Deadline (optional):               │
│  [📅 Feb 25, 2026]                 │
│                                     │
│  [Cancel] [Create Goal]            │
└─────────────────────────────────────┘
```

#### AI Recommendations:

```typescript
interface Recommendation {
  type: 'skill_gap' | 'next_mission' | 'practice' | 'achievement';
  title: string;
  description: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
}
```

**Visual:**
```
┌──────────────────────────────────────────────────────┐
│  Recommended for You                                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📚 Improve Your Loop Skills                        │
│  You've struggled with loops in the last 3          │
│  missions. Try our interactive tutorial!            │
│  [Start Tutorial]                                   │
│                                                      │
│  ⚡ You're Almost There!                            │
│  Just 1 more mission for "Pattern Master" badge    │
│  [Continue Learning]                                │
│                                                      │
│  🔥 Don't Break Your Streak!                        │
│  You haven't practiced today. Keep your             │
│  5-day streak alive!                                │
│  [Start Mission]                                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 2.3 Social Features

**File:** `app/profile/social/page.tsx`

#### Friends/Following:

```typescript
interface Friend {
  id: string;
  username: string;
  avatarUrl: string;
  currentStreak: number;
  lastMissionCompleted: string;
  following: boolean;
}
```

**Visual:**
```
┌──────────────────────────────────────────────────────┐
│  Friends (12)                       [Find Friends]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────┐  Sarah M.                               │
│  │  👤    │  @sarahm                                │
│  └────────┘  🔥 7-day streak                        │
│              Last completed: Mission 15             │
│              [View Profile] [Following ✓]           │
│                                                      │
│  ┌────────┐  John K.                                │
│  │  👤    │  @johnk                                 │
│  └────────┘  🔥 3-day streak                        │
│              Last completed: Mission 8              │
│              [View Profile] [Follow]                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Activity Feed:

```typescript
interface FriendActivity {
  userId: string;
  username: string;
  activityType: 'mission_completed' | 'badge_earned' | 'goal_achieved';
  description: string;
  timestamp: Date;
}
```

**Visual:**
```
┌──────────────────────────────────────────────────────┐
│  Friend Activity                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Sarah M. completed Mission 15 with 95%!            │
│  2 hours ago                                         │
│                                                      │
│  John K. earned "Logic Master" badge                │
│  5 hours ago                                         │
│                                                      │
│  Emma T. reached a 10-day streak! 🔥                │
│  Yesterday                                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Leaderboard Position:

```
┌──────────────────────────────────────┐
│  Your Rankings                       │
├──────────────────────────────────────┤
│                                      │
│  🏆 Class Rank: #3 / 25             │
│  🌍 Global Rank: #245 / 1,247       │
│                                      │
│  [View Class Leaderboard]           │
│  [View Global Leaderboard]          │
│                                      │
└──────────────────────────────────────┘
```

---

## Phase 3: Advanced Features

### 3.1 Hardware Connection

**File:** `app/profile/hardware/page.tsx`

```typescript
interface ConnectedDrone {
  id: string;
  name: string;
  model: 'tello' | 'tello_edu' | 'mambo' | 'custom';
  batteryLevel: number;
  firmwareVersion: string;
  lastConnected: Date;
  totalFlightTime: number; // seconds
  status: 'connected' | 'disconnected' | 'charging';
}
```

**Visual:**
```
┌──────────────────────────────────────────────────────┐
│  Connected Drones                   [+ Add Drone]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🚁 My Tello EDU                                    │
│  Model: DJI Tello EDU                               │
│  Battery: ▓▓▓▓▓▓▓░░░ 75%                          │
│  Firmware: v2.4.1                                   │
│  Status: 🟢 Connected                               │
│  Total Flight Time: 2h 34m                          │
│  Last Used: 2 hours ago                             │
│                                                      │
│  [Launch Mission] [Settings] [Disconnect]          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.2 Community Contributions

**File:** `app/profile/community/page.tsx`

```typescript
interface CommunityStats {
  missionsCreated: number;
  totalPlays: number;
  averageRating: number;
  peerReviewsGiven: number;
  helpfulVotes: number;
  forumPosts: number;
}
```

**Visual:**
```
┌──────────────────────────────────────┐
│  Community Contributions             │
├──────────────────────────────────────┤
│                                      │
│  Missions Created: 3                │
│  Total Plays: 47                    │
│  Average Rating: ⭐⭐⭐⭐½ (4.3)     │
│                                      │
│  Peer Reviews: 12                   │
│  Helpful Votes: 28                  │
│  Forum Posts: 15                    │
│                                      │
│  [View My Missions]                 │
│  [View Reviews Given]               │
│                                      │
└──────────────────────────────────────┘
```

---

## UI Components

### Reusable Components to Create

#### 1. StatCard Component
```typescript
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

// Usage:
<StatCard
  icon="🎯"
  label="Missions Completed"
  value={12}
  subValue="of 30"
  color="blue"
/>
```

#### 2. ProgressBar Component
```typescript
interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
}

// Usage:
<ProgressBar
  current={12}
  target={30}
  label="Missions"
  color="green"
  showPercentage
/>
```

#### 3. BadgeCard Component
```typescript
interface BadgeCardProps {
  badge: Badge;
  onClick: () => void;
}

// Usage:
<BadgeCard
  badge={{
    id: 'first_flight',
    name: 'First Flight',
    icon: '🎯',
    earned: true,
    earnedAt: new Date()
  }}
  onClick={() => showBadgeModal(badge)}
/>
```

#### 4. ActivityItem Component
```typescript
interface ActivityItemProps {
  activity: ActivityItem;
}

// Usage:
<ActivityItem
  activity={{
    type: 'badge_earned',
    description: 'Earned "Pattern Master" badge',
    timestamp: new Date(),
    icon: '🏆'
  }}
/>
```

#### 5. SkillRadar Component
```typescript
interface SkillRadarProps {
  skills: SkillData;
  size?: number;
}

// Usage:
<SkillRadar
  skills={{
    control: 85,
    stability: 72,
    logic: 68,
    // ...
  }}
  size={300}
/>
```

---

## API Endpoints

### Profile Endpoints

```typescript
// GET /api/profile
// Returns current user's profile data
interface ProfileResponse {
  profile: Profile;
  stats: UserStats;
  badges: Badge[];
  recentActivity: ActivityItem[];
}

// PATCH /api/profile
// Update profile information
interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
  bio?: string;
  school?: string;
  gradeLevel?: string;
  country?: string;
}

// POST /api/profile/avatar
// Upload profile picture
// FormData with 'avatar' file

// GET /api/profile/stats
// Get detailed statistics
interface StatsResponse {
  stats: UserStats;
  skillBreakdown: SkillData;
  timeSpentByDay: TimeSpentData[];
  missionHistory: MissionAttempt[];
}

// GET /api/profile/badges
// Get all badges (earned and locked)
interface BadgesResponse {
  earned: Badge[];
  locked: Badge[];
  progress: { [badgeId: string]: { current: number; target: number } };
}

// POST /api/profile/goals
// Create new goal
interface CreateGoalRequest {
  type: string;
  description: string;
  targetValue: number;
  deadline?: string;
}

// GET /api/profile/goals
// Get user's goals
interface GoalsResponse {
  active: UserGoal[];
  completed: UserGoal[];
}

// DELETE /api/profile/goals/:goalId
// Delete a goal

// GET /api/profile/favorites
// Get favorite missions
interface FavoritesResponse {
  favorites: FavoriteMission[];
}

// POST /api/profile/favorites
// Add mission to favorites
interface AddFavoriteRequest {
  missionId: string;
  code: string;
  score: number;
  notes?: string;
}

// DELETE /api/profile/favorites/:missionId
// Remove from favorites

// PATCH /api/profile/settings
// Update settings
interface UpdateSettingsRequest {
  theme?: string;
  privacySettings?: PrivacySettings;
  notificationSettings?: NotificationSettings;
}

// GET /api/profile/recommendations
// Get AI-powered recommendations
interface RecommendationsResponse {
  recommendations: Recommendation[];
}

// POST /api/profile/export
// Export user data (GDPR)
// Returns download link to JSON/CSV file
```

---

## Implementation Priority

### Week 1-2: Core Profile (MVP)
- [ ] Database schema setup
- [ ] Profile overview page with header
- [ ] Quick stats cards
- [ ] Basic profile editing
- [ ] Avatar upload functionality

### Week 3-4: Progress & Badges
- [ ] Mission history table
- [ ] Badge gallery (earned/locked)
- [ ] Basic skill tracking
- [ ] Activity log

### Week 5-6: Settings & Polish
- [ ] Settings page (all sections)
- [ ] Theme switching
- [ ] Privacy controls
- [ ] Notification preferences

### Week 7-8: Enhanced Features
- [ ] Skill radar chart
- [ ] Learning streak calendar
- [ ] Goals system
- [ ] Portfolio/favorites

### Week 9-10: Social Features
- [ ] Friends/following
- [ ] Activity feed
- [ ] Leaderboard integration

### Week 11-12: Advanced Features
- [ ] Hardware connection page
- [ ] Community stats
- [ ] Certificates generation
- [ ] Data export

---

## Design Specifications

### Color Palette (From Main Spec)
- **Primary:** `#4A90E2` (Sky Blue)
- **Success:** `#4CAF50` (Green)
- **Error:** `#F44336` (Red)
- **Warning:** `#FF9800` (Orange)
- **Background Light:** `#F5F7FA`
- **Background Dark:** `#1E1E2E`

### Typography
- **Headings:** Inter or Poppins (600-700 weight)
- **Body:** System fonts (SF Pro, Segoe UI)
- **Stats/Numbers:** Mono font (JetBrains Mono)

### Spacing
- Card padding: `24px`
- Section gap: `32px`
- Component gap: `16px`
- Tight gap: `8px`

### Responsive Breakpoints
- Mobile: `< 768px` (single column)
- Tablet: `768px - 1024px` (flexible grid)
- Desktop: `> 1024px` (multi-column layout)

---

## Testing Checklist

### Functionality Tests
- [ ] Can view profile as logged-in user
- [ ] Can edit profile information
- [ ] Avatar upload works (validates size/format)
- [ ] Stats display correctly
- [ ] Badge progress updates in real-time
- [ ] Mission history loads and sorts correctly
- [ ] Settings persist after save
- [ ] Theme changes apply immediately
- [ ] Privacy settings work (profile visibility)
- [ ] Goals can be created, updated, deleted
- [ ] Favorites can be added/removed

### Performance Tests
- [ ] Profile loads in < 2 seconds
- [ ] Charts render smoothly (60 FPS)
- [ ] Image upload < 5 seconds
- [ ] Settings save < 1 second

### Accessibility Tests
- [ ] All forms keyboard accessible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text on all images

### Mobile Tests
- [ ] Layout stacks correctly on mobile
- [ ] Touch targets > 44x44px
- [ ] Forms usable on small screens
- [ ] Charts responsive and readable

---

## Success Metrics

### User Engagement
- **Profile Completion Rate:** > 80% of users fill all basic fields
- **Avatar Upload Rate:** > 50% upload custom avatar
- **Goal Creation:** > 40% create at least one goal
- **Settings Customization:** > 60% change at least one setting

### Feature Usage
- **Badge Gallery Views:** Average 3+ views per session
- **Progress Tab Views:** Average 2+ views per week
- **Portfolio Views:** > 30% of users add favorites

### Retention Impact
- **Return Rate:** Users who customize profile return 30% more
- **Session Length:** Profile viewers have 20% longer sessions

---

## Error Handling

### Common Errors

| Error | Cause | User Message | Solution |
|-------|-------|--------------|----------|
| Profile load fails | Network/DB issue | "Unable to load profile. Please refresh." | Retry logic + offline cache |
| Avatar upload fails | File too large | "Image must be under 500KB" | Show size before upload |
| Settings save fails | Validation error | "Please fill all required fields" | Highlight invalid fields |
| Username taken | Duplicate username | "Username already taken" | Suggest alternatives |
| Badge not found | Invalid badge ID | "Badge not found" | Log error, hide badge |

### Offline Behavior
- Show cached profile data
- Disable edit buttons with "Offline" badge
- Queue changes for when online
- Show sync status indicator

---

## Implementation Example

### Complete Profile Overview Page

```typescript
// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { StatCard } from '@/components/profile/StatCard'
import { ActivityFeed } from '@/components/profile/ActivityFeed'

interface ProfileData {
  profile: any;
  stats: any;
  badges: any[];
  recentActivity: any[];
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      // Fetch stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      // Fetch badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user!.id)
        .order('earned_at', { ascending: false })

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setData({ profile, stats, badges, recentActivity: activity })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading profile...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
            {data?.profile.avatar_url ? (
              <img 
                src={data.profile.avatar_url} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              '📷'
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{data?.profile.full_name}</h1>
            <p className="text-gray-600">@{data?.profile.username}</p>
            <p className="text-sm text-gray-500">
              🎓 {data?.profile.role} • {data?.profile.grade_level}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="🎯"
          label="Missions Completed"
          value={data?.stats.missions_completed}
          subValue={`of 30`}
        />
        <StatCard
          icon="⭐"
          label="Stars Earned"
          value={data?.stats.total_stars}
          subValue={`of 90`}
        />
        <StatCard
          icon="🏆"
          label="Badges Unlocked"
          value={data?.stats.badges_earned}
          subValue={`of 20`}
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${data?.stats.current_streak_days} days`}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <ActivityFeed activities={data?.recentActivity || []} />
      </div>
    </div>
  )
}
```

---

## Next Steps

1. **Review this specification** with your team
2. **Set up database schema** using the SQL provided
3. **Start with Phase 1 MVP** (Overview + Basic Stats)
4. **Create reusable components** (StatCard, ProgressBar, etc.)
5. **Implement API endpoints** for data fetching
6. **Test thoroughly** on mobile and desktop
7. **Gather user feedback** and iterate

---

**Document Version:** 1.0  
**Last Updated:** February 18, 2026  
**Status:** Ready for Implementation

**For questions or clarifications, reference the main FEATURES_SPEC.md document.**

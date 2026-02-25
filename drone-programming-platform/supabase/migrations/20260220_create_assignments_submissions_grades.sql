-- ============================================================
-- Supabase Migration: Create assignments, submissions, grades
-- Replaces the Prisma-managed tables with Supabase-native ones
-- ============================================================

-- 1) assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text        NOT NULL UNIQUE,
    title       text,
    description text,
    missions    jsonb       NOT NULL DEFAULT '[]'::jsonb,
    deadline    timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_assignments_code ON public.assignments (code);

-- 2) submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   uuid        NOT NULL REFERENCES public.assignments (id) ON DELETE CASCADE,
    user_id         uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
    student_id      text        NOT NULL,
    mission_id      text        NOT NULL,
    code            text        NOT NULL,
    flight_data     jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student    ON public.submissions (student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_mission    ON public.submissions (mission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user       ON public.submissions (user_id);

-- 3) grades table
CREATE TABLE IF NOT EXISTS public.grades (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id   uuid        NOT NULL UNIQUE REFERENCES public.submissions (id) ON DELETE CASCADE,
    score           integer     NOT NULL,
    passed          boolean     NOT NULL,
    feedback        text        NOT NULL,
    breakdown       jsonb       NOT NULL DEFAULT '{}'::jsonb,
    graded_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grades_submission ON public.grades (submission_id);

-- 4) Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to assignments
DROP TRIGGER IF EXISTS trg_assignments_updated ON public.assignments;
CREATE TRIGGER trg_assignments_updated
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Apply trigger to submissions
DROP TRIGGER IF EXISTS trg_submissions_updated ON public.submissions;
CREATE TRIGGER trg_submissions_updated
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) Row Level Security (RLS)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades      ENABLE ROW LEVEL SECURITY;

-- Assignments: anyone can read (students need to redeem codes), authenticated can insert
CREATE POLICY "Assignments are readable by everyone"
    ON public.assignments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create assignments"
    ON public.assignments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Submissions: users can read their own, teachers can read all via service role
CREATE POLICY "Users can read own submissions"
    ON public.submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read submissions by assignment"
    ON public.submissions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create submissions"
    ON public.submissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow anonymous submissions (for MVP where student_id is app-generated)
CREATE POLICY "Anon can create submissions"
    ON public.submissions FOR INSERT
    TO anon
    WITH CHECK (true);

-- Grades: readable by everyone (linked to submissions)
CREATE POLICY "Grades are readable by everyone"
    ON public.grades FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create grades"
    ON public.grades FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anon can create grades"
    ON public.grades FOR INSERT
    TO anon
    WITH CHECK (true);


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { beginnerLessons } from './lessons';
import { User } from '@supabase/supabase-js';

interface FlightMetrics {
    accuracy: number;
    stability: number;
    time: number;
}

interface UserState {
    currentLessonId: string;
    completedLessons: string[];
    assignedMissions: string[]; // assignments pushed to the student
    code: string;
    metrics: FlightMetrics;
    mode: 'simulation' | 'hardware';
    isRunning: boolean;
    // Map of lessonId -> saved code
    savedCode: Record<string, string>;

    // Auth
    user: User | null;
    role: string | null;

    // Actions
    setLesson: (lessonId: string) => void;
    completeLesson: (lessonId: string, metrics: FlightMetrics) => void;
    redeemAssignment: (missions: string[]) => void;
    setCode: (code: string) => void;
    setMode: (mode: 'simulation' | 'hardware') => void;
    setRunning: (running: boolean) => void;
    updateMetrics: (metrics: Partial<FlightMetrics>) => void;
    unlockNextLesson: () => void;
    setUser: (user: User | null) => void;
    setRole: (role: string | null) => void;
    setCompletedLessons: (completed: string[]) => void;
}

export const useDroneStore = create<UserState>()(
    persist(
        (set, get) => ({
            currentLessonId: beginnerLessons[0].id,
            completedLessons: [],
            assignedMissions: [],
            code: beginnerLessons[0].components.codeTemplate || '',
            savedCode: {},
            metrics: {
                accuracy: 0,
                stability: 0,
                time: 0,
            },
            mode: 'simulation',
            isRunning: false,
            user: null,
            role: null,

            setLesson: (lessonId) => {
                const state = get();
                const lesson = beginnerLessons.find(l => l.id === lessonId);

                if (!lesson) return;

                // Check if lesson is locked (all prerequisites met)
                const isLocked = lesson.prerequisites.some(p => !state.completedLessons.includes(p)) && lesson.id !== beginnerLessons[0].id;
                if (isLocked) {
                    return; // Block setting locked lesson
                }

                // If switching to the same lesson, do nothing (preserve code)
                if (state.currentLessonId === lessonId) return;

                // Save current code before switching
                const updatedSavedCode = {
                    ...state.savedCode,
                    [state.currentLessonId]: state.code
                };

                // Retrieve saved code for new lesson, or use template
                const newCode = updatedSavedCode[lessonId] || lesson.components.codeTemplate || '';

                set({
                    currentLessonId: lessonId,
                    code: newCode,
                    savedCode: updatedSavedCode
                });
            },

            // Redeem assignment (student-side): add missions to assignedMissions and open first
            redeemAssignment: (missions: string[]) => {
                const { assignedMissions } = get();
                const merged = Array.from(new Set([...(assignedMissions || []), ...missions]));
                set({ assignedMissions: merged });

                // If first mission matches a lesson, switch to it
                const first = missions && missions.length > 0 ? missions[0] : null;
                if (first) {
                    const lesson = beginnerLessons.find(l => l.id === first);
                    if (lesson) {
                        // We manually call the logic similar to setLesson to ensure saving
                        const state = get();
                        // Save current code
                        const updatedSavedCode = {
                            ...state.savedCode,
                            [state.currentLessonId]: state.code
                        };
                        // Load new code or template
                        const newCode = updatedSavedCode[first] || lesson.components.codeTemplate || '';

                        set({
                            currentLessonId: first,
                            code: newCode,
                            savedCode: updatedSavedCode
                        });
                    }
                }
            },

            completeLesson: (lessonId, metrics) => {
                const { completedLessons } = get();
                // Ensure no duplicates
                let newCompleted = completedLessons;
                if (!completedLessons.includes(lessonId)) {
                    newCompleted = [...completedLessons, lessonId];
                }
                set({ completedLessons: newCompleted, metrics });
            },

            setCode: (code) => set({ code }),

            setMode: (mode) => set({ mode }),

            setRunning: (running) => set({ isRunning: running }),

            updateMetrics: (newMetrics) => set((state) => ({
                metrics: { ...state.metrics, ...newMetrics }
            })),

            unlockNextLesson: () => {
                // Logic to unlock happens via checking completedLessons in UI
            },

            setUser: (user) => set({ user }),

            setRole: (role) => set({ role }),

            setCompletedLessons: (completedLessons) => set({ completedLessons }),
        }),
        {
            name: 'drone-platform-storage', // unique name
            // Optionally, avoid persisting 'user' if we want purely session-based auth?
            // But persisting user object helps avoid flicker on refresh.
            // Supabase auth helper handles session cookies, so we might not need to persist user in localStorage.
            // But syncing them is fine.
            partialize: (state) => {
                const { user, role, isRunning, ...rest } = state;
                return rest;
            }
        }
    )
);

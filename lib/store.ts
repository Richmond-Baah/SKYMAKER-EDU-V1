
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lesson, beginnerLessons } from './lessons';

interface FlightMetrics {
    accuracy: number;
    stability: number;
    time: number;
}

interface UserState {
    currentLessonId: string;
    completedLessons: string[];
    code: string;
    metrics: FlightMetrics;
    mode: 'simulation' | 'hardware';
    isRunning: boolean;

    // Actions
    setLesson: (lessonId: string) => void;
    completeLesson: (lessonId: string, metrics: FlightMetrics) => void;
    setCode: (code: string) => void;
    setMode: (mode: 'simulation' | 'hardware') => void;
    setRunning: (running: boolean) => void;
    updateMetrics: (metrics: Partial<FlightMetrics>) => void;
    unlockNextLesson: () => void;
}

export const useDroneStore = create<UserState>()(
    persist(
        (set, get) => ({
            currentLessonId: beginnerLessons[0].id,
            completedLessons: [],
            code: beginnerLessons[0].components.codeTemplate || '',
            metrics: {
                accuracy: 0,
                stability: 0,
                time: 0,
            },
            mode: 'simulation',
            isRunning: false,

            setLesson: (lessonId) => {
                const { completedLessons } = get();
                const lesson = beginnerLessons.find(l => l.id === lessonId);

                if (lesson) {
                    // Check if lesson is unlocked (all prerequisites met)
                    const isLocked = lesson.prerequisites.some(p => !completedLessons.includes(p));
                    if (isLocked && lesson.id !== beginnerLessons[0].id) {
                        return; // Block setting locked lesson
                    }

                    set({
                        currentLessonId: lessonId,
                        code: lesson.components.codeTemplate
                    });
                }
            },

            completeLesson: (lessonId, metrics) => {
                const { completedLessons } = get();
                if (!completedLessons.includes(lessonId)) {
                    set({ completedLessons: [...completedLessons, lessonId] });
                }
                // Save metrics? For MVP just store last run
                set({ metrics });
            },

            setCode: (code) => set({ code }),

            setMode: (mode) => set({ mode }),

            setRunning: (running) => set({ isRunning: running }),

            updateMetrics: (newMetrics) => set((state) => ({
                metrics: { ...state.metrics, ...newMetrics }
            })),

            unlockNextLesson: () => {
                // Logic to unlock happens via checking completedLessons in UI
                // But we could also pre-calc unlocked state
            }
        }),
        {
            name: 'drone-platform-storage', // unique name
        }
    )
);

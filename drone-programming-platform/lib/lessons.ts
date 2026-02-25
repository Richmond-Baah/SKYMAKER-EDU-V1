/**
 * SkyMakers Lesson Definitions
 * Phase 1 MVP — 10 Beginner Missions
 *
 * Each lesson teaches a progressive drone programming concept.
 * Success criteria are evaluated against simulation peak metrics.
 */

export type LessonTier = 'beginner' | 'intermediate' | 'advanced';

export interface LessonHint {
    trigger: string;
    message: string;
}

export interface SuccessCriteria {
    positionAccuracy?: number;   // meters — final distance from origin
    minAttempts?: number;
    timeLimit?: number;          // seconds
    hoverStability?: number;
    altitude?: number;           // peak altitude (meters)
    landed?: boolean;
    distance?: number;           // peak XZ distance from origin
}

export interface Lesson {
    id: string;
    title: string;
    tier: LessonTier;
    prerequisites: string[];
    locked: boolean;
    components: {
        theory: string;
        codeTemplate: string;
        successCriteria: SuccessCriteria;
        hints: LessonHint[];
        challenge: {
            description: string;
            successCriteria: SuccessCriteria;
        };
        /** Learning points shown on mission completion */
        learningPoints: string[];
    };
}

export const beginnerLessons: Lesson[] = [
    /* ── Mission 1: First Flight ─────────────────────────────── */
    {
        id: 'takeoff-101',
        title: 'First Flight',
        tier: 'beginner',
        prerequisites: [],
        locked: false,
        components: {
            theory:
                'Every great flight begins with a takeoff. In drone programming we issue drone.takeoff() to spin the motors and lift the craft to a safe hover altitude (1 meter by default). Always remember to land when you are done!',
            codeTemplate: `# Welcome, Pilot!
# Mission 1: First Flight
# Objective — Take off and land safely.

drone.takeoff()
drone.land()`,
            successCriteria: {
                altitude: 1.0,
                landed: true,
            },
            hints: [
                { trigger: 'no_takeoff', message: 'The drone needs to take off first! Try: drone.takeoff()' },
                { trigger: 'no_landing', message: "Don't forget to land! Add drone.land() at the end." },
            ],
            challenge: {
                description: 'Take off to 2 meters, hover for 3 seconds, then land.',
                successCriteria: { altitude: 2.0, landed: true },
            },
            learningPoints: [
                'drone.takeoff() lifts the drone to 1 m',
                'drone.land() brings it back to the ground',
                'Always end your script with drone.land()',
            ],
        },
    },

    /* ── Mission 2: Forward Motion ──────────────────────────── */
    {
        id: 'forward-motion',
        title: 'Forward Motion',
        tier: 'beginner',
        prerequisites: ['takeoff-101'],
        locked: true,
        components: {
            theory:
                "Now that we can take off, let's explore movement. drone.forward(distance) moves the drone towards its nose direction. drone.backward(distance) reverses it. Distances are in meters.",
            codeTemplate: `# Mission 2: Forward Motion
# Objective — Move forward 2 m and return.

drone.takeoff()
drone.forward(2)
drone.backward(2)
drone.land()`,
            successCriteria: {
                distance: 2.0,
                landed: true,
            },
            hints: [
                { trigger: 'no_takeoff', message: 'Add drone.takeoff() before movement commands.' },
            ],
            challenge: {
                description: 'Move forward 5 meters, turn 180°, fly back, and land.',
                successCriteria: { distance: 5.0, landed: true, positionAccuracy: 1.0 },
            },
            learningPoints: [
                'drone.forward(n) moves the drone n meters forward',
                'drone.backward(n) reverses direction',
                'Commands run sequentially — one after the other',
            ],
        },
    },

    /* ── Mission 3: Climb & Descend ─────────────────────────── */
    {
        id: 'climb-ext',
        title: 'Reaching the Clouds',
        tier: 'beginner',
        prerequisites: ['forward-motion'],
        locked: true,
        components: {
            theory:
                "Sometimes you need to fly over obstacles. Use drone.climb(meters) or drone.up(meters) to gain altitude and drone.descend(meters) or drone.down(meters) to lower it. Always stay aware of your current height!",
            codeTemplate: `# Mission 3: Reaching the Clouds
# Objective — Climb to 3 m, move forward, descend, and land.

drone.takeoff()
drone.climb(3)
drone.forward(2)
drone.descend(1)
drone.land()`,
            successCriteria: {
                altitude: 3.0,
                landed: true,
            },
            hints: [
                { trigger: 'alt_too_low', message: 'Try increasing the altitude with drone.climb(<meters>)' },
            ],
            challenge: {
                description: 'Climb to 5 m, move forward 3 m, and land safely.',
                successCriteria: { altitude: 5.0, distance: 3.0, landed: true },
            },
            learningPoints: [
                'drone.climb(n) increases altitude by n meters',
                'drone.descend(n) decreases altitude by n meters',
                'You can use drone.up() and drone.down() as shortcuts',
            ],
        },
    },

    /* ── Mission 4: The Square Mission ──────────────────────── */
    {
        id: 'square-dance',
        title: 'The Square Mission',
        tier: 'beginner',
        prerequisites: ['climb-ext'],
        locked: true,
        components: {
            theory:
                "Combining forward, backward, left, and right movements lets you create patterns. A square path means 4 equal sides — forward, then right (using turn), then forward again … or you can strafe! Let's fly a perfect 2 m × 2 m square.",
            codeTemplate: `# Mission 4: The Square Mission
# Objective — Fly a 2 m × 2 m square and return.

drone.takeoff()
drone.forward(2)
drone.right(2)
drone.backward(2)
drone.left(2)
drone.land()`,
            successCriteria: {
                positionAccuracy: 0.5,
                landed: true,
            },
            hints: [
                { trigger: 'out_of_bounds', message: 'Mission area is 10m × 10m — keep movements small.' },
            ],
            challenge: {
                description: 'Fly a 4 m × 4 m square and land precisely at the start.',
                successCriteria: { distance: 4.0, positionAccuracy: 0.5, landed: true },
            },
            learningPoints: [
                'drone.right(n) strafes the drone sideways',
                'drone.left(n) moves it the opposite way',
                'Symmetrical commands help you return to start',
            ],
        },
    },

    /* ── Mission 5: Precision Hover ─────────────────────────── */
    {
        id: 'precision-hover',
        title: 'Precision Hover',
        tier: 'beginner',
        prerequisites: ['square-dance'],
        locked: true,
        components: {
            theory:
                "Hovering in place is one of the most important skills for a drone pilot. Use drone.hover(ms) or drone.sleep(ms) to hold position. The argument is in milliseconds (1000 ms = 1 second).",
            codeTemplate: `# Mission 5: Precision Hover
# Objective — Hover at 2 m for 3 seconds, then land.

drone.takeoff()
drone.climb(2)
drone.hover(3000)
drone.land()`,
            successCriteria: {
                altitude: 2.0,
                landed: true,
            },
            hints: [
                { trigger: 'no_landing', message: "Don't forget to land the drone! Add drone.land() at the end." },
            ],
            challenge: {
                description: 'Hover at 3 m for 5 seconds, then land within 0.5 m of start.',
                successCriteria: { altitude: 3.0, landed: true, positionAccuracy: 0.5 },
            },
            learningPoints: [
                'drone.hover(ms) pauses flight for a specified time',
                'ms means milliseconds — 1000 ms equals 1 second',
                'Hovering gives you time to observe or wait',
            ],
        },
    },

    /* ── Mission 6: Back To Base ────────────────────────────── */
    {
        id: 'back-to-base',
        title: 'Back To Base',
        tier: 'beginner',
        prerequisites: ['precision-hover'],
        locked: true,
        components: {
            theory:
                "In real missions the drone must return to its launch position. This means exactly reversing your movement commands. If you flew 3 m forward, fly 3 m backward to return.",
            codeTemplate: `# Mission 6: Back To Base
# Objective — Fly out and return to the start position.

drone.takeoff()
drone.forward(3)
drone.backward(3)
drone.land()`,
            successCriteria: {
                distance: 3.0,
                positionAccuracy: 0.5,
                landed: true,
            },
            hints: [
                { trigger: 'missing_return', message: 'Use drone.backward() to return to start.' },
            ],
            challenge: {
                description: 'Navigate a triangle path (forward 3, right 3, then diagonal back) and land at origin.',
                successCriteria: { distance: 3.0, positionAccuracy: 1.0, landed: true },
            },
            learningPoints: [
                'Reversing your commands brings the drone home',
                'Position accuracy measures how close you land to start',
                'Plan your route so the drone ends where it began',
            ],
        },
    },

    /* ── Mission 7: Precision Landing ───────────────────────── */
    {
        id: 'precision-landing',
        title: 'Precision Landing',
        tier: 'beginner',
        prerequisites: ['back-to-base'],
        locked: true,
        components: {
            theory:
                "Landing precisely is critical. A clean landing means the drone ends within 0.5 m of its takeoff point. Careful measurement of forward/backward and left/right distances is key.",
            codeTemplate: `# Mission 7: Precision Landing
# Objective — Fly a short path and land within 0.5 m of start.

drone.takeoff()
drone.forward(1)
drone.right(1)
drone.left(1)
drone.backward(1)
drone.land()`,
            successCriteria: {
                positionAccuracy: 0.5,
                landed: true,
            },
            hints: [
                { trigger: 'drift', message: 'Try returning along the same path for best accuracy.' },
            ],
            challenge: {
                description: 'Fly a cross pattern (forward, back, left, right) and land within 0.3 m of start.',
                successCriteria: { positionAccuracy: 0.3, landed: true },
            },
            learningPoints: [
                'Precision landing = finishing within target of launch point',
                'Equal forward + backward = net zero displacement',
                'Test your code in simulation before real flight',
            ],
        },
    },

    /* ── Mission 8: Figure Eight ────────────────────────────── */
    {
        id: 'figure-eight',
        title: 'Figure Eight',
        tier: 'beginner',
        prerequisites: ['precision-landing'],
        locked: true,
        components: {
            theory:
                "Complex patterns require combining multiple move commands in a creative way. A figure-eight like path tests your ability to plan lateral and forward movements.",
            codeTemplate: `# Mission 8: Figure Eight
# Objective — Trace a figure-eight-like path.

drone.takeoff()
drone.forward(2)
drone.right(1)
drone.backward(2)
drone.left(1)
drone.forward(2)
drone.left(1)
drone.backward(2)
drone.right(1)
drone.land()`,
            successCriteria: {
                distance: 2.0,
                positionAccuracy: 1.0,
                landed: true,
            },
            hints: [
                { trigger: 'complex_path', message: 'Break the pattern into small steps and test often.' },
            ],
            challenge: {
                description: 'Create a larger figure eight using 3 m segments.',
                successCriteria: { distance: 3.0, positionAccuracy: 1.5, landed: true },
            },
            learningPoints: [
                'Complex paths combine many simple movements',
                'Planning on paper first helps avoid mistakes',
                'You can always retry if the path is wrong',
            ],
        },
    },

    /* ── Mission 9: Altitude Control ────────────────────────── */
    {
        id: 'altitude-control',
        title: 'Altitude Control',
        tier: 'beginner',
        prerequisites: ['figure-eight'],
        locked: true,
        components: {
            theory:
                "Master altitude by ascending and descending between different heights. Remember: the drone starts at 1 m after takeoff. Use climb() and descend() to change altitude smoothly.",
            codeTemplate: `# Mission 9: Altitude Control
# Objective — Practice ascending and descending.

drone.takeoff()
drone.climb(1.5)
drone.descend(1)
drone.climb(2)
drone.land()`,
            successCriteria: {
                altitude: 3.5,
                landed: true,
            },
            hints: [
                { trigger: 'alt_mismatch', message: 'Check units: distances are in meters (e.g. 1.5).' },
            ],
            challenge: {
                description: 'Climb in 3 stages (1 m each), then descend in one swift 3 m drop and land.',
                successCriteria: { altitude: 4.0, landed: true },
            },
            learningPoints: [
                'Altitude stacks — climb(1) then climb(1) = 2 m above takeoff height',
                'Decimal values work: 1.5 meters is perfectly valid',
                'Always ensure you descend enough before landing',
            ],
        },
    },

    /* ── Mission 10: Stunt Pilot ────────────────────────────── */
    {
        id: 'stunt-pilot',
        title: 'Stunt Training',
        tier: 'beginner',
        prerequisites: ['altitude-control'],
        locked: true,
        components: {
            theory:
                "Ready for some fun? The flip() command performs a pre-programmed aerobatic maneuver. Make sure you have enough altitude (at least 2 m) before attempting any stunts!",
            codeTemplate: `# Mission 10: Stunt Training
# Objective — Perform a flip and land safely.

drone.takeoff()
drone.climb(2)
drone.flip("forward")
drone.land()`,
            successCriteria: {
                altitude: 2.0,
                landed: true,
            },
            hints: [
                { trigger: 'low_altitude_flip', message: 'Climb to at least 2 m before performing a flip!' },
            ],
            challenge: {
                description: 'Perform a forward flip AND a backward flip, then land.',
                successCriteria: { altitude: 2.0, landed: true },
            },
            learningPoints: [
                'drone.flip(direction) performs an aerobatic flip',
                'Available directions: "forward", "back", "left", "right"',
                'Always ensure safe altitude before stunts!',
            ],
        },
    },
];

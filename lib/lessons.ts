
export type LessonTier = 'beginner' | 'intermediate' | 'advanced';

export interface LessonHint {
    trigger: string;
    message: string;
}

export interface SuccessCriteria {
    positionAccuracy?: number;
    minAttempts?: number;
    timeLimit?: number;
    hoverStability?: number;
    altitude?: number;
    landed?: boolean;
    distance?: number;
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
    };
}

export const beginnerLessons: Lesson[] = [
    {
        id: "takeoff-101",
        title: "Ascending the Skies",
        tier: "beginner",
        prerequisites: [],
        locked: false,
        components: {
            theory: "Every great flight begins with a takeoff. In drone programming, we must first tell the motors to spin up and lift the craft to a stable hover height.",
            codeTemplate: `# Welcome, Pilot! 
# Let's get in the air.
drone.takeoff()
drone.hover(2000) # Stay still for 2 seconds
drone.land()`,
            successCriteria: {
                altitude: 1.0,
                landed: true
            },
            hints: [],
            challenge: {
                description: "Pilot Solo: Takeoff to at least 2.0 meters, hover for 3 seconds, and land with precision.",
                successCriteria: {
                    altitude: 2.0,
                    landed: true
                }
            }
        }
    },
    {
        id: "forward-motion",
        title: "Forward March",
        tier: "beginner",
        prerequisites: ["takeoff-101"],
        locked: true,
        components: {
            theory: "Now that we can takeoff, let's move! The forward command tells the drone to tilt slightly and move toward its nose.",
            codeTemplate: `drone.takeoff()
drone.forward(2) # Move forward 2 meters
drone.back(2)    # Come back to start
drone.land()`,
            successCriteria: {
                distance: 2.0,
                landed: true
            },
            hints: [],
            challenge: {
                description: "Distance Specialist: Move forward exactly 5 meters, turn 180 degrees, and return to base.",
                successCriteria: {
                    distance: 5.0,
                    landed: true,
                    positionAccuracy: 1.0
                }
            }
        }
    },
    {
        id: "climb-ext",
        title: "Reaching the Clouds",
        tier: "beginner",
        prerequisites: ["forward-motion"],
        locked: true,
        components: {
            theory: "Sometimes you need to fly over obstacles. Use the 'climb' and 'descend' commands to change your altitude safely.",
            codeTemplate: `drone.takeoff()
drone.climb(3)   # Go up to 3 meters
drone.forward(2)
drone.descend(1) # Lower to 2 meters
drone.land()`,
            successCriteria: {
                altitude: 3.0,
                landed: true
            },
            hints: [],
            challenge: {
                description: "Sky Reach: Climb to 5.0 meters, move forward 3.0 meters, and land safely.",
                successCriteria: {
                    altitude: 5.0,
                    distance: 3.0,
                    landed: true
                }
            }
        }
    },
    {
        id: "square-dance",
        title: "The Square Mission",
        tier: "beginner",
        prerequisites: ["climb-ext"],
        locked: true,
        components: {
            theory: "Combining movements allows for complex patterns. Let's fly in a perfect square and return to home base.",
            codeTemplate: `drone.takeoff()
drone.forward(2)
drone.turn_right(90)
drone.forward(2)
drone.turn_right(90)
drone.forward(2)
drone.turn_right(90)
drone.forward(2)
drone.land()`,
            successCriteria: {
                positionAccuracy: 0.5,
                landed: true
            },
            hints: [],
            challenge: {
                description: "Perfect Pattern: Complete the square mission but with 4.0 meter sides instead of 2.0.",
                successCriteria: {
                    distance: 4.0,
                    positionAccuracy: 0.5,
                    landed: true
                }
            }
        }
    },
    {
        id: "stunt-pilot",
        title: "Stunt Training",
        tier: "beginner",
        prerequisites: ["square-dance"],
        locked: true,
        components: {
            theory: "Ready for some fun? The flip command performs a pre-programmed aerobatic maneuver. Be sure to have enough altitude!",
            codeTemplate: `drone.takeoff()
drone.climb(2)
drone.flip("forward")
drone.land()`,
            successCriteria: {
                landed: true
            },
            hints: [],
            challenge: {
                description: "Display Pilot: Perform a forward flip, then a backward flip, then land.",
                successCriteria: {
                    landed: true,
                    altitude: 2.0 // Ensure they reach height for safety
                }
            }
        }
    }
];

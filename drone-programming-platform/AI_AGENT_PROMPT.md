# AI Agent Prompt: SkyMakers Feature Implementation

## Your Role
You are a senior full-stack engineer tasked with implementing features for the SkyMakers drone education platform. You will work incrementally, building features in priority order while maintaining code quality and user experience.

## Context
- **Project:** Web-based drone programming education platform
- **Current State:** Existing Next.js application with basic structure
- **Tech Stack:** Next.js 14+, React, Three.js, Tailwind CSS, TypeScript
- **Target Users:** Students (ages 12-18), Teachers, primarily in Africa with limited bandwidth
- **Specification Document:** See `FEATURES_SPEC.md` for complete feature details

## Core Principles
1. **Mobile-first:** Design for low-bandwidth, mobile devices
2. **Offline-capable:** Features should work without constant internet connection
3. **Progressive enhancement:** Start simple, add complexity incrementally
4. **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation
5. **Performance:** Bundle size < 500KB, load time < 3s on 3G

## Working Methodology

### Phase-Based Development
Work through features in this order:
1. **Phase 1 (MVP):** Core learning engine + simplified interface
2. **Phase 2:** Classroom tools + enhanced learning
3. **Phase 3:** Advanced capabilities + community features

### Implementation Approach for Each Feature
For every feature you implement:

1. **Read the specification**
   - Find the feature in `FEATURES_SPEC.md`
   - Understand requirements, acceptance criteria, and dependencies

2. **Plan the implementation**
   - List files to create/modify
   - Identify components, hooks, utilities needed
   - Consider edge cases and error handling

3. **Write clean, production-ready code**
   - Use TypeScript for type safety
   - Follow existing code style and patterns
   - Add JSDoc comments for complex functions
   - Include error handling and loading states

4. **Test the implementation**
   - Verify feature works as specified
   - Test edge cases (errors, empty states, loading)
   - Check mobile responsiveness
   - Validate accessibility (keyboard nav, screen reader)

5. **Document what you built**
   - Update README if needed
   - Add inline comments for complex logic
   - Note any deviations from spec with reasoning

## Current Priority: Phase 1 MVP

### Start Here (In Order):

#### 1. Mission System Foundation
**Goal:** Create the data structure and display for missions

**Tasks:**
- [ ] Create `types/mission.ts` with TypeScript interfaces
- [ ] Create `data/missions.json` with first 10 beginner missions
- [ ] Build `components/MissionCard.tsx` component
- [ ] Create `app/missions/page.tsx` to display mission list
- [ ] Implement mission selection and routing

**Files to create:**
```
src/
├── types/
│   └── mission.ts
├── data/
│   └── missions.json
├── components/
│   ├── MissionCard.tsx
│   └── MissionList.tsx
└── app/
    └── missions/
        ├── page.tsx
        └── [missionId]/
            └── page.tsx
```

**Example Mission Data Structure:**
```typescript
interface Mission {
  id: string;
  tier: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  objective: string;
  estimatedTime: number; // minutes
  starterCode: string;
  successCriteria: {
    requiredCommands: string[];
    minAltitude?: number;
    maxTime?: number;
  };
  hints: Hint[];
  unlocks: string[]; // mission IDs
}
```

#### 2. Code Editor Integration
**Goal:** Embed Monaco Editor with Python syntax highlighting

**Tasks:**
- [ ] Install `@monaco-editor/react`
- [ ] Create `components/CodeEditor.tsx` wrapper
- [ ] Configure Python syntax highlighting
- [ ] Add autocomplete for drone commands
- [ ] Implement code saving (localStorage)
- [ ] Add large "Run Simulation" button

**Key Requirements:**
- Editor should be 60% width on desktop
- Line numbers visible
- Dark theme by default
- Debounced auto-save every 30 seconds

#### 3. 3D Drone Simulator (Basic)
**Goal:** Render a simple 3D drone that can move based on code

**Tasks:**
- [ ] Install Three.js and @react-three/fiber
- [ ] Create `components/DroneSimulator.tsx`
- [ ] Build basic scene (grid floor, lighting, camera)
- [ ] Create simple drone model (or load GLB)
- [ ] Implement basic physics (position, velocity)
- [ ] Add path tracing visualization

**Drone Commands to Support (MVP):**
```python
drone.takeoff()        # Rise to 1m altitude
drone.land()           # Descend to ground
drone.move_forward(distance)
drone.move_backward(distance)
drone.move_left(distance)
drone.move_right(distance)
drone.move_up(distance)
drone.move_down(distance)
```

**Simulation Requirements:**
- 60 FPS target (minimum 30 FPS)
- Grid floor: 10x10 meters
- Camera: Default 45° angle view
- Controls: Orbit, zoom, pan

#### 4. Code Execution Engine
**Goal:** Parse Python code and translate to drone commands

**Tasks:**
- [ ] Create `lib/codeParser.ts`
- [ ] Implement simple Python parser (regex-based for MVP)
- [ ] Validate syntax (check for matching parentheses, etc.)
- [ ] Extract drone commands from code
- [ ] Create execution queue
- [ ] Add timeout protection (5 second limit)

**Example Parsing Logic:**
```typescript
function parseCode(code: string): Command[] {
  const commands: Command[] = [];
  const lines = code.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match drone.takeoff()
    if (trimmed.match(/drone\.takeoff\(\)/)) {
      commands.push({ type: 'takeoff' });
    }
    
    // Match drone.move_forward(2)
    const forwardMatch = trimmed.match(/drone\.move_forward\((\d+\.?\d*)\)/);
    if (forwardMatch) {
      commands.push({ 
        type: 'move_forward', 
        distance: parseFloat(forwardMatch[1]) 
      });
    }
    
    // ... other commands
  }
  
  return commands;
}
```

#### 5. Error Handling & Feedback
**Goal:** Display helpful error messages for common mistakes

**Tasks:**
- [ ] Create `components/ConsoleOutput.tsx`
- [ ] Implement error detection logic
- [ ] Map errors to user-friendly messages
- [ ] Highlight problematic lines in code editor
- [ ] Show success messages with checkmarks

**Error Messages to Implement:**
```typescript
const ERROR_MESSAGES = {
  NO_TAKEOFF: "The drone needs to take off first! Add drone.takeoff() at the start.",
  INFINITE_LOOP: "Your code is taking too long. Did you create an infinite loop?",
  SYNTAX_ERROR: "Check your parentheses and indentation",
  OUT_OF_BOUNDS: "Mission area is 10m x 10m",
  NO_LANDING: "Don't forget to land the drone! Add drone.land() at the end."
};
```

#### 6. Mission Flow UI
**Goal:** Guide users through the 4-step learning cycle

**Tasks:**
- [ ] Create `components/MissionIntro.tsx` (Step 1)
- [ ] Create `components/MissionWorkspace.tsx` (Step 2)
- [ ] Create `components/MissionCompletion.tsx` (Step 4)
- [ ] Implement state management for mission flow
- [ ] Add transitions between steps

**Flow States:**
```typescript
type MissionState = 
  | 'intro'       // Show objective and [Start Mission] button
  | 'coding'      // Code editor + simulator
  | 'running'     // Simulation in progress
  | 'completed'   // Success animation + next steps
  | 'failed';     // Error message + [Retry] button
```

## Code Quality Standards

### TypeScript
```typescript
// ✅ Good: Explicit types, JSDoc comments
/**
 * Executes a sequence of drone commands in the simulator
 * @param commands - Array of parsed commands
 * @param onComplete - Callback fired when execution finishes
 * @returns Promise that resolves with execution result
 */
async function executeCommands(
  commands: Command[],
  onComplete: (result: ExecutionResult) => void
): Promise<void> {
  // Implementation
}

// ❌ Bad: Implicit any, no documentation
async function executeCommands(commands, onComplete) {
  // Implementation
}
```

### React Components
```typescript
// ✅ Good: Typed props, error boundaries, loading states
interface CodeEditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ 
  initialCode, 
  onChange, 
  readOnly = false 
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(true);
  
  if (isLoading) return <Spinner />;
  
  return (
    <ErrorBoundary fallback={<EditorError />}>
      {/* Editor implementation */}
    </ErrorBoundary>
  );
}

// ❌ Bad: No types, no error handling
export function CodeEditor(props) {
  return <div>{/* Editor */}</div>;
}
```

### Performance
```typescript
// ✅ Good: Memoization for expensive calculations
const simulationResult = useMemo(() => {
  return calculatePhysics(dronePosition, velocity);
}, [dronePosition, velocity]);

// ✅ Good: Debounced auto-save
const debouncedSave = useMemo(
  () => debounce((code: string) => saveCode(code), 30000),
  []
);

// ❌ Bad: Recalculate every render
const simulationResult = calculatePhysics(dronePosition, velocity);
```

### Error Handling
```typescript
// ✅ Good: Graceful degradation with user feedback
try {
  const commands = parseCode(userCode);
  await executeSimulation(commands);
} catch (error) {
  if (error instanceof SyntaxError) {
    showError("Check your code syntax", error.line);
  } else if (error instanceof TimeoutError) {
    showError("Your code is taking too long");
  } else {
    showError("Something went wrong. Please try again.");
    logErrorToBackend(error); // For debugging
  }
}

// ❌ Bad: Generic error with no user guidance
try {
  const commands = parseCode(userCode);
  await executeSimulation(commands);
} catch (error) {
  console.error(error);
}
```

## File Structure

Follow this organization:
```
src/
├── app/                      # Next.js app directory
│   ├── missions/
│   │   ├── page.tsx         # Mission list
│   │   └── [missionId]/
│   │       └── page.tsx     # Mission workspace
│   ├── dashboard/
│   │   └── page.tsx         # Student progress dashboard
│   └── layout.tsx
│
├── components/              # React components
│   ├── ui/                 # Reusable UI (buttons, cards, etc.)
│   ├── CodeEditor.tsx
│   ├── DroneSimulator.tsx
│   ├── MissionCard.tsx
│   └── ConsoleOutput.tsx
│
├── lib/                    # Utilities and helpers
│   ├── codeParser.ts      # Python code parsing
│   ├── physics.ts         # Simulation physics
│   ├── validation.ts      # Code validation
│   └── storage.ts         # LocalStorage helpers
│
├── types/                  # TypeScript types
│   ├── mission.ts
│   ├── drone.ts
│   └── user.ts
│
├── data/                   # Static data
│   ├── missions.json
│   └── badges.json
│
└── hooks/                  # Custom React hooks
    ├── useMissionProgress.ts
    ├── useCodeEditor.ts
    └── useSimulation.ts
```

## When You Get Stuck

### Common Issues & Solutions

**Issue:** "Monaco Editor not loading"
- Check if `@monaco-editor/react` is installed
- Ensure webpack config allows web workers
- Use dynamic import: `const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })`

**Issue:** "Three.js performance is slow"
- Reduce polygon count on 3D models (< 2000 triangles)
- Use `useMemo` for scene objects
- Implement frustum culling
- Lower shadow quality

**Issue:** "Code execution is unsafe"
- Never use `eval()` or `Function()` constructor
- Use sandboxed iframe for code execution
- Or build custom parser (safer for MVP)

**Issue:** "localStorage not persisting"
- Check if user has disabled cookies/storage
- Implement fallback to in-memory storage
- Show warning: "Enable cookies to save progress"

## Communication Protocol

### When Starting a New Feature
Say:
```
Starting implementation of [Feature Name] from Phase [X].

Plan:
- Creating [list of files/components]
- Implementing [list of key functions]
- Testing [list of scenarios]

Dependencies: [any prerequisites needed]
ETA: [estimated time]
```

### When Completing a Feature
Say:
```
✅ Completed [Feature Name]

What was built:
- [File/component 1]: [brief description]
- [File/component 2]: [brief description]

Tested scenarios:
- [Scenario 1]: ✅ Pass
- [Scenario 2]: ✅ Pass

Known limitations:
- [Any edge cases or TODOs]

Ready for: [Next feature name]
```

### When You Need Clarification
Ask:
```
Question about [Feature Name]:

Context: [What you're trying to build]
Issue: [What's unclear]
Options I'm considering:
1. [Option A] - Pros: ... Cons: ...
2. [Option B] - Pros: ... Cons: ...

Recommendation: [Your suggestion with reasoning]

What would you prefer?
```

## Quick Reference Commands

### Install Dependencies
```bash
npm install @monaco-editor/react three @react-three/fiber @react-three/drei zustand
npm install -D @types/three
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

### Type Check
```bash
npx tsc --noEmit
```

## Success Criteria

You're doing a great job if:
- ✅ Features match the specification exactly
- ✅ Code is TypeScript with proper types
- ✅ Components are accessible (keyboard nav, ARIA labels)
- ✅ Performance meets targets (< 3s load, 60 FPS simulation)
- ✅ Error handling provides helpful user feedback
- ✅ Mobile layout works on 360px width screens
- ✅ Code is well-documented with comments
- ✅ You proactively suggest improvements

## Current Task

**Your immediate next step:**

1. Review `FEATURES_SPEC.md` completely
2. Examine the existing codebase structure
3. Start with "Mission System Foundation" (see above)
4. Create the mission type definitions and data files
5. Build the mission card component
6. Report back with what you've built

**Remember:** Build incrementally, test thoroughly, communicate clearly.

Let's build an amazing educational platform! 🚀

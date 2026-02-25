/**
 * Code Parser — Translates user Python code to drone commands.
 *
 * This is a custom regex-based parser (recommended Option 3 from spec).
 * It supports both naming conventions:
 *   drone.move_forward(2)   —  spec-style
 *   drone.forward(2)        —  shorthand (existing codebase)
 *
 * @module lib/codeParser
 */

import type { DroneCommand, DroneCommandType } from '@/types/mission';

/* ── Error messages per spec ───────────────────────── */
export const ERROR_MESSAGES = {
    NO_TAKEOFF: 'The drone needs to take off first! Add drone.takeoff() at the start.',
    INFINITE_LOOP: 'Your code is taking too long. Did you create an infinite loop?',
    SYNTAX_ERROR: 'Check your parentheses and indentation',
    OUT_OF_BOUNDS: 'Mission area is 10m × 10m',
    NO_LANDING: "Don't forget to land the drone! Add drone.land() at the end.",
    UNKNOWN_COMMAND: (cmd: string, line: number) =>
        `Unknown command "${cmd}" on line ${line}. Open the Pilot's Manual for available commands.`,
    INVALID_FLIP: (dir: string, line: number) =>
        `Invalid flip direction "${dir}" on line ${line}. Use: 'forward', 'back', 'left', 'right'.`,
    EMPTY_CODE: 'Code buffer is empty — write some drone commands first!',
} as const;

/* ── Command alias map ─────────────────────────────── */
const COMMAND_MAP: Record<string, DroneCommandType> = {
    // Takeoff / Land
    takeoff: 'takeoff',
    take_off: 'takeoff',
    land: 'land',

    // Forward / Backward
    forward: 'move_forward',
    move_forward: 'move_forward',
    backward: 'move_backward',
    move_backward: 'move_backward',
    back: 'move_backward',

    // Left / Right
    left: 'move_left',
    move_left: 'move_left',
    right: 'move_right',
    move_right: 'move_right',

    // Up / Down
    up: 'move_up',
    move_up: 'move_up',
    climb: 'move_up',
    go_up: 'move_up',
    down: 'move_down',
    move_down: 'move_down',
    descend: 'move_down',
    go_down: 'move_down',

    // Rotation
    rotate: 'rotate_cw',
    cw: 'rotate_cw',
    turn_right: 'rotate_cw',
    rotate_right: 'rotate_cw',
    ccw: 'rotate_ccw',
    turn_left: 'rotate_ccw',
    rotate_left: 'rotate_ccw',

    // Utility
    hover: 'hover',
    wait: 'hover',
    sleep: 'hover',
    flip: 'flip',
};

/* ── Movement commands that accept a distance param ── */
const DISTANCE_COMMANDS: DroneCommandType[] = [
    'move_forward',
    'move_backward',
    'move_left',
    'move_right',
    'move_up',
    'move_down',
];

/* ── Rotation commands that accept angle param ────── */
const ROTATION_COMMANDS: DroneCommandType[] = ['rotate_cw', 'rotate_ccw'];

/* ── Hover / Sleep commands that accept duration ──── */
const DURATION_COMMANDS: DroneCommandType[] = ['hover'];

export interface ParseResult {
    commands: DroneCommand[];
    errors: ParseError[];
}

export interface ParseError {
    line: number;
    message: string;
}

/**
 * Parses user Python-like code and produces an ordered list of drone commands.
 *
 * @param code — The user's code string
 * @returns ParseResult containing commands and any errors
 */
export function parseCode(code: string): ParseResult {
    const commands: DroneCommand[] = [];
    const errors: ParseError[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const lineNum = i + 1;
        const trimmed = lines[i].trim();

        // Skip blanks, comments, and boilerplate
        if (
            trimmed === '' ||
            trimmed.startsWith('#') ||
            trimmed.startsWith('//')
        ) {
            continue;
        }

        // ── Handle print() ──
        if (trimmed.includes('print(')) {
            const match = trimmed.match(/print\((.*?)\)/);
            if (match) {
                commands.push({
                    type: 'print',
                    value: match[1].replace(/["']/g, ''),
                    line: lineNum,
                    raw: trimmed,
                });
            }
            continue;
        }

        // ── Handle drone.xxx(...) ──
        const droneMatch = trimmed.match(/drone\.(\w+)\s*\((.*?)\)/);
        if (droneMatch) {
            const rawCmd = droneMatch[1].toLowerCase();
            const argsStr = droneMatch[2].trim();

            const commandType = COMMAND_MAP[rawCmd];
            if (!commandType) {
                errors.push({
                    line: lineNum,
                    message: ERROR_MESSAGES.UNKNOWN_COMMAND(rawCmd, lineNum),
                });
                continue;
            }

            const cmd: DroneCommand = {
                type: commandType,
                line: lineNum,
                raw: trimmed,
            };

            // Parse numeric argument
            if (argsStr) {
                const numericVal = parseFloat(argsStr.replace(/["']/g, ''));
                if (!isNaN(numericVal)) {
                    if (DISTANCE_COMMANDS.includes(commandType)) {
                        cmd.distance = numericVal;
                    } else if (ROTATION_COMMANDS.includes(commandType)) {
                        cmd.angle = numericVal;
                    } else if (DURATION_COMMANDS.includes(commandType)) {
                        cmd.duration = numericVal;
                    }
                }
                // For drone.flip("forward") etc
                if (commandType === 'flip') {
                    const direction = argsStr.replace(/["']/g, '').toLowerCase();
                    const validDirections = ['forward', 'back', 'left', 'right'];
                    if (validDirections.includes(direction)) {
                        cmd.value = direction;
                    } else {
                        errors.push({
                            line: lineNum,
                            message: ERROR_MESSAGES.INVALID_FLIP(direction, lineNum),
                        });
                        continue;
                    }
                }
            }

            // Default values
            if (DISTANCE_COMMANDS.includes(commandType) && cmd.distance === undefined) {
                cmd.distance = 1;
            }
            if (ROTATION_COMMANDS.includes(commandType) && cmd.angle === undefined) {
                cmd.angle = 90;
            }
            if (DURATION_COMMANDS.includes(commandType) && cmd.duration === undefined) {
                cmd.duration = 1000;
            }

            commands.push(cmd);
            continue;
        }

        // If the line contains drone. but didn't match our pattern
        if (trimmed.includes('drone.')) {
            errors.push({
                line: lineNum,
                message: `Syntax error on line ${lineNum}: "${trimmed}" — ${ERROR_MESSAGES.SYNTAX_ERROR}`,
            });
            continue;
        }

        // Unknown line (not a comment, not empty, not a drone command, not print)
        // For MVP, we just ignore non-drone lines silently to allow basic Python like `x = 1`
    }

    return { commands, errors };
}

/**
 * Validates a parsed command sequence for semantic issues.
 * E.g. movement before takeoff, missing landing, etc.
 */
export function validateCommands(commands: DroneCommand[]): ParseError[] {
    const errors: ParseError[] = [];

    if (commands.length === 0) return errors;

    // Filter out print commands for logical validation
    const droneCommands = commands.filter((c) => c.type !== 'print');

    if (droneCommands.length === 0) return errors;

    // Check: first drone command should be takeoff
    const firstCmd = droneCommands[0];
    if (firstCmd.type !== 'takeoff') {
        errors.push({
            line: firstCmd.line,
            message: ERROR_MESSAGES.NO_TAKEOFF,
        });
    }

    // Check: movement before takeoff
    let hasTakenOff = false;
    for (const cmd of droneCommands) {
        if (cmd.type === 'takeoff') {
            hasTakenOff = true;
            continue;
        }
        if (!hasTakenOff && cmd.type !== 'land') {
            errors.push({
                line: cmd.line,
                message: ERROR_MESSAGES.NO_TAKEOFF,
            });
            break;
        }
    }

    // Warning: no landing at the end
    const lastCmd = droneCommands[droneCommands.length - 1];
    if (lastCmd.type !== 'land') {
        errors.push({
            line: lastCmd.line,
            message: ERROR_MESSAGES.NO_LANDING,
        });
    }

    return errors;
}

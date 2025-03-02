import { solvePuzzleBacktracking } from "./backtracking.js"
import { solvePuzzleDeductive } from "./deductive.js"
import { getUnpaintedCellCandidates, paintSingleCell } from "./logic.js"
import { GameLogicHandler, GameSteps } from "../widgets/game_logic_handler.js"

class Stats {
    constructor() {
        this.totalDuration = null;
        this.attempts = [];
    }

    static GenerationStats = class { // Nested class
        constructor() {
            this.seed = null;
            this.duration = null;
            this.numPaintedCells = 0;
            this.numUnpaintedCells = 0;
            this.succeeded = false;
        }
    };

    toString() {
        // Create a copy to avoid modifying the original object
        const d = {...this }; // Spread syntax for shallow copy
        return JSON.stringify(d, null, 2); // Use JSON.stringify for better formatting
    }
}

async function generatePuzzleSingleAttempt(gameLogicHandler, rng, stepsWidget) {
    const attempt = new Stats.GenerationStats();

    // Generate a valid placement for queens using solvePuzzleBacktracking
    stepsWidget.disableRecording();
    const backtrackingResult = solvePuzzleBacktracking(gameLogicHandler._puzzleGrid, stepsWidget);
    stepsWidget.enableRecording();
    if (!backtrackingResult.solved) {
        console.error("Backtracking failed to find a solution.");
        return attempt;
    }

    const solution = backtrackingResult.solution.map(coordStr => {
      const [row, col] = coordStr.split(',').map(Number);
      return [row, col];
    });

    // Assign a color to each placed queen
    for (let colorGroup = 0; colorGroup < gameLogicHandler.puzzleSize(); colorGroup++) {
        const [row, col] = solution[colorGroup];
        gameLogicHandler.assignColorGroup(row, col, colorGroup);
        stepsWidget.push({
            message: `Assigning (${row},${col}) to color group ${colorGroup}`,
            action: GameSteps.ASSIGN_COLOR_GROUP,
            args: { row, col, colorGroup }
        });
    }

    // Iteratively assign colors to each remaining cell
    while (true) {
        gameLogicHandler.clearMarkings();
        const candidates = getUnpaintedCellCandidates(gameLogicHandler);

        if (Object.keys(candidates).length === 0) {
            console.info("Painted all puzzle cells!");
            break;
        }

        const painted = paintSingleCell(gameLogicHandler, rng, candidates, attempt, stepsWidget);
        if (!painted) {
            console.info("Exhausted all possible selections to paint a cell");
            return attempt;
        }

        await new Promise(resolve => setTimeout(resolve, 0)); // Yield control to the event loop
    }

    if (gameLogicHandler.hasUnpaintedCells()) {
        throw new Error("Puzzle should not have unpainted cells at this point.");
    }

    // Make sure that the puzzle is solvable by deduction
    stepsWidget.disableRecording();
    const deductionResult = solvePuzzleDeductive(gameLogicHandler._puzzleGrid, stepsWidget);
    stepsWidget.enableRecording();

    if (!deductionResult.solved) {
        console.warn("Generated puzzle was complete but could not be solved by deduction");
        return attempt;
    }

    attempt.succeeded = true;
    return attempt;
}

export class PuzzleGenerator {
    constructor(puzzleGrid) {
        this._puzzleGrid = puzzleGrid;
    }

    async run(N, stepsWidget, seed = "colorful-n-queens", maxNumAttempts = 1) {
        console.log(this._puzzleGrid);
        const gameLogicHandler = new GameLogicHandler(this._puzzleGrid);

        const startTime = Date.now();
        gameLogicHandler.resizePuzzleGrid(N);
        stepsWidget.push({
            message: `Generating puzzle of size ${N}`,
            action: GameSteps.RESIZE_PUZZLE_GRID,
            args: { newSize: N }
        });

        const stats = new Stats();
        let numAttempts = 0;
        let attempt = null;
        while (numAttempts < maxNumAttempts) {
            numAttempts++;
            const seedHash = this.hashString(seed);
            gameLogicHandler.clearColorGroups();
            stepsWidget.push({
                message: `Starting attempt ${numAttempts} to generate a valid puzzle\n` +
                         `Seeding RNG using seed string '${seed}'\n` +
                         `(Seed string hash: ${seedHash})`,
                action: GameSteps.CLEAR_COLOR_GROUPS,
            });

            const myrng = new Math.seedrandom(seedHash.toString()); // Initialize RNG *inside* run
            const rng = {
                choice: (arrOrObj) => {
                    if (Array.isArray(arrOrObj)) {
                        const index = Math.floor(myrng() * arrOrObj.length);
                        return arrOrObj[index];
                    } else if (typeof arrOrObj === 'object' && arrOrObj !== null) {
                        const keys = Object.keys(arrOrObj);
                        const index = Math.floor(myrng() * keys.length);
                        return keys[index];
                    } else {
                        return undefined;
                    }
                }
            };

            const attemptStartTime = Date.now();
            attempt = await generatePuzzleSingleAttempt(gameLogicHandler, rng, stepsWidget);
            const attemptEndTime = Date.now();
            attempt.duration = (attemptEndTime - attemptStartTime) / 1000;
            console.info(`Attempt ${numAttempts} took ${attempt.duration} seconds`);

            attempt.seed = seed; // Store the current seed in stats
            stats.attempts.push(attempt);

            if (attempt.succeeded === false) {
                seed = Math.trunc(1E9 * myrng()).toString(); // Generate a *new* seed string for the next attempt
                console.info(`Setting seed string to '${seed}' for next attempt`);
            }
            else {
                break; // generated a valid puzzle
            }
        }

        const endTime = Date.now();
        stats.totalDuration = (endTime - startTime) / 1000; // Convert to seconds
        let resultStr = attempt.succeeded ? "Generated a valid puzzle" : "Failed to generate a valid puzzle";
        stepsWidget.push({
            message: `${resultStr} after ${numAttempts} attempts in ${stats.totalDuration} seconds.`,
            action: GameSteps.MESSAGE
        })

        return stats;
    }

    hashString(str) { // Example hash function (you can use a better one)
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash<<5)-hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    }
}

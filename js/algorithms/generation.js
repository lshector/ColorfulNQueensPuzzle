import { PuzzleGridWidget } from "../widgets/puzzle_grid_widget.js"
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
        }
    };

    toString() {
        // Create a copy to avoid modifying the original object
        const d = {...this }; // Spread syntax for shallow copy
        return JSON.stringify(d, null, 2); // Use JSON.stringify for better formatting
    }
}

async function generatePuzzleSingleAttempt(puzzle, rng, stepsWidget) {
    const attempt = new Stats.GenerationStats();

    // Generate a valid placement for queens using solvePuzzleBacktracking
    disableLogging();
    const backtrackingResult = solvePuzzleBacktracking(puzzle.N, puzzle.labels);
    if (!backtrackingResult.solved) {
        console.error("Backtracking failed to find a solution.");
        return [false, attempt];
    }
    enableLogging();

    const solution = backtrackingResult.solution.map(coordStr => {
      const [row, col] = coordStr.split(',').map(Number);
      return [row, col];
    });

    // Assign a color to each placed queen
    for (let label = 0; label < puzzle.N; label++) {
        const [row, col] = solution[label];
        puzzle.labels[row][col] = label;
        if (stepsWidget) {
            stepsWidget.push({ action: "paintCell", row, col, label });
        }
    }

    // Iteratively assign colors to each remaining cell
    while (true) {
        puzzle.clearState();
        const candidates = getUnpaintedCellCandidates(puzzle);

        if (Object.keys(candidates).length === 0) {
            console.log(puzzle.labels)
            console.info("Painted all puzzle cells!");
            break;
        }

        const painted = await paintSingleCell(puzzle, rng, candidates, attempt, stepsWidget);
        if (!painted) {
            console.info("Exhausted all possible selections to paint a cell");
            return [false, attempt];
        }
    }

    if (puzzle.hasUnpaintedCells()) {
        throw new Error("Puzzle should not have unpainted cells at this point.");
    }

    // Make sure that the puzzle is solvable by deduction
    disableLogging();
    const deductionResult = solvePuzzleDeductive(puzzle);
    enableLogging();

    if (!deductionResult.solved) {
        console.warn("Generated puzzle was complete but could not be solved by deduction");
        return [false, attempt];
    }

    return [true, attempt];
}

export class PuzzleGenerator {
    constructor(puzzleGrid) {
        this._puzzleGrid = puzzleGrid;
    }

    run(N, stepsWidget, seed = "colorful-n-queens", maxNumAttempts = 1) {
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
        let generatedPuzzle = false;
        let attempt = null;
        let puzzle = null;

        if (stepsWidget) {
            stepsWidget.push({ action: "Begin Generation" });
        }
        while ((generatedPuzzle === false) && numAttempts < maxNumAttempts) {
            console.info(`Seeding RNG using seed string '${seed}'`); // Log the current seed
            const seedHash = this.hashString(seed);
            console.debug(`Seed string hash: ${seedHash}`);

            if (stepsWidget) {
                stepsWidget.push({ action: "clearLabels" });
            }

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

            numAttempts++;
            console.info(`>>>>> Starting attempt ${numAttempts} to generate a valid puzzle`);
            const attemptStartTime = Date.now();
            puzzle = new PuzzleGridWidget(N);
            [generatedPuzzle, attempt] = generatePuzzleSingleAttempt(puzzle, rng, stepsWidget);
            const attemptEndTime = Date.now();
            attempt.duration = (attemptEndTime - attemptStartTime) / 1000;
            console.info(`Attempt ${numAttempts} took ${attempt.duration} seconds`);

            attempt.seed = seed; // Store the current seed in stats
            stats.attempts.push(attempt);

            if (generatedPuzzle === false) {
                seed = myrng().toString(); // Generate a *new* seed string for the next attempt
                console.debug(`Setting seed string to '${seed}' for next run`);
            }
        }

        if (stepsWidget) {
            stepsWidget.push({ action: "End" });
        }

        if (generatedPuzzle === false) {
            throw new Error(`Failed to generate a valid puzzle after ${maxNumAttempts} attempts.`);
        }

        console.info(`Generated a valid puzzle after ${numAttempts} attempts.`);

        const endTime = Date.now();
        stats.totalDuration = (endTime - startTime) / 1000; // Convert to seconds
        console.info(`Total puzzle generation time: ${stats.totalDuration} seconds`);

        return { puzzle: puzzle, stats: stats };
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

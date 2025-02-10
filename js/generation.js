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

async function generatePuzzleSingleAttempt(puzzle, rng, eventLog) {  // Renderer removed
    const attempt = new Stats.GenerationStats();

    // Generate a valid placement for queens using solvePuzzleBacktracking
    const backtrackingResult = solvePuzzleBacktracking(puzzle.size, puzzle.labels);
    if (!backtrackingResult.solved) {
        console.error("Backtracking failed to find a solution.");
        return [null, attempt];
    }

    const solution = backtrackingResult.solution.map(coordStr => {
      const [row, col] = coordStr.split(',').map(Number);
      return [row, col];
    });

    // Assign a color to each placed queen
    for (let i = 0; i < puzzle.size; i++) {
        const [row, col] = solution[i];
        puzzle.labels[row][col] = i;
        eventLog.push(["paint", [row, col], i]);
    }

    // Iteratively assign colors to each remaining cell
    while (true) {
        const candidates = getUnpaintedCellCandidates(new PuzzleMoveHandler(puzzle), puzzle);

        if (Object.keys(candidates).length === 0) {
            console.info("Painted all puzzle cells!");
            break;
        }

        const painted = await paintSingleCell(puzzle, rng, candidates, attempt, eventLog); // Removed renderer
        if (!painted) {
            console.info("Exhausted all possible selections to paint a cell");
            return [null, attempt];
        }
    }

    if (puzzle.hasUnpaintedCells) {
        throw new Error("Puzzle should not have unpainted cells at this point.");
    }

    // Make sure that the puzzle is solvable by deduction
    const deductionResult = solvePuzzleDeductive(puzzle);

    if (!deductionResult.solved) {
        console.warn("Generated puzzle was complete but could not be solved by deduction");
        return [null, attempt];
    }

    return [puzzle, attempt];
}

export class PuzzleGenerator {
    async run(N, seed = "colorful-n-queens", maxNumAttempts = 1000, display = null) {
        const startTime = Date.now();
        console.info(`Generating puzzle of size ${N}`);
        const eventLog = [];

        const stats = new Stats();
        let numAttempts = 0;
        let generatedPuzzle = false;

        while (!generatedPuzzle && numAttempts < maxNumAttempts) {
            console.info(`Seeding RNG using seed string '${seed}'`); // Log the current seed
            const seedHash = this.hashString(seed);
            console.debug(`Seed string hash: ${seedHash}`);

            const myrng = seedrandom(seedHash.toString()); // Initialize RNG *inside* run
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

            const puzzle = Puzzle.emptyPuzzle(N);
            const renderer = display === null ? null : new PuzzleRenderer(puzzle, display);

            numAttempts++;
            console.info(`>>>>> Starting attempt ${numAttempts} to generate a valid puzzle`);
            const attemptStartTime = Date.now();
            [generatedPuzzle, attempt] = await generatePuzzleSingleAttempt(puzzle, rng, renderer, eventLog);
            const attemptEndTime = Date.now();
            attempt.duration = (attemptEndTime - attemptStartTime) / 1000;
            console.info(`Attempt ${numAttempts} took ${attempt.duration} seconds`);

            attempt.seed = seed; // Store the current seed in stats
            stats.attempts.push(attempt);

            if (!generatedPuzzle) {
                seed = myrng().toString(); // Generate a *new* seed string for the next attempt
                console.debug(`Setting seed string to '${seed}' for next run`);
            }
        }

        if (!generatedPuzzle) {
            throw new Error(`Failed to generate a valid puzzle after ${maxNumAttempts} attempts.`);
        }

        console.info(`Generated a valid puzzle after ${numAttempts} attempts.`);

        const endTime = Date.now();
        stats.totalDuration = (endTime - startTime) / 1000; // Convert to seconds
        console.info(`Total puzzle generation time: ${stats.totalDuration} seconds`);

        return [puzzle, stats, eventLog];
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

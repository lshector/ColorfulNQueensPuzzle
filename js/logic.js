import { STATE_EMPTY, STATE_QUEEN } from "./puzzle.js"

export function isSafe(N, state, labels, row, col) {
    // Check column conflicts
    for (let j = 0; j < N; j++) {
        if (j !== col && state[row][j] === STATE_QUEEN) return false;
    }

    // Check row conflicts
    for (let i = 0; i < N; i++) {
        if (i !== row && state[i][col] === STATE_QUEEN) return false;
    }

    // Check diagonal conflicts
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && state[nr][nc] === STATE_QUEEN) return false;
    }

    // Check color conflicts
    const color = labels[row][col];
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if ((i !== row || j !== col) && state[i][j] === STATE_QUEEN && labels[i][j] === color) {
                return false;
            }
        }
    }

    return true;
}

export function getAffectedCellsFromPlacingQueenAt(N, labels, row, col) {
    const affectedCells = new Set();

    // Check column conflicts
    for (let j = 0; j < N; j++) {
        if (j !== col) {
            affectedCells.add(`${row},${j}`);
        }
    }

    // Check row conflicts
    for (let i = 0; i < N; i++) {
        if (i !== row) {
            affectedCells.add(`${i},${col}`);
        }
    }

    // Check diagonal conflicts
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        let nr = row + dr;
        let nc = col + dc;
        
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
            affectedCells.add(`${nr},${nc}`)
        }
    }

    // Check color conflicts
    const color = labels[row][col];
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if ((i !== row || j !== col) && labels[i][j] === color) {
                affectedCells.add(`${i},${j}`);
            }
        }
    }

    return affectedCells;
}

export function recalculateConflictingCells(N, state, labels, conflictingCells) {
    if (conflictingCells.size === 0) return conflictingCells;

    const newConflictingCells = new Set();
    for (const cellStr of conflictingCells) {
        const [r, c] = cellStr.split(",").map(Number);

        let inConflict = false;

        const affectedCells = getAffectedCellsFromPlacingQueenAt(N, labels, r, c);
        for (const affectedCell of affectedCells) {
            const [ar, ac] = affectedCell.split(",").map(Number);
            if (state[ar][ac] === STATE_QUEEN) {
                inConflict = true;
                break;
            }
        }

        if (!inConflict) {
            const color = labels[r][c];
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    if ((i !== r || j !== c) && state[i][j] === STATE_QUEEN && labels[i][j] === color) {
                        inConflict = true;
                        break;
                    }
                }
                if (inConflict) break;
            }
        }

        if (inConflict) {
            newConflictingCells.add(cellStr);
        }
    }

    return newConflictingCells;
}

function getUnpaintedCellCandidates(puzzle) {
    const paintedCellsPerColor = puzzle.getEmptyCellsPerColor();
    const unpaintedCellCandidates = {};

    for (let i = 0; i < paintedCellsPerColor.length; i++) {
        const paintedCells = paintedCellsPerColor[i];
        const candidates = new Set(); // Use a Set to avoid duplicates

        for (const cell of paintedCells) {
            const [row, col] = cell; // Destructure the cell tuple

            if (row > 0 && puzzle.labels[row - 1][col] === -1) {
                candidates.add([row - 1, col]);
            }

            if (row < puzzle.size - 1 && puzzle.labels[row + 1][col] === -1) {
                candidates.add([row + 1, col]);
            }

            if (col > 0 && puzzle.labels[row][col - 1] === -1) {
                candidates.add([row, col - 1]);
            }

            if (col < puzzle.size - 1 && puzzle.labels[row][col + 1] === -1) {
                candidates.add([row, col + 1]);
            }
        }

        if (candidates.size > 0) {
            unpaintedCellCandidates[i] = Array.from(candidates); // Convert Set to Array for easier use later.
        }
    }

    return unpaintedCellCandidates;
}

function paintSingleCell(puzzle, rng, candidates, renderer, attempt, eventLog) {
    while (Object.keys(candidates).length > 0) { // Check if candidates is empty
        console.debug(`There are ${Object.keys(candidates).length} possible selections`);
        console.debug(`Possible selections:\n${JSON.stringify(candidates, null, 2)}`); // Use JSON.stringify for better formatting

        // Random Selection
        const colorPick = rng.choice(Object.keys(candidates)); // Get a random key (color)
        const cellPick = rng.choice(candidates[colorPick].length); // Get random index in the color's candidates array

        // Fill the selected cell with the selected color
        const [row, col] = candidates[colorPick][cellPick];
        puzzle.labels[row][col] = parseInt(colorPick); // colorPick is a string, parse to int
        console.debug(
            `Random selection: Color ${colorPick}, ` +
            `Candidate #${cellPick}, Cell [${row}, ${col}]`
        );

        // Display algorithm step
        attempt.numPaintedCells++;
        eventLog.push(["paint", [row, col], parseInt(colorPick)]); // Use array for event log
        if (renderer) {
            renderer.updatePuzzle(puzzle);
            renderer.display({ waitTimeMs: DisplayTimesInMs.ALG_STEP }); // Use object for display options
        }

        // Try to solve the puzzle using the deductive solver
        console.disable(); // Replace logging.disable()
        const solver = new DeductiveSolver({ earlyReturnCell: [row, col] }); // Assuming DeductiveSolver is a class
        const solutions = solver.solve(new PuzzleMoveHandler(puzzle));
        console.enable(); // Replace logging.disable(logging.NOTSET) - if such a method exists

        if (solutions.length > 0) {
            return true; // Successfully painted the cell
        }

        console.debug("Couldn't solve puzzle using deduction. Backtracking");
        puzzle.labels[row][col] = -1;

        // Remove candidate from list
        candidates[colorPick].splice(cellPick, 1); // Remove the cell from the array
        if (candidates[colorPick].length === 0) {
            delete candidates[colorPick]; // Remove the color if no candidates left
        }

        // Display algorithm step
        attempt.numUnpaintedCells++;
        eventLog.push(["unpaint", [row, col]]);
        if (renderer) {
            renderer.updatePuzzle(puzzle);
            renderer.display({ waitTimeMs: DisplayTimesInMs.ALG_STEP });
        }
    }

    return false; // Failed to paint the cell
}
import { solvePuzzleDeductive } from "./deductive.js";
import { COLOR_GROUP_NONE, MARKING_NONE, MARKING_QUEEN } from "../widgets/puzzle_grid_state.js"
import { GameSteps } from "../widgets/game_logic_handler.js";

export function isSafe(puzzleGrid, row, col) {
    const N = puzzleGrid.size();

    // Check column conflicts
    for (let j = 0; j < N; j++) {
        if (j !== col && puzzleGrid.getMarkingAt(row, j) === MARKING_QUEEN) return false;
    }

    // Check row conflicts
    for (let i = 0; i < N; i++) {
        if (i !== row && puzzleGrid.getMarkingAt(i, col) === MARKING_QUEEN) return false;
    }

    // Check diagonal conflicts
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const nr = row + dr;
        const nc = col + dc;
        const isInbounds = nr >= 0 && nr < N && nc >= 0 && nc < N;
        if (isInbounds && puzzleGrid.getMarkingAt(nr, nc) === MARKING_QUEEN) {
            return false;
        }
    }

    // Check color conflicts
    const color = puzzleGrid.getColorGroupAt(row, col);
    if (color !== -1) {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if ((i !== row || j !== col) &&
                    puzzleGrid.getMarkingAt(i, j) === MARKING_QUEEN &&
                    puzzleGrid.getColorGroupAt(i, j) === color) {
                    return false;
                }
            }
        }
    }

    return true;
}

export function getAffectedCellsFromPlacingQueenAt(puzzleGrid, row, col) {
    const affectedCells = new Set();
    const N = puzzleGrid.size();

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
    const color = puzzleGrid.getColorGroupAt(row, col);
    if (color !== COLOR_GROUP_NONE) {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if ((i !== row || j !== col) && puzzleGrid.getColorGroupAt(i, j) === color) {
                    affectedCells.add(`${i},${j}`);
                }
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
            if (state[ar][ac] === MARKING_QUEEN) {
                inConflict = true;
                break;
            }
        }

        if (!inConflict) {
            const color = labels[r][c];
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    if ((i !== r || j !== c) && state[i][j] === MARKING_QUEEN && labels[i][j] === color) {
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

export function getUnpaintedCellCandidates(gameLogicHandler) {
    const puzzleGrid = gameLogicHandler._puzzleGrid;
    const N = puzzleGrid.size();

    const unpaintedCellCandidates = new Set();
    const paintedCellsPerColor = gameLogicHandler.getEmptyCellsPerColor();

    for (let i = 0; i < N; i++) {
        const paintedCells = paintedCellsPerColor[i];
        const candidates = new Set(); // Use a Set to avoid duplicates

        for (const cell of paintedCells) {
            const [row, col] = cell; // Destructure the cell tuple

            if (row > 0 && puzzleGrid.getColorGroupAt(row - 1, col) === COLOR_GROUP_NONE) {
                candidates.add(`${row - 1},${col}`);
            }

            if (row < N - 1 && puzzleGrid.getColorGroupAt(row + 1, col) === COLOR_GROUP_NONE) {
                candidates.add(`${row + 1},${col}`);
            }

            if (col > 0 && puzzleGrid.getColorGroupAt(row, col - 1) === -1) {
                candidates.add(`${row},${col - 1}`);
            }

            if (col < N - 1 && puzzleGrid.getColorGroupAt(row, col + 1) === COLOR_GROUP_NONE) {
                candidates.add(`${row},${col + 1}`);
            }
        }

        if (candidates.size > 0) {
            unpaintedCellCandidates[i] = Array.from(candidates); // Convert Set to Array for easier use later.
        }
    }

    return unpaintedCellCandidates;
}

export function paintSingleCell(gameLogicHandler, rng, candidates, attempt, stepsWidget) {
    const puzzleGrid = gameLogicHandler._puzzleGrid;
    const N = puzzleGrid.size();

    while (Object.keys(candidates).length > 0) { // Check if candidates is empty
        let numCandidates = Object.keys(candidates).length;

        console.debug(`There are ${numCandidates} possible selections`);
        console.debug(`Possible selections:\n${JSON.stringify(candidates, null, 2)}`); // Use JSON.stringify for better formatting

        const colorPick = rng.choice(Object.keys(candidates)); // Get a random key (color)
        const candidateCells = candidates[colorPick]; // Get the array of candidate cells for that color
        const cellPick = rng.choice(candidateCells); // Choose a random cell *from the array*

        // Fill the selected cell with the selected color
        const [row, col] = cellPick.split(',').map(Number);
        const colorGroup = parseInt(colorPick); // colorPick is a string, parse to int
        puzzleGrid.setColorGroupAt(row, col, colorGroup);

        // Display algorithm step
        attempt.numPaintedCells++;
        stepsWidget.push({
            message: `Assigning (${row},${col}) to color group ${colorGroup}\n` +
                     `Random selection: Color ${colorPick},\n` +
                     `Candidate #${cellPick}, Cell [${row}, ${col}]`,
            action: GameSteps.ASSIGN_COLOR_GROUP,
            args: { row, col, colorGroup }
        });

        // Try to solve the puzzle using the deductive solver
        stepsWidget.disableRecording();
        puzzleGrid.clearMarkings();
        const deductiveResult = solvePuzzleDeductive(puzzleGrid, stepsWidget);
        puzzleGrid.clearMarkings();
        stepsWidget.enableRecording();

        if (deductiveResult.solved) {
            return true; // successfully painted the cell
        }

        // puzzle was not solvable -- need to undo the step
        attempt.numUnpaintedCells++;
        puzzleGrid.setColorGroupAt(row, col, COLOR_GROUP_NONE);
        stepsWidget.push({
            message: `Couldn't solve puzzle using deduction.\n` +
                     `Backtracking by removing color group assignment from (${row},${col})`,
                     action: GameSteps.ASSIGN_COLOR_GROUP,
            args: { row, col, colorGroup: COLOR_GROUP_NONE }
        });

        // Remove candidate from list
        candidates[colorPick].splice(cellPick, 1); // Remove the cell from the array
        if (candidates[colorPick].length === 0) {
            delete candidates[colorPick]; // Remove the color if no candidates left
        }
    }

    return false; // Failed to paint the cell
}
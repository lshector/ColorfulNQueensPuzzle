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
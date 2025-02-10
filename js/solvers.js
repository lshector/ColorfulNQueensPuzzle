import {STATE_EMPTY, STATE_QUEEN} from "./puzzle.js"

export function isSafe(N, state, labels, row, col) {
    // Check row, column, and diagonal conflicts
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    for (let j = 0; j < N; j++) {
        if (j !== col && state[row][j] === STATE_QUEEN) return false;
    }
    for (let i = 0; i < N; i++) {
        if (i !== row && state[i][col] === STATE_QUEEN) return false;
    }
    for (const [dr, dc] of directions) {
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

export function solvePuzzleBacktracking(N, labels) {
    function solveBacktrackingRecursive(state, row) {
        if (row === N) {
            const solution = [];
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    if (state[i][j] === STATE_QUEEN) {
                        solution.push(`${i},${j}`);
                    }
                }
            }
            return solution; // Return the solution array
        }

        for (let col = 0; col < N; col++) {
            if (isSafe(N, state, labels, row, col)) {
                state[row][col] = STATE_QUEEN;
                const recursiveSolution = solveBacktrackingRecursive(state, row + 1);
                if (recursiveSolution) {
                    return recursiveSolution; // Solution found!
                } else {
                    state[row][col] = STATE_EMPTY;
                }
            }
        }

        return null; // No safe position found in this row
    }

    // Initialize the state (empty board)
    const state = Array(N).fill(null).map(() => Array(N).fill(0)); // STATE_EMPTY is 0
    const solution = solveBacktrackingRecursive(state, 0);

    if (solution) {
        return { solution: solution, solved: true };
    } else {
        return { solution: null, solved: false };
    }
}

export function solvePuzzleDeductive(puzzle) {
    console.log("Solving puzzle using deduction...");
}
import { STATE_EMPTY, STATE_QUEEN } from "./puzzle.js"
import { isSafe } from "./logic.js";

export function solvePuzzleBacktracking(N, labels) {
    const steps = [];
    steps.push({ action: "Begin" });

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
            return solution;
        }

        for (let col = 0; col < N; col++) {
            if (isSafe(N, state, labels, row, col)) {
                state[row][col] = STATE_QUEEN;
                steps.push({ action: "Place Queen", row, col });

                const recursiveSolution = solveBacktrackingRecursive(state, row + 1);
                if (recursiveSolution) {
                    return recursiveSolution;
                } else {
                    state[row][col] = STATE_EMPTY;
                    steps.push({ action: "Backtrack", row, col });
                }
            }
        }

        return null;
    }

    const state = Array(N).fill(null).map(() => Array(N).fill(0));
    const solution = solveBacktrackingRecursive(state, 0);

    if (solution) {
        return { solution, solved: true, steps };
    } else {
        return { solution: null, solved: false, steps };
    }
}

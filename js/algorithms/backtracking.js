import { MARKING_NONE, MARKING_QUEEN } from "../widgets/puzzle_grid_state.js"

export function solvePuzzleBacktracking(puzzleGrid, stepsWidget) {
    const N = puzzleGrid.size();

    function solveBacktrackingRecursive(state, row) {
        if (row === N) {
            const solution = [];
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    if (puzzleGrid.getMarkingAt(i, j) === MARKING_QUEEN) {
                        solution.push(`${i},${j}`);
                    }
                }
            }
            return solution;
        }

        for (let col = 0; col < N; col++) {
            if (puzzleGrid.isSafe(row, col)) {
                puzzleGrid.setMarkingAt(row, col, MARKING_QUEEN);
                if (stepsWidget) {
                    stepsWidget.push({ action: "Place Queen", row, col });
                }

                const recursiveSolution = solveBacktrackingRecursive(state, row + 1);
                if (recursiveSolution) {
                    return recursiveSolution;
                } else {
                    puzzleGrid.setMarkingAt(row, col, MARKING_NONE);
                    if (stepsWidget) {
                        stepsWidget.push({ action: "Backtrack", row, col });
                    }
                }
            }
        }

        return null;
    }

    if (stepsWidget) {
        stepsWidget.push({ action: "Begin Solver" });
    }
    const state = Array(N).fill(null).map(() => Array(N).fill(0));
    const solution = solveBacktrackingRecursive(state, 0);
    if (stepsWidget) {
        stepsWidget.push({ action: "Done" });
    }

    if (solution) {
        return { solution, solved: true };
    } else {
        return { solution: null, solved: false };
    }
}

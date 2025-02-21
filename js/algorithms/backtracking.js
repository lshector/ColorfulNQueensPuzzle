import { isSafe } from "./logic.js";
import { MARKING_NONE, MARKING_QUEEN } from "../widgets/puzzle_grid_state.js"

function generateBacktrackingMovesByRow(puzzleGrid, placedQueens) {
    const row = placedQueens.size;
    if (row >= puzzleGrid.size()) {
        return [];
    }

    const candidateMoves = [];
    for (let col = 0; col < puzzleGrid.size(); col++) {
        if (isSafe(puzzleGrid, row, col)) {
            candidateMoves.push([ row, col ]);
        }
    }

    return candidateMoves;
}

function generateBacktrackingMovesByCol(puzzleGrid, placedQueens) {
    const col = placedQueens.size;
    if (col >= puzzleGrid.size()) {
        return [];
    }

    const candidateMoves = [];
    for (let row = 0; row < puzzleGrid.size(); row++) {
        if (isSafe(puzzleGrid, row, col)) {
            candidateMoves.push([ row, col ]);
        }
    }

    return candidateMoves;
}

export function solvePuzzleBacktracking(puzzleGrid, stepsWidget, moveRankMethod = 'row') {
    const placedQueens = new Set();
    const N = puzzleGrid.size();

    const generateMoves = moveRankMethod === 'row' ?
        generateBacktrackingMovesByRow : generateBacktrackingMovesByCol;

    function solveBacktrackingRecursive(state, row) {
        if (placedQueens.size === N) {
            console.log("Found a solution!");
            return [...placedQueens];
        }

        console.log(`Backtracking level: ${placedQueens.size}`);
        const candidateMoves = generateMoves(puzzleGrid, placedQueens);
        let candidateMovesStr = ""
        for (let i = 0; i < candidateMoves.length; i++) {
            const [row, col] = candidateMoves[i];
            candidateMovesStr = `${candidateMovesStr}[${row}, ${col}] `
        }
        console.log(`Candidate moves: ${candidateMovesStr}`);

        for (let i = 0; i < candidateMoves.length; i++) {
            const [row, col] = candidateMoves[i];

            console.log(`Placing queen at: ${row}, ${col}`);
            puzzleGrid.setMarkingAt(row, col, MARKING_QUEEN);
            if (stepsWidget) {
                stepsWidget.push({ action: "Place Queen", row, col });
            }
            placedQueens.add(`${row},${col}`);

            const recursiveSolution = solveBacktrackingRecursive(state, row + 1);
            if (recursiveSolution) {
                return recursiveSolution;
            }

            console.log(`Removing queen from: ${row}, ${col}`);
            puzzleGrid.setMarkingAt(row, col, MARKING_NONE);
            if (stepsWidget) {
                stepsWidget.push({ action: "Backtrack", row, col });
            }
            placedQueens.delete(`${row},${col}`);
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

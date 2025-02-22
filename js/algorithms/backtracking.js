import { GameStepHandler } from "../widgets/game_step_handler.js";

function _formatCandidateMovesStr(candidateMoves) {
    let candidateMovesStr = ""
    for (let i = 0; i < candidateMoves.length; i++) {
        const [row, col] = candidateMoves[i];
        candidateMovesStr = `${candidateMovesStr}[${row}, ${col}] `
    }

    return candidateMovesStr;
}

function _generateBacktrackingMovesByRow(gameStepHandler, index) {
    const row = index;
    if (row >= gameStepHandler.puzzleSize()) {
        return [];
    }

    const candidateMoves = [];
    for (let col = 0; col < gameStepHandler.puzzleSize(); col++) {
        if (gameStepHandler.isSafe(row, col)) {
            candidateMoves.push([ row, col ]);
        }
    }

    return candidateMoves;
}

function _generateBacktrackingMovesByCol(gameStepHandler, index) {
    const col = index;
    if (col >= gameStepHandler.puzzleSize()) {
        return [];
    }

    const candidateMoves = [];
    for (let row = 0; row < gameStepHandler.puzzleSize(); row++) {
        if (gameStepHandler.isSafe(row, col)) {
            candidateMoves.push([ row, col ]);
        }
    }

    return candidateMoves;
}

function _generateBacktrackingMoves(gameStepHandler, method) {
    const index = gameStepHandler.numPlacedQueens();
    return {
        row        : _generateBacktrackingMovesByRow,
        column     : _generateBacktrackingMovesByCol
    }[method](gameStepHandler, index);
}

export function solvePuzzleBacktracking(puzzleGrid, stepsWidget, moveRankMethod = 'row') {
    const gameStepHandler = new GameStepHandler(puzzleGrid);
    stepsWidget.push({
        action: 'message',
        message: "Starting backtracking solver"
    });

    function solveBacktrackingRecursive() {
        const candidateMoves = _generateBacktrackingMoves(gameStepHandler, moveRankMethod);
        const candidateMovesStr = _formatCandidateMovesStr(candidateMoves);
        const level = gameStepHandler.numPlacedQueens();

        if (candidateMoves.length > 0) {
            stepsWidget.push({
                message: `Candidate moves at backtracking level ${level}: ${candidateMovesStr}`,
                action: 'highlightCells',
                args: { cells: candidateMoves }
            });
        }
        else {
            stepsWidget.push({
                message: `No candidate moves at backtracking level ${level}`,
                action: 'message'
            })
        }

        for (let i = 0; i < candidateMoves.length; i++) {
            const [row, col] = candidateMoves[i];
            stepsWidget.push({
                message: `Placing queen at: ${row}, ${col}`,
                action: "placeQueen",
                args: { row, col }
            });
            gameStepHandler.placeQueen(row, col);

            if (gameStepHandler.isSolved()) {
                stepsWidget.push({
                    message: "Found a solution!",
                    action: 'highlightSolution'
                });
                return [...gameStepHandler.getPlacedQueens()];
            }

            const recursiveSolution = solveBacktrackingRecursive();
            if (recursiveSolution) {
                return recursiveSolution;
            }

            stepsWidget.push({
                message: `Removing queen from: ${row}, ${col}`,
                action: "removeQueen",
                args: { row, col }
            });
            gameStepHandler.removeQueen(row, col);
        }

        return null;
    }

    const solution = solveBacktrackingRecursive();
    if (solution) {
        return { solution, solved: true };
    } else {
        return { solution: null, solved: false };
    }
}

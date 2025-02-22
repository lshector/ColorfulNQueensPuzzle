import { GameLogicHandler } from "../widgets/game_logic_handler.js";

function _formatCandidateMovesStr(candidateMoves) {
    let candidateMovesStr = ""
    for (let i = 0; i < candidateMoves.length; i++) {
        const [row, col] = candidateMoves[i];
        candidateMovesStr = `${candidateMovesStr}[${row}, ${col}] `
    }

    return candidateMovesStr;
}

function _generateBacktrackingMovesByRow(gameLogicHandler, index) {
    const row = index;
    if (row >= gameLogicHandler.puzzleSize()) {
        return [];
    }

    const candidateMoves = [];
    for (let col = 0; col < gameLogicHandler.puzzleSize(); col++) {
        if (gameLogicHandler.isSafe(row, col)) {
            candidateMoves.push([ row, col ]);
        }
    }

    return candidateMoves;
}

function _generateBacktrackingMovesByCol(gameLogicHandler, index) {
    const col = index;
    if (col >= gameLogicHandler.puzzleSize()) {
        return [];
    }

    const candidateMoves = [];
    for (let row = 0; row < gameLogicHandler.puzzleSize(); row++) {
        if (gameLogicHandler.isSafe(row, col)) {
            candidateMoves.push([ row, col ]);
        }
    }

    return candidateMoves;
}

function _generateBacktrackingMoves(gameLogicHandler, method) {
    const index = gameLogicHandler.numPlacedQueens();
    return {
        row        : _generateBacktrackingMovesByRow,
        column     : _generateBacktrackingMovesByCol
    }[method](gameLogicHandler, index);
}

export function solvePuzzleBacktracking(puzzleGrid, stepsWidget, moveRankMethod = 'row') {
    const gameLogicHandler = new GameLogicHandler(puzzleGrid);
    stepsWidget.push({
        action: 'message',
        message: "Starting backtracking solver"
    });

    function solveBacktrackingRecursive() {
        const candidateMoves = _generateBacktrackingMoves(gameLogicHandler, moveRankMethod);
        const candidateMovesStr = _formatCandidateMovesStr(candidateMoves);
        const level = gameLogicHandler.numPlacedQueens();

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
            gameLogicHandler.placeQueen(row, col);

            if (gameLogicHandler.isSolved()) {
                stepsWidget.push({
                    message: "Found a solution!",
                    action: 'highlightSolution'
                });
                return [...gameLogicHandler.getPlacedQueens()];
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
            gameLogicHandler.removeQueen(row, col);
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

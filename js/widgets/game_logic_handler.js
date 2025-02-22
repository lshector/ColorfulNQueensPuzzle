import { isSafe, getAffectedCellsFromPlacingQueenAt } from "../algorithms/logic.js";
import { MARKING_NONE, MARKING_X, MARKING_QUEEN } from "./puzzle_grid_state.js"

export class GameLogicHandler {
    constructor(puzzleGrid) {
        this._puzzleGrid = puzzleGrid;
        // TODO: scan puzzle grid for actual number of placed queens
        this._placedQueens = new Set();
        this._constraintCount = Array(this.puzzleSize()).fill(null).map(() => Array(this.puzzleSize()).fill(0));
    }

    puzzleSize()  {
        return this._puzzleGrid.size();
    }

    getPlacedQueens() {
        return this._placedQueens;
    }

    numPlacedQueens() {
        return this._placedQueens.size;
    }

    isSolved() {
        return this._placedQueens.size === this._puzzleGrid.size();
    }

    placeQueen(row, col) {
        this._puzzleGrid.setMarkingAt(row, col, MARKING_QUEEN);
        this._placedQueens.add(`${row},${col}`);

        let updatedCells = new Set();
        updatedCells.add(`${row},${col}`);

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this._puzzleGrid, row, col);
        for (const affectedCell of affectedCells) {
            const [r, c] = affectedCell.split(",").map(Number);
            this._constraintCount[r][c] += 1;

            if (this._constraintCount[r][c] === 1) {
                this._puzzleGrid.setMarkingAt(r, c, MARKING_X);
                updatedCells.add(`${r},${c}`);
            }
        }

        return updatedCells;
    }

    removeQueen(row, col) {
        this._puzzleGrid.setMarkingAt(row, col, MARKING_NONE);
        this._placedQueens.delete(`${row},${col}`);

        let updatedCells = new Set();
        updatedCells.add(`${row},${col}`);

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this._puzzleGrid, row, col);
        for (const affectedCell of affectedCells) {
            const [r, c] = affectedCell.split(",").map(Number);
            this._constraintCount[r][c] -= 1;

            if (this._constraintCount[r][c] === 0) {
                this._puzzleGrid.setMarkingAt(r, c, MARKING_NONE);
                updatedCells.add(`${r},${c}`);
            }
        }

        return updatedCells;
    }

    isSafe(row, col) {
        return isSafe(this._puzzleGrid, row, col);
    }
}
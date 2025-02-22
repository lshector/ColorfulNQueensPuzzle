import { isSafe } from "../algorithms/logic.js";
import { MARKING_NONE, MARKING_QUEEN } from "./puzzle_grid_state.js"

export class GameStepHandler {
    constructor(puzzleGrid) {
        this._puzzleGrid = puzzleGrid;
        // TODO: scan puzzle grid for actual number of placed queens
        this._placedQueens = new Set();
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
    }

    removeQueen(row, col) {
        this._puzzleGrid.setMarkingAt(row, col, MARKING_NONE);
        this._placedQueens.delete(`${row},${col}`);
    }

    isSafe(row, col) {
        return isSafe(this._puzzleGrid, row, col);
    }
}
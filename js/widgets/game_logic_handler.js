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

    clearMarkings() {
        this._puzzleGrid.clearMarkings();
        this._placedQueens = new Set();
        this._constraintCount = Array(this.puzzleSize()).fill(null).map(() => Array(this.puzzleSize()).fill(0));
        for (let r = 0; r < this.puzzleSize(); ++r) {
            for (let c = 0; c < this.puzzleSize(); ++c) {
                this._constraintCount[r][c] = 0;
                this._puzzleGrid.setInfoLabelAt(r, c, 0);
            }
        }
    }

    placeQueen(row, col) {
        let updatedCells = [];

        this._puzzleGrid.setMarkingAt(row, col, MARKING_QUEEN);
        this._placedQueens.add(`${row},${col}`);
        this._constraintCount[row][col] += 1;
        this._puzzleGrid.setInfoLabelAt(row, col, this._constraintCount[row][col]);
        updatedCells.push([row, col]);

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this._puzzleGrid, row, col);
        for (const affectedCell of affectedCells) {
            const [r, c] = affectedCell.split(",").map(Number);
            this._constraintCount[r][c] += 1;
            this._puzzleGrid.setInfoLabelAt(r, c, this._constraintCount[r][c]);

            if (this._constraintCount[r][c] === 1) {
                this._puzzleGrid.setMarkingAt(r, c, MARKING_X);
                updatedCells.push([r, c]);
            }
        }

        return updatedCells;
    }

    removeQueen(row, col) {
        let updatedCells = [];

        this._puzzleGrid.setMarkingAt(row, col, MARKING_NONE);
        this._placedQueens.delete(`${row},${col}`);
        this._constraintCount[row][col] -= 1;
        this._puzzleGrid.setInfoLabelAt(row, col, this._constraintCount[row][col]);
        updatedCells.push([row, col]);

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this._puzzleGrid, row, col);
        for (const affectedCell of affectedCells) {
            const [r, c] = affectedCell.split(",").map(Number);
            this._constraintCount[r][c] -= 1;
            this._puzzleGrid.setInfoLabelAt(r, c, this._constraintCount[r][c]);

            if (this._constraintCount[r][c] === 0) {
                this._puzzleGrid.setMarkingAt(r, c, MARKING_NONE);
                updatedCells.push([r, c]);
            }
        }

        return updatedCells;
    }

    isSafe(row, col) {
        return isSafe(this._puzzleGrid, row, col);
    }

    getEmptyCells() {
        const N = this.puzzleSize();
        const emptyCells = [];

        for (let row = 0; row < N; row++) {
          for (let col = 0; col < N; col++) {
            if (this._puzzleGrid.getMarkingAt(row, col) === MARKING_NONE) {
              emptyCells.push([row, col]);
            }
          }
        }

        return emptyCells;
    }

    getEmptyCellsPerColor() {
        const emptyCells = this.getEmptyCells();
        const emptyCellsPerColor = {};

        // Initialize N empty lists
        for (let i = 0; i < this.puzzleSize(); i++) {
            emptyCellsPerColor[i] = [];
        }

        // Organize empty cells by color
        for (const cell of emptyCells) {
            const [row, col] = cell;
            const colorGroup = this._puzzleGrid.getColorGroupAt(row, col);
            emptyCellsPerColor[colorGroup].push(cell);
        }

        return emptyCellsPerColor;
      }

    highlightAllCells() {
        for (let row = 0; row < this.puzzleSize(); ++row) {
            for (let col = 0; col < this.puzzleSize(); ++col) {
                this._puzzleGrid.setHighlightAt(row, col, true);
            }
        }
    }

    highlightCells(cells) {
        for (let row = 0; row < this.puzzleSize(); ++row) {
            for (let col = 0; col < this.puzzleSize(); ++col) {
                this._puzzleGrid.setHighlightAt(row, col, false);
            }
        }

        for (const cell of cells) {
            const [row, col] = cell;
            this._puzzleGrid.setHighlightAt(row, col, true);
        }
    }
}
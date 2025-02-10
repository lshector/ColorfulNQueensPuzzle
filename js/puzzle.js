import { getAffectedCellsFromPlacingQueenAt, recalculateConflictingCells } from "./logic.js";

const gridContainer = document.getElementById('grid-container');

export const NUM_STATES = 3;
export const STATE_EMPTY = 0;
export const STATE_MARKED = 1;
export const STATE_QUEEN = 2;

export class PuzzleGrid {
    constructor(N) {
        console.log(`Initializing PuzzleGrid of size ${N}`);
        this.N = N;
        this.colorScheme = null;
        this.labels = Array(this.N).fill(null).map(() => Array(this.N).fill(0));
        this.state = Array(this.N).fill(null).map(() => Array(this.N).fill(0));
        this.clickResponse = 'none';
        this.constraintCount = Array(this.N).fill(null).map(() => Array(this.N).fill(0));
        this.conflictingCells = new Set();
        this.placedQueens = new Set();
        this.placedQueensColors = new Set();
    
        // Clear existing grid
        gridContainer.innerHTML = '';
    
        // Set grid container styles *first*
        gridContainer.style.setProperty('--grid-size', N); // Set CSS variable
        gridContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        gridContainer.style.display = 'grid';
        gridContainer.style.height = gridContainer.offsetWidth + "px"; // Makes it a square

        // Create the grid
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                // Remove explicit width and height setting. Grid takes care of this
                cell.style.boxSizing = 'border-box'; // Include border and padding in element's total width and height
    
                cell.addEventListener('click', () => {
                    if (this.clickResponse === 'setState') {
                        this.updateCellStateFromClick(i, j);
                    }
                    else if (this.clickResponse === 'setLabel') {
                        this.updateCellLabelFromClick(i, j);
                    }
                });
    
                gridContainer.appendChild(cell);
            }
        }
    
        // You might want to set the height of the grid container as well to make it a square
        gridContainer.style.height = gridContainer.offsetWidth + "px"; // Makes it a square
    
    }

    getEmptyCells() {
        const emptyCells = [];
    
        for (let row = 0; row < this.N; row++) {
          for (let col = 0; col < this.N; col++) {
            if (this.state[row][col] === STATE_EMPTY) {
              emptyCells.push([row, col]);
            }
          }
        }
    
        return emptyCells;
      }

    
    getEmptyCellsPerColor() {
        const emptyCellsPerColor = {};
        
        // Initialize N empty sets
        for (let i = 0; i < this.N; i++) {
            emptyCellsPerColor[i] = new Set();
        }

        for (let row = 0; row < this.N; row++) {
          for (let col = 0; col < this.N; col++) {
            const label = this.labels[row][col];
            const state = this.state[row][col];
    
            if (state === 0) { // Assuming 0 represents empty
              if (!emptyCellsPerColor[label]) {
                emptyCellsPerColor[label] = new Set();
              }
              emptyCellsPerColor[label].add([row, col]);
            }
          }
        }
    
        return emptyCellsPerColor;
      }
    

    setColorScheme(new_colorScheme) {
        if (new_colorScheme.length < this.N) {
            console.error(`Input color scheme has ${new_colorScheme.length} entries, need ${this.N}`)
            return
        }

        console.log(`Setting puzzle color scheme: ${new_colorScheme}`)
        this.colorScheme = new_colorScheme
    }

    setLabels(new_labels) {
        if (this.colorScheme == null) {
            console.error(`Can't set puzzle labels because no color scheme is set`)
            return;
        }

        if (new_labels.length != this.N) {
            console.error(`Size of new labels ${new_labels.length} does not match the puzzle size ${this.N}`)
        }

        console.log(`Setting labels: ${new_labels}`)
        this.labels = new_labels
        this.refreshAppearanceAllLabels()
    }

    setState(new_state) {
        this.state = new_state;
        this.refreshAppearanceAllCells();
    }

    clearLabels() {
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                this.labels[i][j] = -1
            }
        } 

        this.refreshAppearanceAllLabels()
    }

    refreshAppearanceAllLabels() {
        // Update puzzle appearance
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const cell = gridContainer.children[i * this.N + j];
                const currentLabel = this.labels[i][j];
                const cellKey = `${i},${j}`; // Key for conflictingCells Set

                // Color assignment
                const label = this.labels[i][j];
                if (label >= 0 && label < this.colorScheme.length) { // Check bounds
                    let baseColor = this.colorScheme[label];
                    if (this.conflictingCells.has(cellKey)) {
                        cell.style.color = '#8B0000'; // Conflicting cell text red
                    } else if (this.conflictingCells.size > 0){
                        baseColor = this.darkenColor(baseColor, 0.5); // Darken by 50%
                        cell.style.color = 'black'; //Reset color to black
                    } else {
                        cell.style.color = 'black'; //Reset color to black
                    }
                    cell.style.backgroundColor = baseColor;
                } else {
                    cell.style.backgroundColor = 'white';
                    cell.style.color = 'black'; //Reset color to black
                }

                // Set default border
                cell.style.border = '2px solid black';

                // Check right neighbor to set border
                if (j < this.N - 1) {
                    const rightNeighborLabel = this.labels[i][j + 1];
                    if (currentLabel === rightNeighborLabel) {
                        cell.style.borderRightWidth = '0px';
                    }
                }

                // Check bottom neighbor to set border
                if (i < this.N - 1) {
                    const bottomNeighborLabel = this.labels[i + 1][j];
                    if (currentLabel === bottomNeighborLabel) {
                        cell.style.borderBottomWidth = '0px';
                    }
                }
            }
        }
    }

    // Helper function to darken a color (adjust as needed)
    darkenColor(hex, factor) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);

        r = Math.round(r * (1 - factor));
        g = Math.round(g * (1 - factor));
        b = Math.round(b * (1 - factor));

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    
    refreshAppearanceAllCells() {
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                this.refreshAppearanceCellState(i, j);
            }
        }
    }

    refreshAppearanceCellState(row, col) {
        const cell = gridContainer.children[row * this.N + col];
        cell.innerHTML = "";
    
        if (this.state[row][col] === STATE_MARKED) {
            cell.textContent = 'x';
        } else if (this.state[row][col] === STATE_QUEEN) {
            cell.textContent = '♛';
        }
    }
    
    updateState(stepIndex, steps) {
        // 1. Reconstruct the board state up to the given stepIndex
        const state = Array(this.N).fill(null).map(() => Array(this.N).fill(0)); // Start with empty board

        for (let i = 0; i <= stepIndex; i++) {
            const step = steps[i];
            if (step.action === "Place Queen") {
                state[step.row][step.col] = STATE_QUEEN;
            } else if (step.action === "Backtrack") {
                state[step.row][step.col] = STATE_EMPTY;
            }
        }

        // 2. Update the visual representation of the puzzle
        this.state = state;
        this.refreshAppearanceAllCells();
    }

    updateCellStateFromClick(row, col) {
        if (this.conflictingCells.size > 0) {
            // return early if the cell is not one of the highlighted cells
            if (!this.conflictingCells.has(`${row},${col}`)) {
                return;
            }
        }

        if (this.placedQueens.size >= this.N) {
            if (!this.placedQueens.has(`${row},${col}`)) {
                return;
            }
        }

        const newState = (this.state[row][col] + 1) % NUM_STATES;
        
        this.state[row][col] = newState
        this.refreshAppearanceCellState(row, col);

        if (newState === STATE_QUEEN) {
            this.placeQueenFromClick(row, col);
        }
        else if (newState === STATE_EMPTY) {
            this.removeQueenFromClick(row, col);
        }
        
        this.refreshAppearanceAllLabels();
        this.checkIfSolved(); // Call the solution check function
    }

    updateCellLabelFromClick(row, col) {
        this.cycleLabel(row, col);
        this.refreshAppearanceAllLabels();
    }

    clearState() {
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                this.state[i][j] = 0;
                this.constraintCount[i][j] = 0;
                this.refreshAppearanceCellState(i, j);
            }
        }

        this.placedQueens.clear();
        this.placedQueensColors.clear();
        this.conflictingCells.clear();
        this.refreshAppearanceAllLabels();
    }

    cycleLabel(i, j) {
        const neighbors = [];

        // Get neighbor labels (handling boundary conditions)
        const up = (i > 0) ? this.labels[i - 1][j] : null;
        const down = (i < this.N - 1) ? this.labels[i + 1][j] : null;
        const left = (j > 0) ? this.labels[i][j - 1] : null;
        const right = (j < this.N - 1) ? this.labels[i][j + 1] : null;

        // Ensure each label only appears once
        [up, down, left, right].forEach(neighbor => {
            if (neighbor !== null && !neighbors.includes(neighbor)) {
                neighbors.push(neighbor);
            }
        });
        

        const currentLabel = this.labels[i][j];
        if (currentLabel === -1) {
            // Start with first neighbor or stay -1 if no neighbors
            this.labels[i][j] = neighbors.length > 0 ? neighbors[0] : -1;
        } else {
            const currentIndex = neighbors.indexOf(currentLabel);

            if (currentIndex !== -1) {
                const nextIndex = (currentIndex + 1) % neighbors.length;
                this.labels[i][j] = neighbors[nextIndex];
            } else {
                this.labels[i][j] = -1; // If current label is not a neighbor, reset to -1
            }
        }
    }

    placeQueenFromClick(row, col) {
        const cell = `${row},${col}`;
        this.placedQueens.add(cell);
        this.placedQueensColors.add(this.labels[row][col]);
    
        const affectedCells = getAffectedCellsFromPlacingQueenAt(this.N, this.labels, row, col);
        for (const affectedCell of affectedCells) {
            const [r, c] = affectedCell.split(",").map(Number);
            this.constraintCount[r][c] += 1;
            
            if (this.state[r][c] === STATE_QUEEN) {
                this.conflictingCells.add(cell);
                this.conflictingCells.add(affectedCell);
            }
        }
    }
    
    removeQueenFromClick(row, col) {
        const cell = `${row},${col}`;
        this.placedQueens.delete(cell);
        this.placedQueensColors.delete(this.labels[row][col]);
        
        const affectedCells = getAffectedCellsFromPlacingQueenAt(this.N, this.labels, row, col);
        for (const cell of affectedCells) {
            const [r, c] = cell.split(",").map(Number);
            this.constraintCount[r][c] -= 1;
        }

        this.conflictingCells.delete(cell);
        this.conflictingCells = recalculateConflictingCells(this.N, this.state, this.labels, this.conflictingCells);
    }
    
    placeQueenFromSolver(row, col) {
        const cell = `${row},${col}`

        this.placedQueens.add(cell);
        this.placedQueensColors.add(this.labels[row][col]);
        this.state[row][col] = STATE_QUEEN;

        let updatedCells = [];
        updatedCells.push([`${row},${col}`])

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this.N, this.labels, row, col);
        for (const affectedCell of affectedCells) {
            const [r, c] = affectedCell.split(",").map(Number);
            this.constraintCount[r][c] += 1;

            if (this.constraintCount[r][c] === 1) {
                this.state[r][c] = STATE_MARKED;
                updatedCells.push([`${r},${c}`])
            }
        }

        return updatedCells;
    }

    removeQueenFromSolver(row, col) {
        const cell = `${row},${col}`;
        this.placedQueens.delete(cell);
        this.placedQueensColors.delete(this.labels[row][col]);
        
        this.state[row][col] = STATE_EMPTY;

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this.N, this.labels, row, col);
        for (const cell of affectedCells) {
            const [r, c] = cell.split(",").map(Number);
            this.constraintCount[r][c] -= 1;

            if (this.constraintCount[r][c] === 0) {
                this.state[r][c] = STATE_EMPTY;
            }
        }
    }

    addConstraintToRow(row, excludeLabels) {
        let updatedCells = [];

        for (let j = 0; j < this.N; ++j) {
            const cellColor = this.labels[row][j];
            const L = excludeLabels.length;
            let excludeCell = false;
            for (let idx = 0; idx < L; ++idx) {
                if (excludeLabels[idx] == cellColor) {
                    excludeCell = true;
                }
            }

            if (excludeCell) {
                continue;
            }

            this.constraintCount[row][j] += 1;

            if (this.constraintCount[row][j] === 1) {
                this.state[row][j] = STATE_MARKED;
                updatedCells.push([`${row},${j}`])
            }
        }

        return updatedCells;
    }

    addConstraintToColumn(col, excludeLabels) {
        let updatedCells = [];

        for (let i = 0; i < this.N; ++i) {
            const cellColor = this.labels[i][col];
            const L = excludeLabels.length;
            let excludeCell = false;
            for (let idx = 0; idx < L; ++idx) {
                if (excludeLabels[idx] == cellColor) {
                    excludeCell = true;
                }
            }

            if (excludeCell) {
                continue;
            }

            this.constraintCount[i][col] += 1;

            if (this.constraintCount[i][col] === 1) {
                this.state[i][col] = STATE_MARKED;
                updatedCells.push([`${i},${col}`])
            }
        }

        return updatedCells;
    }

    addConstraintToCell(row, col) {
        this.constraintCount[row][col] += 1;

        if (this.constraintCount[row][col] === 1) {
            this.state[row][col] = STATE_MARKED;
        }
    }

    isSolved() {
        return this.placedQueens.size >= this.N && this.conflictingCells.size === 0;
    }

    checkIfSolved() {
        if (this.isSolved()) {
            console.log("Congrats! You've solved the puzzle.");
        }
    }

    setSolution(solution) {
        this.clearState();
        for (const cell of solution) {
            const [r, c] = cell.split(",").map(Number);
            this.state[r][c] = STATE_QUEEN;
            this.placedQueens.add(cell);
            this.refreshAppearanceCellState(r, c);
        }
    }
}

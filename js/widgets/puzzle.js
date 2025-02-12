import { getAffectedCellsFromPlacingQueenAt, recalculateConflictingCells } from "../algorithms/logic.js";

export const NUM_STATES = 3;
export const STATE_EMPTY = 0;
export const STATE_MARKED = 1;
export const STATE_QUEEN = 2;

// List of 11 common colors
export const DEFAULT_COLOR_SCHEME = [
    "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
    "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
    "#E6F389"
];

export class PuzzleGrid {
    static instance = null; // Static property to hold the single instance

    constructor(N) {
        if (PuzzleGrid.instance) {
            PuzzleGrid.instance.initialize(N);
            return PuzzleGrid.instance;
        }
        
        this.initialize(N);
        PuzzleGrid.instance = this;
    }

    initialize(N) {
        console.log(`Initializing PuzzleGrid of size ${N}`);
        this.N = N;
        this.colorScheme = DEFAULT_COLOR_SCHEME;
        this.labels = Array(this.N).fill(null).map(() => Array(this.N).fill(-1));
        this.state = Array(this.N).fill(null).map(() => Array(this.N).fill(STATE_EMPTY));
        this.currentMode = 'none';
        this.constraintCount = Array(this.N).fill(null).map(() => Array(this.N).fill(0));
        this.highlightedCells = new Set();
        this.placedQueens = new Set();
        this.placedQueensColors = new Set();
    
        // Clear existing grid
        this.gridContainer = document.getElementById('grid-container');
        this.gridContainer.innerHTML = '';
    
        // Set grid container styles *first*
        this.gridContainer.style.setProperty('--grid-size', N); // Set CSS variable
        this.gridContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        this.gridContainer.style.display = 'grid';
        this.gridContainer.style.height = this.gridContainer.offsetWidth + "px"; // Makes it a square

        // Create the grid
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                // Remove explicit width and height setting. Grid takes care of this
                cell.style.boxSizing = 'border-box'; // Include border and padding in element's total width and height
    
                cell.addEventListener('click', () => {
                    if (this.currentMode === 'play') {
                        this.updateCellStateFromClick(i, j);
                    }
                    else if (this.currentMode === 'edit') {
                        this.updateCellLabelFromClick(i, j);
                    }
                });
    
                this.gridContainer.appendChild(cell);
            }
        }
    
        // You might want to set the height of the grid container as well to make it a square
        this.gridContainer.style.height = this.gridContainer.offsetWidth + "px"; // Makes it a square
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

    hasUnpaintedCells() {
        console.log(this.getUnpaintedCells().length)
        return this.getUnpaintedCells().length > 0;
    }

    getUnpaintedCells() {
        const unpaintedCells = [];
    
        for (let row = 0; row < this.N; row++) {
          for (let col = 0; col < this.N; col++) {
            if (this.labels[row][col] === -1) {
                unpaintedCells.push([row, col]);
            }
          }
        }
        
    
        return unpaintedCells;
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

    setLabel(row, col, label) {
        this.labels[row][col] = label;
        this.refreshAppearanceAllLabels();

        let updatedCells = new Set();
        updatedCells.add(`${row},${col}`);

        return updatedCells;
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

        return new Set();
    }

    setCellColor(cell, row, col) {
        const cellKey = `${row},${col}`;
        
        if (this.labels[row][col] >= 0 && this.labels[row][col] < this.colorScheme.length) {
            let baseColor = this.colorScheme[this.labels[row][col]];
            let baseTextColor = 'black';

            if (this.currentMode === 'play') {
                if (this.highlightedCells.has(cellKey)) {
                    baseTextColor = '#8B0000'; // Conflicting cell text red
                } else if (this.highlightedCells.size > 0) {
                    baseColor = this.darkenColor(baseColor, 0.5); // Darken by 50%
                }
            }
            else if (this.currentMode === 'solve') {
                if (this.highlightedCells.has(cellKey)) {
                    //
                } else if (this.highlightedCells.size > 0) {
                    baseColor = this.darkenColor(baseColor, 0.5); // Darken by 50%
                }
            }

            cell.style.color = baseTextColor;
            cell.style.backgroundColor = baseColor;
        } else {
            cell.style.backgroundColor = 'white';
            cell.style.color = 'black'; // Reset color to black
        }
    }
    
    refreshAppearanceAllLabels() {
        // Update puzzle appearance
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const cell = this.gridContainer.children[i * this.N + j];
                const currentLabel = this.labels[i][j];

                this.setCellColor(cell, i, j);

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
        const cell = this.gridContainer.children[row * this.N + col];
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
        if (this.highlightedCells.size > 0) {
            // return early if the cell is not one of the highlighted cells
            if (!this.highlightedCells.has(`${row},${col}`)) {
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
        this.highlightedCells.clear();
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
                this.highlightedCells.add(cell);
                this.highlightedCells.add(affectedCell);
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

        this.highlightedCells.delete(cell);
        this.highlightedCells = recalculateConflictingCells(this.N, this.state, this.labels, this.highlightedCells);
    }
    
    placeQueenFromSolver(row, col) {
        const cell = `${row},${col}`

        this.placedQueens.add(cell);
        this.placedQueensColors.add(this.labels[row][col]);
        this.state[row][col] = STATE_QUEEN;

        let updatedCells = new Set();
        updatedCells.add(`${row},${col}`)

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this.N, this.labels, row, col);
        for (const affectedCell of affectedCells) {
            const [r, c] = affectedCell.split(",").map(Number);
            this.constraintCount[r][c] += 1;

            if (this.constraintCount[r][c] === 1) {
                this.state[r][c] = STATE_MARKED;
                updatedCells.add(`${r},${c}`)
            }
        }

        return updatedCells;
    }

    removeQueenFromSolver(row, col) {
        let updatedCells = new Set();
        const cell = `${row},${col}`;

        this.placedQueens.delete(cell);
        this.placedQueensColors.delete(this.labels[row][col]);
        this.state[row][col] = STATE_EMPTY;
        updatedCells.add(`${row},${col}`);

        const affectedCells = getAffectedCellsFromPlacingQueenAt(this.N, this.labels, row, col);
        for (const cell of affectedCells) {
            const [r, c] = cell.split(",").map(Number);
            this.constraintCount[r][c] -= 1;

            if (this.constraintCount[r][c] === 0) {
                this.state[r][c] = STATE_EMPTY;
                updatedCells.add(`${r},${c}`)
            }
        }

        return updatedCells;
    }

    addConstraintToRows(rows, excludeLabels) {
        let updatedCells = new Set();
        
        if (typeof rows === 'number') {  // Check if rows is a single number
            rows = [rows]; // Wrap it in an array to make it iterable
        } else if (!Array.isArray(rows)) {
          console.error("rows must be a number or an array of numbers.");
          return updatedCells; // Return empty array to avoid issues
        }

        for (const row of rows) {
            for (let j = 0; j < this.N; ++j) {
                const cellColor = this.labels[row][j];
                const L = excludeLabels.length;
                let excludeCell = false;
                for (let idx = 0; idx < L; ++idx) {
                    if (excludeLabels[idx] === cellColor) {
                        excludeCell = true;
                        break; // Exit inner loop early if a match is found
                    }
                }
    
                if (excludeCell) {
                    continue;
                }
    
                this.constraintCount[row][j] += 1;
    
                if (this.constraintCount[row][j] === 1) {
                    this.state[row][j] = STATE_MARKED;
                    updatedCells.add(`${row},${j}`);
                }
            }
        }
    
        return updatedCells;
    }
    

    addConstraintToColumns(cols, excludeLabels) {
        let updatedCells = new Set();
    
        if (typeof cols === 'number') {
            cols = [cols];
        } else if (!Array.isArray(cols)) {
          console.error("cols must be a number or an array of numbers.");
          return updatedCells;
        }
    
        for (const col of cols) {
            for (let i = 0; i < this.N; ++i) {
                const cellColor = this.labels[i][col];
                const L = excludeLabels.length;
                let excludeCell = false;
                for (let idx = 0; idx < L; ++idx) {
                    if (excludeLabels[idx] === cellColor) {
                        excludeCell = true;
                        break; // Exit inner loop early
                    }
                }
    
                if (excludeCell) {
                    continue;
                }
    
                this.constraintCount[i][col] += 1;
    
                if (this.constraintCount[i][col] === 1) {
                    this.state[i][col] = STATE_MARKED;
                    updatedCells.add(`${i},${col}`);
                }
            }
        }
    
        return updatedCells;
    }    

    addConstraintToCell(row, col) {
        let updatedCells = new Set();
        this.constraintCount[row][col] += 1;

        if (this.constraintCount[row][col] === 1) {
            this.state[row][col] = STATE_MARKED;
            updatedCells.add(`${row},${col}`);
        }

        return updatedCells;
    }

    removeConstraintFromRows(rows) {
        let updatedCells = new Set();
    
        if (typeof rows === 'number') {
            rows = [rows];
        } else if (!Array.isArray(rows)) {
            console.error("rows must be a number or an array of numbers.");
            return updatedCells;
        }
    
        for (const row of rows) {
            for (let j = 0; j < this.N; ++j) {
                this.constraintCount[row][j] -= 1;
    
                if (this.constraintCount[row][j] === 0) {
                    this.state[row][j] = STATE_EMPTY; // Or whatever your empty state is
                    updatedCells.add(`${row},${j}`);
                }
            }
        }
    
        return updatedCells;
    }
    
    removeConstraintFromColumns(cols) {
        let updatedCells = new Set();
    
        if (typeof cols === 'number') {
            cols = [cols];
        } else if (!Array.isArray(cols)) {
            console.error("cols must be a number or an array of numbers.");
            return updatedCells;
        }
    
        for (const col of cols) {
            for (let i = 0; i < this.N; ++i) {
                this.constraintCount[i][col] -= 1;
    
                if (this.constraintCount[i][col] === 0) {
                    this.state[i][col] = STATE_EMPTY;
                    updatedCells.add(`${i},${col}`);
                }
            }
        }
    
        return updatedCells;
    }
    
    removeConstraintFromCell(row, col) {
        let updatedCells = new Set();
        this.constraintCount[row][col] -= 1;
    
        if (this.constraintCount[row][col] === 0) {
            this.state[row][col] = STATE_EMPTY;
            updatedCells.add(`${row},${col}`);
        }
    
        return updatedCells;
    }    

    isSolved() {
        return this.placedQueens.size >= this.N && this.highlightedCells.size === 0;
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

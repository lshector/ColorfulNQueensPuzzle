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
    
        const affectedCells = this.getAffectedCellsFromPlacingQueenAt(row, col);
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
        
        const affectedCells = this.getAffectedCellsFromPlacingQueenAt(row, col);
        for (const cell of affectedCells) {
            const [r, c] = cell.split(",").map(Number);
            this.constraintCount[r][c] -= 1;
        }

        this.conflictingCells.delete(cell);
        this.recalculateConflictingCells();
    }
    
    recalculateConflictingCells() {
        if (this.conflictingCells.size === 0) return; // Early exit if no conflicts
    
        const newConflictingCells = new Set();
        for (const cellStr of this.conflictingCells) {
            const [r, c] = cellStr.split(",").map(Number);
    
            let inConflict = false;
    
            const affectedCells = this.getAffectedCellsFromPlacingQueenAt(r, c);
            for (const affectedCell of affectedCells) {
                const [ar, ac] = affectedCell.split(",").map(Number);
                if (this.state[ar][ac] === STATE_QUEEN) {
                    inConflict = true;
                    break;
                }
            }
    
            if (!inConflict) {
                const color = this.labels[r][c];
                for (let i = 0; i < this.N; i++) {
                    for (let j = 0; j < this.N; j++) {
                        if ((i !== r || j !== c) && this.state[i][j] === STATE_QUEEN && this.labels[i][j] === color) {
                            inConflict = true;
                            break;
                        }
                    }
                    if (inConflict) break;
                }
            }
    
            if (inConflict) {
                newConflictingCells.add(cellStr);
            }
        }
    
        this.conflictingCells = newConflictingCells;
    }

    checkIfSolved() {
        if (this.placedQueens.size >= this.N && this.conflictingCells.size === 0) {
            console.log("Congrats! You've solved the puzzle.");
        }
    }

    getAffectedCellsFromPlacingQueenAt(row, col) {
        const affected = new Set()
    
        // Collect affected cells (row)
        for (let j = 0; j < this.N; j++) {
            if (j !== col) {
                affected.add(`${row},${j}`); // Use strings as unique keys
            }
        }
    
        // Collect affected cells (column)
        for (let i = 0; i < this.N; i++) {
            if (i !== row) {
                affected.add(`${i},${col}`);
            }
        }
    
        // Collect affected cells (diagonal)
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
    
        for (const [dr, dc] of directions) {
            const nr = row + dr;
            const nc = col + dc;
    
            if (nr >= 0 && nr < this.N && nc >= 0 && nc < this.N) {
                affected.add(`${nr},${nc}`);
            }
        }
    
        // Collect affected cells (color)
        const color = this.labels[row][col];
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                if ((i !== row || j !== col) && this.labels[i][j] === color) {
                    affected.add(`${i},${j}`);
                }
            }
        }
    
        return affected;
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

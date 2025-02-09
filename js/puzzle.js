const gridContainer = document.getElementById('grid-container');

export class PuzzleGrid {
    constructor(N) {
        console.log(`Initializing PuzzleGrid of size ${N}`);
        this.N = N;
        this.colorScheme = null;
        this.state = Array(this.N).fill(null).map(() => Array(this.N).fill(0));
        this.clickResponseEnabled = false;
    
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
                    if (this.clickResponseEnabled) {
                        this.state[i][j] = (this.state[i][j] + 1) % 3;
                        this.refreshAppearanceCellState(i, j); // Make sure this function is defined
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

    refreshAppearanceAllLabels() {
        // Update puzzle appearance
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const cell = gridContainer.children[i * this.N + j];
                const currentLabel = this.labels[i][j];
    
                // Color assignment
                const label = this.labels[i][j];
                if (label >= 0 && label < this.colorScheme.length) { // Check bounds
                    cell.style.backgroundColor = this.colorScheme[label];
                } else {
                  console.warn("Label out of bounds", label);
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

    refreshAppearanceCellState(row, col) {
        const cell = gridContainer.children[row * this.N + col];
        cell.innerHTML = "";
    
        if (this.state[row][col] === 1) {
            cell.textContent = 'x';
        } else if (this.state[row][col] === 2) {
            cell.textContent = '♛';
        }
    }
    
    
    clearState() {
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                this.state[i][j] = 0
                this.refreshAppearanceCellState(i, j)
            }
        } 
    }
}

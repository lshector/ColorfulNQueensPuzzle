const gridContainer = document.getElementById('grid-container');

const CELL_SIZE_PX = '50px'

export class PuzzleGrid {
    constructor(N) {
        console.log(`Initializing PuzzleGrid of size ${N}`)
        this.N = N
        this.colorScheme = null
        this.state = Array(this.N).fill(null).map(() => Array(this.N).fill(0));
        this.clickResponseEnabled = false

        // Clear existing grid
        gridContainer.innerHTML = '';

        // Create the grid
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.style.width = CELL_SIZE_PX;
                cell.style.height = CELL_SIZE_PX;
                cell.style.boxSizing = 'border-box';

                cell.addEventListener('click', () => {
                    if (this.clickResponseEnabled) {
                        // Cycle cell state on click (Empty -> X -> Queen -> Empty)
                        this.state[i][j] = (this.state[i][j] + 1) % 3;
                        this.refreshAppearanceCellState(i, j);
                    }
                });

                gridContainer.appendChild(cell);
            }
        }

        // Set grid container styles after cells are added
        gridContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
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
        const xMark = document.createElement('span');
        xMark.textContent = 'x';
        cell.appendChild(xMark);
      } else if (this.state[row][col] === 2) {
        const queen = document.createElement('span');
        queen.textContent = '♛';
        cell.appendChild(queen);
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

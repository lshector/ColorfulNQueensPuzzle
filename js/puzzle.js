const gridContainer = document.getElementById('grid-container');

const CELL_SIZE_PX = '50px'

//let puzzle_labels = null
//let puzzle_state = null
//let puzzle_colors = null

export class PuzzleGrid {
    constructor(N) {
        this.N = N
        this.color_scheme = null

        console.log(`Initializing PuzzleGrid of size ${N}`)
        
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

                gridContainer.appendChild(cell);
            }
        }

        // Set grid container styles after cells are added
        gridContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    }

    setColorScheme(new_color_scheme) {
        if (new_color_scheme.length < this.N) {
            console.error(`Input color scheme has ${new_color_scheme.length} entries, need ${this.N}`)
            return
        }

        console.log(`Setting puzzle color scheme: ${new_color_scheme}`)
        this.color_scheme = new_color_scheme
    }

    setLabels(new_labels) {
        if (this.color_scheme == null) {
            console.error(`Can't set puzzle labels because no color scheme is set`)
            return;
        }

        if (new_labels.length != this.N) {
            console.error(`Size of new labels ${new_labels.length} does not match the puzzle size ${this.N}`)
        }

        console.log(`Setting labels: ${new_labels}`)
        this.labels = new_labels

        

        // Update puzzle appearance
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const cell = gridContainer.children[i * this.N + j];
                const currentLabel = this.labels[i][j];
    
                // Color assignment
                const label = this.labels[i][j];
                if (label >= 0 && label < this.color_scheme.length) { // Check bounds
                    cell.style.backgroundColor = this.color_scheme[label];
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
}

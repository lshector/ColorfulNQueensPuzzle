const gridContainer = document.getElementById('grid-container');
const CELL_SIZE = '50px'

export function init_grid(N) {
    // Create the grid
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');  // Add class for styling if needed
            cell.style.width = CELL_SIZE; // Example cell size
            cell.style.height = CELL_SIZE; // Example cell size
            cell.style.border = '1px solid lightgray'; // Example cell border
            gridContainer.appendChild(cell);
        }
    }

    // Set grid container styles after cells are added
    gridContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`; // Makes grid NxN
}
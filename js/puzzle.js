const gridContainer = document.getElementById('grid-container');
const CELL_SIZE = '50px'

export function init_grid(N, grid_labels, label_colors) { // Added parameters
    // Clear existing grid (important if called multiple times)
    gridContainer.innerHTML = '';  // Clear children of gridContainer

    // Create the grid
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.style.width = CELL_SIZE;
            cell.style.height = CELL_SIZE;
            cell.style.border = '1px solid lightgray';

            // Color assignment
            const label = grid_labels[i][j];
            if (label >= 0 && label < label_colors.length) { // Check bounds
                cell.style.backgroundColor = label_colors[label];
            } else {
              console.warn("Label out of bounds", label);
            }

            gridContainer.appendChild(cell);
        }
    }

    // Set grid container styles after cells are added
    gridContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
}

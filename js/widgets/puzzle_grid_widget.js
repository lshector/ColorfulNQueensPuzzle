export const NUM_STATES = 3;
export const STATE_EMPTY = 0;
export const STATE_MARKED = 1;
export const STATE_QUEEN = 2;

export const DEFAULT_COLOR_SCHEME = [
  "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
  "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
  "#E6F389"
]

export class PuzzleGridWidget {
  constructor(containerId) {
    this.grid = document.getElementById(containerId);
    if (!this.grid) {
      console.error(`Grid with ID '${containerId}' not found.`);
    }
    this.size = 0;
    this.callback = null;
  }

  static instances = {}; // Factory cache

  static getInstance(containerId) {
    if (!PuzzleGridWidget.instances[containerId]) {
      PuzzleGridWidget.instances[containerId] = new PuzzleGridWidget(containerId);
    }
    return PuzzleGridWidget.instances[containerId];
  }

  // ===========================================================================

  resizeGrid(size) {
    if (!this.grid) return;

    this.size = size;
    this.grid.innerHTML = '';

    // Set grid container styles *first*
    this.grid.style.setProperty('--grid-size', this.size);
    this.grid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    this.grid.style.display = 'grid';
    this.grid.style.height = this.grid.offsetWidth + "px";

    // Create the grid
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        this.grid.appendChild(cell);
      }
    }

    // Set container height such that it is a square
    this.grid.style.height = this.grid.offsetWidth + "px";
  }

  // ===========================================================================

  getCellElement(row, col) {
    if (!this.grid || this.size === 0 || row < 0 || row >= this.size || col < 0 || col >= this.size) {
        return null; // Handle invalid row/col
    }

    const index = row * this.size + col; // Calculate the 1D index
    const cells = this.grid.querySelectorAll('.grid-cell');  // Select all grid cells
    return cells[index] || null; // Return the cell at the calculated index
  }


  applyCellUpdate(cell, update) {
    Object.assign(cell.style, update);
    if (update.textContent) {
        cell.textContent = update.textContent;
    }
  }

  updateGrid(updates) {
    if (!this.grid || this.size === 0) return;

    for (const update of updates) {
        const cell = this.getCellElement(update.row, update.col);

        if (cell) {
          const cellCopy = cell.cloneNode(true);
          this.applyCellUpdate(cellCopy, update);
          this.grid.replaceChild(cellCopy, cell);
        } else {
            console.warn(`Cell at row ${update.row}, col ${update.col} not found.`);
        }
    }
  }

  // ============================================================================

  setOnClick(callback) {
    // 1. Clear previous event listeners (if any)
    if (this.callback) {
        for (let i = 0; i < this.size; ++i) {
            for (let j = 0; j < this.size; ++j) {
                const cell = this.getCellElement(i, j);
                if (cell) { // Important check in case a cell is null
                    cell.removeEventListener('click', this.boundClickHandler); // Remove the *bound* handler
                }
            }
        }
    }

    // 2. Store the new callback
    this.callback = callback;

    // 3. Add new event listeners
    if (this.callback) { // Only add listeners if a callback is provided.
        this.boundClickHandler = (i, j) => this.callback(i, j); // Create bound handler

        for (let i = 0; i < this.size; ++i) {
            for (let j = 0; j < this.size; ++j) {
                const cell = this.getCellElement(i, j);
                if (cell) {
                    cell.addEventListener('click', () => this.boundClickHandler(i, j));
                }
            }
        }
    }
}

}

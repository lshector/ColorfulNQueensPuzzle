export const NUM_STATES = 3;
export const STATE_EMPTY = 0;
export const STATE_MARKED = 1;
export const STATE_QUEEN = 2;

export const DEFAULT_COLOR_SCHEME = [
  "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
  "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
  "#E6F389"
]

/**
 * A widget for displaying and interacting with a square grid.
 */
 export class PuzzleGridWidget {
  /**
   * A cache of PuzzleGridWidget instances, keyed by container ID.
   * @type {object}
   */
   static instances = {};

  /**
   * Constructs a new PuzzleGridWidget.
   * @param {string} containerId The ID of the HTML element that will contain the grid.
   */
  constructor(containerId) {
    /**
     * The HTML element that contains the grid.
     * @type {HTMLElement|null}
     */
    this.grid = document.getElementById(containerId);
    if (!this.grid) {
      console.error(`Grid with ID '${containerId}' not found.`);
    }
    /**
     * The size of the grid (number of rows and columns).
     * @type {number}
     */
    this.size = 0;
    /**
     * The callback function to be called when a cell is clicked.
     * @type {Function|null}
     */
    this.callback = null;

    /**
     * Stores bound click handlers for each cell to prevent memory leaks.
     * @type {object}
     */
    this.boundClickHandlers = {};
  }

  /**
   * Gets a PuzzleGridWidget instance for the given container ID.  Creates a new instance if one does not already exist.
   * @param {string} containerId The ID of the HTML element that will contain the grid.
   * @returns {PuzzleGridWidget} The PuzzleGridWidget instance.
   */
  static getInstance(containerId) {
    if (!PuzzleGridWidget.instances[containerId]) {
      PuzzleGridWidget.instances[containerId] = new PuzzleGridWidget(containerId);
    }
    return PuzzleGridWidget.instances[containerId];
  }

  /**
   * Resizes the grid to the given size.
   * @param {number} size The new size of the grid (number of rows and columns).
   */
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

        if (this.callback) {
          // re-assign callback
          this.boundClickHandlers[i][j] = () => this.callback(i, j);
          cell.addEventListener('click', this.boundClickHandlers[i][j]);
        }

        this.grid.appendChild(cell);
      }
    }

    // Set container height such that it is a square
    this.grid.style.height = this.grid.offsetWidth + "px";
  }

  /**
   * Gets the grid cell element at the given row and column.
   * @param {number} row The row index (0-based).
   * @param {number} col The column index (0-based).
   * @returns {HTMLElement|null} The grid cell element, or null if the row or column is invalid.
   */
  getCellElement(row, col) {
    if (!this.grid || this.size === 0 || row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return null; // Handle invalid row/col
    }

    const index = row * this.size + col; // Calculate the 1D index
    const cells = this.grid.querySelectorAll('.grid-cell');  // Select all grid cells
    return cells[index] || null; // Return the cell at the calculated index
  }

  /**
   * Applies an update to a grid cell's style and text content.
   * @param {HTMLElement} cell The grid cell element to update.
   * @param {object} update An object containing the style updates and/or textContent.
   */
  applyCellUpdate(cell, update) {
    Object.assign(cell.style, update);
    if (update.textContent) {
      cell.textContent = update.textContent;
    }
  }

  /**
   * Updates multiple cells in the grid.
   * @param {Array<object>} updates An array of update objects, each containing
   *        the row, col, and style/textContent updates.
   */
  updateGrid(updates) {
    if (!this.grid || this.size === 0) return;

    for (const update of updates) {
      const [row, col] = [update.row, update.col];
      const cell = this.getCellElement(row, col);

      const cellCopy = cell.cloneNode(true);
      this.applyCellUpdate(cellCopy, update);
      this.grid.replaceChild(cellCopy, cell);

      if (this.callback) {
        // re-assign callback
        this.boundClickHandlers[row][col] = () => this.callback(row, col);
        cellCopy.addEventListener('click', this.boundClickHandlers[row][col]);
      }
    }
  }

  /**
   * Sets the callback function to be called when a cell is clicked.
   * @param {Function|null} callback The callback function.  Will be passed the row and column of the clicked cell.  If null, removes all click handlers.
   */
  setOnClick(callback) {
    if (this.callback) {
      // Clear previous event listeners
      for (let i = 0; i < this.size; ++i) {
        for (let j = 0; j < this.size; ++j) {
          const cell = this.getCellElement(i, j);
          cell.removeEventListener('click', this.boundClickHandlers[i][j]);
        }
      }
    }

    // Store the new callback
    this.callback = callback;
    this.boundClickHandlers = {};

    if (this.callback) {
      // Add new event listeners
      for (let i = 0; i < this.size; ++i) {
        this.boundClickHandlers[i] = {}; // Initialize inner object for each row
        for (let j = 0; j < this.size; ++j) {
          const cell = this.getCellElement(i, j);
          this.boundClickHandlers[i][j] = () => this.callback(i, j);
          cell.addEventListener('click', this.boundClickHandlers[i][j]);
        }
      }
    }
  }
}
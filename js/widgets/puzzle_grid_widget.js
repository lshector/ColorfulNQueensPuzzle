/**
 * A widget for displaying and interacting with a square grid.
 */
 export class PuzzleGridWidget {
  /**
   * A cache of PuzzleGridWidget instances, keyed by container ID.
   * @type {object}
   */
   static _instances = {};

  /**
   * Constructs a new PuzzleGridWidget.
   * @param {string} containerId The ID of the HTML element that will contain the grid.
   */
  constructor(containerId) {
    /**
     * The HTML element that contains the grid.
     * @type {HTMLElement|null}
     */
    this._grid = document.getElementById(containerId);
    if (!this._grid) {
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
    this._callback = null;

    /**
     * Stores bound click handlers for each cell to prevent memory leaks.
     * @type {object}
     */
    this._boundClickHandlers = {};
  }

  /**
   * Gets a PuzzleGridWidget instance for the given container ID.  Creates a new instance if one does not already exist.
   * @param {string} containerId The ID of the HTML element that will contain the grid.
   * @returns {PuzzleGridWidget} The PuzzleGridWidget instance.
   */
  static getInstance(containerId) {
    if (!PuzzleGridWidget._instances[containerId]) {
      PuzzleGridWidget._instances[containerId] = new PuzzleGridWidget(containerId);
    }
    return PuzzleGridWidget._instances[containerId];
  }

  /**
   * Resizes the grid to the given size.
   * @param {number} size The new size of the grid (number of rows and columns).
   */
  resizeGrid(size) {
    this.size = size;
    this._grid.innerHTML = '';

    // Set grid container styles *first*
    this._grid.style.setProperty('--grid-size', this.size);
    this._grid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    this._grid.style.display = 'grid';
    this._grid.style.height = this._grid.offsetWidth + "px";

    // Create the grid
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');

        if (this._callback) {
          // re-assign callback
          this._boundClickHandlers[i][j] = () => this._callback(i, j);
          cell.addEventListener('click', this._boundClickHandlers[i][j]);
        }

        this._grid.appendChild(cell);
      }
    }

    // Set container height such that it is a square
    this._grid.style.height = this._grid.offsetWidth + "px";
  }

  /**
   * Updates multiple cells in the grid.
   * @param {Array<object>} updates An array of update objects, each containing
   *        the row, col, and style/textContent updates.
   */
  updateGrid(updates) {
    for (const update of updates) {
      const [row, col] = [update.row, update.col];
      const cell = this._getCellElement(row, col);

      const cellCopy = cell.cloneNode(true);
      this._applyCellUpdate(cellCopy, update);
      this._grid.replaceChild(cellCopy, cell);

      if (this._callback) {
        // re-assign callback
        this._boundClickHandlers[row][col] = () => this._callback(row, col);
        cellCopy.addEventListener('click', this._boundClickHandlers[row][col]);
      }
    }
  }

  /**
   * Sets the callback function to be called when a cell is clicked.
   * @param {Function|null} callback The callback function.  Will be passed the row and column of the clicked cell.  If null, removes all click handlers.
   */
  setOnClick(callback) {
    if (this._callback) {
      // Clear previous event listeners
      for (let i = 0; i < this.size; ++i) {
        for (let j = 0; j < this.size; ++j) {
          const cell = this._getCellElement(i, j);
          cell.removeEventListener('click', this._boundClickHandlers[i][j]);
        }
      }
    }

    // Store the new callback
    this._callback = callback;
    this._boundClickHandlers = {};

    if (this._callback) {
      // Add new event listeners
      for (let i = 0; i < this.size; ++i) {
        this._boundClickHandlers[i] = {}; // Initialize inner object for each row
        for (let j = 0; j < this.size; ++j) {
          const cell = this._getCellElement(i, j);
          this._boundClickHandlers[i][j] = () => this._callback(i, j);
          cell.addEventListener('click', this._boundClickHandlers[i][j]);
        }
      }
    }
  }

  /**
   * Gets the grid cell element at the given row and column.
   * @param {number} row The row index (0-based).
   * @param {number} col The column index (0-based).
   * @returns {HTMLElement|null} The grid cell element, or null if the row or column is invalid.
   */
   _getCellElement(row, col) {
    const index = row * this.size + col; // Calculate the 1D index
    const cells = this._grid.querySelectorAll('.grid-cell');  // Select all grid cells
    return cells[index] || null; // Return the cell at the calculated index
  }

  /**
   * Applies an update to a grid cell's style and text content.
   * @param {HTMLElement} cell The grid cell element to update.
   * @param {object} update An object containing the style updates and/or textContent.
   */
  _applyCellUpdate(cell, update) {
    Object.assign(cell.style, update);
    if (update.textContent) {
      cell.textContent = update.textContent;
    }
  }
}
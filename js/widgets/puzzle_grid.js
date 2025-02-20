import { PuzzleGridRenderer } from "./puzzle_grid_renderer.js";
import { COLOR_GROUP_NONE, MARKING_NONE, MARKING_QUEEN, PuzzleGridState } from "./puzzle_grid_state.js";
import { PuzzleGridWidget } from "./puzzle_grid_widget.js";

export class PuzzleGrid {
 /**
  * A cache of PuzzleGrid instances, keyed by container ID.
  * @type {object}
  */
  static _instances = {};

  constructor(containerId) {
    this._widget = new PuzzleGridWidget(containerId);
    this._renderer = new PuzzleGridRenderer();
    this._state = new PuzzleGridState();
    this._updates = [];
  }

  /**
   * Gets a PuzzleGrid instance for the given container ID.  Creates a new instance if one does not already exist.
   * @param {string} containerId The ID of the HTML element that will contain the grid.
   * @returns {PuzzleGrid} The PuzzleGrid instance.
   */
   static getInstance(containerId) {
    if (!PuzzleGrid._instances[containerId]) {
      PuzzleGrid._instances[containerId] = new PuzzleGrid(containerId);
    }
    return PuzzleGrid._instances[containerId];
  }

  size() {
    return this._widget.size;
  }

  getColorGroupAt(row, col) {
    return this._state.colorGroups[row][col];
  }

  setColorGroupAt(row, col, newColorGroup) {
    this._state.colorGroups[row][col] = newColorGroup;
    this._enqueueRendererUpdate({ row, col, colorGroup: newColorGroup });
  }

  clearColorGroups() {
    this._state.clearColorGroups();

    for (let i = 0; i < this.size(); ++i) {
      for (let j = 0; j < this.size(); ++j) {
        this.setColorGroupAt(i, j, COLOR_GROUP_NONE);
      }
    }
  }

  getMarkingAt(row, col) {
    return this._state.markings[row][col];
  }

  setMarkingAt(row, col, newMarking) {
    this._state.markings[row][col] = newMarking;
    this._enqueueRendererUpdate({ row, col, marking: newMarking });
  }

  clearMarkings() {
    this._state.clearMarkings();

    for (let i = 0; i < this.size(); ++i) {
      for (let j = 0; j < this.size(); ++j) {
        this.setMarkingAt(i, j, MARKING_NONE);
      }
    }
  }

  setOnClick(callback) {
    this._boundClickHandler = (i, j) => callback(this, i, j);
    this._widget.setOnClick(this._boundClickHandler);
  }

  setAllColorGroups(colorGroups) {
    console.log(`Loading puzzle ${colorGroups}`);

    const newSize = colorGroups.length;
    if (newSize !== this.size()) {
      this._widget.resizeGrid(newSize);
      this._state.resize(newSize);
    }

    // create updates to set each cell to the new color group
    for (let i = 0; i < this.size(); ++i) {
      for (let j = 0; j < this.size(); ++j) {
        this.setColorGroupAt(i, j, colorGroups[i][j]);
      }
    }

    this.render();
  }

  render() {
    console.log(`Rending ${this._updates.length} updates`)
    this._renderer.updateGrid(this._widget, this._updates);
    this._updates = [];
  }

  isSafe(row, col) {
    const N = this.size();

    // Check column conflicts
    for (let j = 0; j < N; j++) {
      if (j !== col && this.getMarkingAt(row, j) === MARKING_QUEEN) return false;
    }

    // Check row conflicts
    for (let i = 0; i < N; i++) {
        if (i !== row && this.getMarkingAt(i, col) === MARKING_QUEEN) return false;
    }

    // Check diagonal conflicts
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const nr = row + dr;
        const nc = col + dc;
        const isInbounds = nr >= 0 && nr < N && nc >= 0 && nc < N;
        if (isInbounds && this.getMarkingAt(nr, nc) === MARKING_QUEEN) {
            return false;
        }
    }

    // Check color conflicts
    const color = this.getColorGroupAt(row, col);
    if (color !== -1) {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if ((i !== row || j !== col) &&
                    this.getMarkingAt(i, j) === MARKING_QUEEN &&
                    this.getColorGroupAt(i, j) === color) {
                    return false;
                }
            }
        }
    }

    return true;
  }

  _enqueueRendererUpdate(update) {
    this._updates.push(update);
  }
};
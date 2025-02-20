import { PuzzleGridRenderer } from "./puzzle_grid_renderer.js";
import { MARKING_NONE, MARKING_QUEEN, PuzzleGridState } from "./puzzle_grid_state.js";
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

  updateMarkings(updates) {

  }

  updateColorGroups(updates) {

  }

  getMarkingAt(row, col) {
    return this._state.markings[row][col];
  }

  setMarkingAt(row, col, newMarking) {
    this._state.markings[row][col] = newMarking;
    this._updates.push({ row, col, marking: newMarking });
  }

  clearMarkings() {
    this._state.clearMarkings();
  }

  clearColorGroups() {
    this._state.clearColorGroups();
    this.loadPuzzle(this._state.colorGroups);
  }

  setOnClick(callback) {
    this._boundClickHandler = (i, j) => callback(this, i, j);
    this._widget.setOnClick(this._boundClickHandler);
  }

  loadPuzzle(colorGroups) {
    console.log(`Loading puzzle ${colorGroups}`);

    const newSize = colorGroups.length;
    if (newSize !== this._widget.size) {
      this._widget.resizeGrid(newSize);
      this._state.resize(newSize);
    }

    // create updates for renderer
    for (let i = 0; i < this._widget.size; ++i) {
      for (let j = 0; j < this._widget.size; ++j) {
        this._state.colorGroups[i][j] = colorGroups[i][j];
        this._updates.push({
          row: i, col: j,
          marking: MARKING_NONE,
          colorGroup: colorGroups[i][j]
        });
      }
    }

    this.render();
  }

  render() {
    this._renderer.updateGrid(this._widget, this._updates);
    this._updates = [];
  }
};
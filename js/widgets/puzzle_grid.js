import { PuzzleGridRenderer } from "./puzzle_grid_renderer.js";
import { MARKING_NONE, PuzzleGridState } from "./puzzle_grid_state.js";
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

  getRenderer() {

  }

  getWidget() {

  }

  getState() {

  }

  loadPuzzle(colorGroups) {
    this._widget.resizeGrid(colorGroups.length);

    let updates = []
    for (let i = 0; i < this._widget.size; ++i) {
      for (let j = 0; j < this._widget.size; ++j) {
        updates.push({
          row: i, col: j,
          marking: MARKING_NONE,
          colorGroup: colorGroups[i][j]
        });
      }
    }

    this._renderer.updateGrid(this._widget, updates);
  }
};
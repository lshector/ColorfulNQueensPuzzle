/**
 * Represents a cell without a marking.
 * @type {number}
 */
export const MARKING_NONE = 0;

/**
 * Represents a cell marked with an X.
 * @type {number}
 */
export const MARKING_X = 1;

/**
* Represents a cell marked with a Queen.
* @type {number}
*/
export const MARKING_QUEEN = 2;

/**
 * Represents a cell without a color group.
 * @type {number}
 */
export const COLOR_GROUP_NONE = -1;

/**
* Represents the state of a puzzle grid, including cell markings and color groups.
*/
export class PuzzleGridState {
  /**
  * Constructs a new PuzzleGridState.
  * @param {number} size The size of the grid (number of rows and columns).
  */
  constructor(size) {
    /**
    * The size of the grid (number of rows and columns).
    * @type {number}
    */
    this.size = size;
    /**
    * 2D array representing the color group for each cell.
    * Each element is a color group ID or NO_COLOR_GROUP.
    * @type {number[][]}
    */
    this.clearColorGroups();
    /**
    * 2D array representing the marking state of each cell.
    * Each element is one of: MARKING_NONE, MARKING_X, MARKING_QUEEN.
    * @type {number[][]}
    */
    this.clearMarkings();
  }

  resize(newSize) {
    console.log(`Resizing from ${this.size} to ${newSize}`);
    this.size = newSize;
    this.clearColorGroups();
    this.clearMarkings();
  }

  /**
  * Clears all color groups on the grid.
  */
  clearColorGroups() {
    console.log("Clearing all color groups");
    this.colorGroups = Array(this.size).fill(null).map(() => Array(this.size).fill(COLOR_GROUP_NONE));
  }

  /**
  * Clears the marking state of all cells on the grid.
  */
  clearMarkings() {
    console.log("Clearing all markings");
    this.markings = Array(this.size).fill(null).map(() => Array(this.size).fill(MARKING_NONE));
  }
}
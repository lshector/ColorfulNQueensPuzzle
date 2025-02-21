import { MARKING_NONE, MARKING_X, MARKING_QUEEN, PuzzleGridState } from "./puzzle_grid_state.js";

export const DEFAULT_COLOR_SCHEME = [
  "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
  "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
  "#E6F389"
];

export const MARKINGS_TO_TEXT = {
  [MARKING_NONE]: ' ',
  [MARKING_X]: 'x',
  [MARKING_QUEEN]: '♛'
}

export class PuzzleGridRenderer {
  constructor(gridWidget) {
    this._gridWidget = gridWidget;
    this._renderPeriodMs = 33;
    this._renderPending = false;
    this._pendingUpdates = [];
  }

  update(data) {
    this._pendingUpdates.push(data);

    if (!this._renderPending) {
      this._renderPending = true;
      this.render();

      setTimeout(() => { this._renderPending = false; }, this._renderPeriodMs);
    }
  }

  render() {
    // TODO: add updates for grid cell borders
    console.log("Rendering...");
    let gridUpdatesList = [];
    for (const rendererUpdate of this._pendingUpdates) {
      let [row, col] = [rendererUpdate.row, rendererUpdate.col];
      let gridUpdate = { row, col };
      if (rendererUpdate.marking !== null) {
        gridUpdate.textContent = MARKINGS_TO_TEXT[rendererUpdate.marking];
      }
      if (rendererUpdate.colorGroup !== null) {
        if (rendererUpdate.colorGroup === -1) {
          gridUpdate.backgroundColor = 'white';
        }
        else {
          gridUpdate.backgroundColor = DEFAULT_COLOR_SCHEME[rendererUpdate.colorGroup];
        }
      }
      gridUpdatesList.push(gridUpdate);
    }

    this._gridWidget.updateGrid(gridUpdatesList);
    this._pendingUpdates = [];
  }

  updateEntireGrid(newMarkings, newLabels) {
    //
  }
}
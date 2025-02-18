import { MARKING_NONE, MARKING_X, MARKING_QUEEN, PuzzleGridState } from "./puzzle_grid_state.js";

export const DEFAULT_COLOR_SCHEME = [
  "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
  "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
  "#E6F389"
];

export const MARKINGS_TO_TEXT = {
  MARKING_NONE: '',
  MARKING_X: 'x',
  MARKING_QUEEN: '♛'
}

export class PuzzleGridRenderer {
  constructor(initialState) {
    this.state = initialState;
    this.updateEntireGrid(this.state);
  }

  updateGrid(gridWidget, updates) {
    let gridUpdatesList = [];

    // TODO: add updates for grid cell borders
    for (const rendererUpdate of updates) {
      let gridUpdate = {
          row: rendererUpdate.row,
          col: rendererUpdate.col,
      };
      if (rendererUpdate.marking !== null) {
        gridUpdate.textContent = rendererUpdate.marking;
      }
      if (rendererUpdate.colorGroup !== null) {
        gridUpdate.backgroundColor = DEFAULT_COLOR_SCHEME[rendererUpdate.colorGroup];
      }
      gridUpdatesList.push(gridUpdate);
    }

    gridWidget.updateGrid(gridUpdatesList);
  }

  updateEntireGrid(newMarkings, newLabels) {
    //
  }
}
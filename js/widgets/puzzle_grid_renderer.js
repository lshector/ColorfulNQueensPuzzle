import { MARKING_NONE, MARKING_X, MARKING_QUEEN, PuzzleGridState } from "./puzzle_grid_state.js";

export const DEFAULT_COLOR_SCHEME = [
  "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
  "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
  "#E6F389"
];

// Helper function to darken a color (adjust as needed)
function darkenColor(hex, factor) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.round(r * (1 - factor));
  g = Math.round(g * (1 - factor));
  b = Math.round(b * (1 - factor));

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

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
    this._colorScheme = DEFAULT_COLOR_SCHEME;
    this._darkenedColorScheme = [];
    for (const color of this._colorScheme) {
      this._darkenedColorScheme.push(darkenColor(color, 0.5));
    }
  }

  refresh() {
    if (!this._renderPending) {
      this._renderPending = true;
      this.render();

      setTimeout(() => { this._renderPending = false; }, this._renderPeriodMs);
    }
  }

  update(data) {
    this._pendingUpdates.push(data);
    this.refresh();
  }

  render() {
    // TODO: add updates for grid cell borders
    console.log(`Rendering ${this._pendingUpdates.length} updates...`);
    let gridUpdatesList = [];
    for (const rendererUpdate of this._pendingUpdates) {
      let [row, col] = [rendererUpdate.row, rendererUpdate.col];
      let gridUpdate = { row, col };
      if (rendererUpdate.marking !== undefined) {
        gridUpdate.centerLabel = MARKINGS_TO_TEXT[rendererUpdate.marking];
      }
      if (rendererUpdate.infoLabel !== undefined) {
        gridUpdate.topLeftLabel = rendererUpdate.infoLabel;
      }
      if (rendererUpdate.colorGroup !== undefined) {
        if (rendererUpdate.colorGroup === -1) {
          gridUpdate.backgroundColor = 'white';
        }
        else if (rendererUpdate.darken !== undefined && rendererUpdate.darken) {
          gridUpdate.backgroundColor = this._darkenedColorScheme[rendererUpdate.colorGroup];
        }
        else {
          gridUpdate.backgroundColor = this._colorScheme[rendererUpdate.colorGroup];
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
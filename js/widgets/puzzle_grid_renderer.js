import { MARKING_NONE, MARKING_X, MARKING_QUEEN, PuzzleGridState } from "./puzzle_grid_state.js";

export const DEFAULT_COLOR_SCHEME = [
  "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
  "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
  "#E6F389",

  "#80D2A0", // Forest green
  "#FF6640", // Coral orange
  "#66A3FF", // Sky blue
  "#40C9A0", // Teal
  "#E8E8E0", // Off-white
  "#998F7A", // Taupe
  "#A079E6", // Lavender
  "#FFB366", // Amber
  "#66B3CC", // Light cyan
  "#D966A0", // Rose
  "#C2E659", // Lime green
  "#66D980", // Mint green
  "#FF4D33", // Vermilion
  "#3380FF", // Cobalt blue
  "#33B399", // Blue-green
  "#C0C0B0", // Light gray
  "#807366", // Khaki
  "#8C66E6", // Violet
  "#FF9933", // Gold
  "#4DB3CC", // Turquoise
  "#CC4DA0", // Magenta
  "#AACC4D" // Olive
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
    this._renderPeriodMs = 1000;
    this._renderPending = false;
    this._lastRenderTime = 0;
    this._pendingUpdates = {};
    this._colorScheme = DEFAULT_COLOR_SCHEME;
    this._darkenedColorScheme = [];
    this._hideInfoLabel = true;
    for (const color of this._colorScheme) {
      this._darkenedColorScheme.push(darkenColor(color, 0.5));
    }
  }

  refresh() {
    if (!this._renderPending) {
      this._renderPending = true;
      requestAnimationFrame(() => {
          this.render();
          this._renderPending = false;
      });
    }
  }

  update(data) {
    const [row, col] = [data.row, data.col];
    const key = `${row},${col}`
    if (key in this._pendingUpdates) {
      // merge with existing cell update
      Object.assign(this._pendingUpdates[key], data);
    }
    else {
      // new cell update
      this._pendingUpdates[key] = data;
    }
    this.refresh();
  }

  render() {
    // TODO: add updates for grid cell borders
    console.log(`Rendering ${Object.keys(this._pendingUpdates).length} updates...`);
    let gridUpdatesList = [];
    Object.entries(this._pendingUpdates).forEach(([key, rendererUpdate]) => {
      let [row, col] = [rendererUpdate.row, rendererUpdate.col];
      let gridUpdate = { row, col };
      if (rendererUpdate.marking !== undefined) {
        gridUpdate.centerLabel = MARKINGS_TO_TEXT[rendererUpdate.marking];
      }
      if (rendererUpdate.infoLabel !== undefined && !this._hideInfoLabel) {
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
    });

    this._gridWidget.updateGrid(gridUpdatesList);
    this._pendingUpdates = {};
  }

  updateEntireGrid(newMarkings, newLabels) {
    //
  }
}
import { MARKING_NONE, MARKING_X, MARKING_QUEEN, PuzzleGridState } from "./puzzle_grid_state.js";

export const DEFAULT_COLOR_SCHEME = [
  "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
  "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
  "#E6F389",

  "#A0E6C2", // More green-teal
  "#FF8C69", // Brighter orange
  "#80B3FF", // Deeper blue
  "#50E3C2", // More turquoise
  "#E0E0E0", // Still neutral, but slightly different tone
  "#B0A890", // More brown-beige
  "#C099E6", // More violet
  "#FFD280", // More golden yellow
  "#90CED9", // More cyan-blue
  "#E699C2", // More magenta-pink
  "#E0F070", // More chartreuse
  "#99E6A0", // Brighter, more yellow-green
  "#FF7059", // Deeper, more red-orange
  "#70A3FF", // Deeper, more royal blue
  "#40D9B3", // Brighter, more intense turquoise
  "#D0D0D0", // Slightly darker gray
  "#A8A089", // More muted brown
  "#B390E0", // More periwinkle
  "#FFC270", // More mustard yellow
  "#89C0C9", // More desaturated cyan
  "#D990B3", // More rose pink
  "#D0E060" // More olive green
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
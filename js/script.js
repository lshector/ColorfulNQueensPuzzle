import { PuzzleGridWidget } from './widgets/puzzle_grid_widget.js'
import { PuzzleGridRenderer } from './widgets/puzzle_grid_renderer.js'
import { MARKING_NONE, PuzzleGridState } from './widgets/puzzle_grid_state.js';
import { MARKING_X, MARKING_QUEEN } from './widgets/puzzle_grid_state.js';

//import { ControlsWidget } from './widgets/controls_widget.js'


const GRID_LABELS = [
    [1, 1, 1, 7, 7, 7, 2, 2],
    [1, 1, 1, 7, 2, 2, 2, 0],
    [1, 1, 7, 7, 7, 0, 0, 0],
    [1, 7, 7, 0, 0, 0, 6, 3],
    [1, 7, 7, 7, 0, 0, 6, 6],
    [1, 1, 7, 5, 5, 6, 6, 6],
    [1, 4, 4, 4, 5, 5, 5, 6],
    [4, 4, 4, 5, 5, 5, 5, 5]
];
const SIZE = 8;

// let puzzleGridWidget = new PuzzleGridWidget(GRID_LABELS.length)
// puzzleGridWidget.setLabels(GRID_LABELS)

// let controlsWidget = new ControlsWidget(puzzleGridWidget)
// controlsWidget.buttons.info.click();

// Usage:
const puzzleGridWidget = PuzzleGridWidget.getInstance('grid-container');

// Initial setup:
puzzleGridWidget.resizeGrid(SIZE);

const puzzleGridRenderer = new PuzzleGridRenderer(new PuzzleGridState());

let updates = []
for (let i = 0; i < SIZE; ++i) {
  for (let j = 0; j < SIZE; ++j) {
    updates.push({
      row: i, col: j,
      marking: (i+j) % 3,
      colorGroup: GRID_LABELS[i][j]
    });
  }
}

puzzleGridRenderer.updateGrid(puzzleGridWidget, updates);

// // Update cells:
// puzzleGridWidget.updateGrid([
//   {
//     row: 0, col: 0,
//     backgroundColor: 'red'
//   },
//   {
//     row: 1, col: 4,
//     textContent: 'New Value'
//   },
//   {
//     row: 5, col: 8,
//     backgroundColor: 'blue',
//     color: 'white',
//     textContent: 'Updated',
//     borderRightWidth: '10px'
//   },
// ]);

// Resize later (will clear the grid):
//gridUpdater.resizeGrid(3, 7);

// Update cells after resize:
//gridUpdater.updateGrid([
//  { index: 2, color: 'green' },
//  { index: 8, content: 'Another Value' },
//]);

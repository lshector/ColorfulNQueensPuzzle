import { PuzzleGridWidget } from './widgets/puzzle_grid_widget.js'
import { ControlsWidget } from './widgets/controls_widget.js'


// const GRID_LABELS = [
//     [1, 1, 1, 7, 7, 7, 2, 2],
//     [1, 1, 1, 7, 2, 2, 2, 0],
//     [1, 1, 7, 7, 7, 0, 0, 0],
//     [1, 7, 7, 0, 0, 0, 6, 3],
//     [1, 7, 7, 7, 0, 0, 6, 6],
//     [1, 1, 7, 5, 5, 6, 6, 6],
//     [1, 4, 4, 4, 5, 5, 5, 6],
//     [4, 4, 4, 5, 5, 5, 5, 5]
// ];

// let puzzleGridWidget = new PuzzleGridWidget(GRID_LABELS.length)
// puzzleGridWidget.setLabels(GRID_LABELS)

// let controlsWidget = new ControlsWidget(puzzleGridWidget)
// controlsWidget.buttons.info.click();

// Usage:
const puzzleGridWidget = PuzzleGridWidget.getInstance('grid-container');

// Initial setup:
puzzleGridWidget.resizeGrid(10, 10); // Create a 5x10 grid

puzzleGridWidget.setOnClick((i , j) => {
  console.log(`User clicked at ${i},${j}`);

  if (i == 0 && j == 0) {
    console.log("Adapting the click");
    puzzleGridWidget.setOnClick((i , j) => {
      puzzleGridWidget.updateGrid([
        {
          row: i, col: j,
          backgroundColor: 'gray'
        }
      ]);
      console.log(`User REALLY clicked at ${i},${j}`);
    });
  }

  if (i == 1 && j == 1) {
    console.log("Reshaping the grid");
    puzzleGridWidget.resizeGrid(5, 5);
  }
});

// Update cells:
puzzleGridWidget.updateGrid([
  {
    row: 0, col: 0,
    backgroundColor: 'red'
  },
  {
    row: 1, col: 4,
    textContent: 'New Value'
  },
  {
    row: 5, col: 8,
    backgroundColor: 'blue',
    color: 'white',
    textContent: 'Updated',
    borderRightWidth: '10px'
  },
]);

// Resize later (will clear the grid):
//gridUpdater.resizeGrid(3, 7);

// Update cells after resize:
//gridUpdater.updateGrid([
//  { index: 2, color: 'green' },
//  { index: 8, content: 'Another Value' },
//]);

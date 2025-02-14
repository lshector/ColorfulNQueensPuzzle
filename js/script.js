import { PuzzleGridWidget } from './widgets/puzzle_grid_widget.js'
import { ControlsWidget } from './widgets/controls_widget.js'

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

let puzzleGridWidget = new PuzzleGridWidget(GRID_LABELS.length)
puzzleGridWidget.setLabels(GRID_LABELS)

let controlsWidget = new ControlsWidget(puzzleGridWidget)
controlsWidget.buttons.info.click();
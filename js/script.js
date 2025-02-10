import { PuzzleGrid } from './puzzle.js'
import { SelectModeControls } from './controls.js'

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

let puzzle = new PuzzleGrid(GRID_LABELS.length)
puzzle.setLabels(GRID_LABELS)

let selectModeControls = new SelectModeControls(puzzle)
selectModeControls.buttons.info.click();
import { PuzzleGrid } from "./widgets/puzzle_grid.js";
import { ControlsWidget } from "./widgets/controls_widget.js";

const DEFAULT_PUZZLE = [
    [1, 1, 1, 7, 7, 7, 2, 2],
    [1, 1, 1, 7, 2, 2, 2, 0],
    [1, 1, 7, 7, 7, 0, 0, 0],
    [1, 7, 7, 0, 0, 0, 6, 3],
    [1, 7, 7, 7, 0, 0, 6, 6],
    [1, 1, 7, 5, 5, 6, 6, 6],
    [1, 4, 4, 4, 5, 5, 5, 6],
    [4, 4, 4, 5, 5, 5, 5, 5]
];
let puzzleGrid = PuzzleGrid.getInstance('grid-container');
puzzleGrid.setAllColorGroups(DEFAULT_PUZZLE);

let puzzleControls = new ControlsWidget(puzzleGrid);
puzzleControls.buttons.info.click();
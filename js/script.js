import { init_grid } from './puzzle.js'
import './controls.js'

// List of 11 common colors
export const LABEL_COLORS = [
    "#B3DFA0", "#FE7B5F", "#96BDFE", "#62EFE9", "#DFDFDF",
    "#B9B29F", "#BBA3E1", "#FECA91", "#A3D2D8", "#DFA0BF",
    "#E6F389"
];

const grid_labels = [
    [1, 1, 1, 7, 7, 7, 2, 2],
    [1, 1, 1, 7, 2, 2, 2, 0],
    [1, 1, 7, 7, 7, 0, 0, 0],
    [1, 7, 7, 0, 0, 0, 6, 3],
    [1, 7, 7, 7, 0, 0, 6, 6],
    [1, 1, 7, 5, 5, 6, 6, 6],
    [1, 4, 4, 4, 5, 5, 5, 6],
    [4, 4, 4, 5, 5, 5, 5, 5]
];

const GRID_SIZE = 8; // Example grid size (NxN)

init_grid(GRID_SIZE, grid_labels, LABEL_COLORS)


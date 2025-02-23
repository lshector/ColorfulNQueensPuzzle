//import { solvePuzzleBacktracking } from "../algorithms/backtracking.js"
//import { solvePuzzleDeductive } from "../algorithms/deductive.js"
//import { PuzzleGenerator } from "../algorithms/generation.js"
//import { GameStepsWidget } from "./game_steps_widget.js"
//import { COLOR_GROUP_NONE } from "./puzzle_grid_state.js";

import { InfoMenuControls } from "./game_mode_controls/info_menu_controls.js";
import { PlayMenuControls } from "./game_mode_controls/play_menu_controls.js";
import { GenerateMenuControls } from "./game_mode_controls/generate_menu_controls.js";
import { SolveMenuControls } from "./game_mode_controls/solve_menu_controls.js";
import { UploadMenuControls } from "./game_mode_controls/upload_menu_controls.js";
import { EditMenuControls } from "./game_mode_controls/edit_menu_controls.js";

export class ControlsWidget {
    constructor(puzzleGrid) {
        this.puzzleGrid = puzzleGrid;

        this.buttons = {
            info: document.getElementById('infoButton'),
            play: document.getElementById('playButton'),
            generate: document.getElementById('generateButton'),
            solve: document.getElementById('solveButton'),
            upload: document.getElementById('uploadButton'),
            edit: document.getElementById('editButton'),
        };

        this.modes = {
            info: new InfoMenuControls(puzzleGrid),
            play: new PlayMenuControls(puzzleGrid),
            generate: new GenerateMenuControls(puzzleGrid),
            solve: new SolveMenuControls(puzzleGrid),
            upload: new UploadMenuControls(puzzleGrid),
            edit: new EditMenuControls(puzzleGrid),
        };

        for (const buttonName in this.buttons) {
            this.buttons[buttonName].addEventListener('click', () => this.setMode(buttonName));
        }
    }

    setMode(modeName) {
        // hide all menus
        for (const menu in this.modes) {
            this.modes[menu].hide();
        }

        // unselect all mode buttons
        for (const button in this.buttons) {
            this.buttons[button].classList.remove('selected');
        }

        const menu = this.modes[modeName];
        if (menu) {
            // configure controls according to the desired mode
            menu.show();
            this.buttons[modeName].classList.add('selected');
            this.puzzleGrid.clearMarkings();
            this.puzzleGrid.setOnClick(menu.onClick);
            this.puzzleGrid.render();
        } else {
            console.error(`Mode with name ${modeName} not found.`);
        }
    }
}

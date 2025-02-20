import { solvePuzzleBacktracking } from "../algorithms/backtracking.js"
import { solvePuzzleDeductive } from "../algorithms/deductive.js"
import { PuzzleGenerator } from "../algorithms/generation.js"
import { GameStepsWidget } from "./game_steps_widget.js"
import { COLOR_GROUP_NONE } from "./puzzle_grid_state.js";

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

class MenuControls {
    constructor(puzzleGrid, menuId) {
        this.puzzleGrid = puzzleGrid;
        this.menu = document.getElementById(menuId);
    }

    hide() {
        this.menu.style.display = 'none';
    }

    show() {
        this.menu.style.display = 'block';
    }

    onClick(puzzleGrid, row, col) {
        console.log(`Clicked on (${row}, ${col})`);
    }
}

class InfoMenuControls extends MenuControls {
    constructor(puzzleGrid) {
        super(puzzleGrid, 'info-menu');
    }
}

class PlayMenuControls extends MenuControls {
    constructor(puzzleGrid) {
        super(puzzleGrid, 'play-menu');

        this.hintButton = document.getElementById('hintButton');
        this.resetButton = document.getElementById('resetButton');
        this.resetButton.addEventListener('click', () => this.handleResetButtonClick());
    }

    handleResetButtonClick() {
        const confirmed = confirm("Reset your progress in trying to solve the puzzleGrid?");
        if (confirmed) {
            this.puzzleGrid.clearMarkings();
            this.puzzleGrid.render();
        }
    }

    onClick(puzzleGrid, row, col) {
        // TODO: check if the move is valid given current conflicting cells

        // make the move
        const NUM_MARKINGS = 3; // TODO: shouldn't have this constant defined here
        const currMarking = puzzleGrid.getMarkingAt(row, col);
        const newMarking = (currMarking + 1) % NUM_MARKINGS;
        console.log(`Cycling marking at ${row}, ${col} from ${currMarking} to ${newMarking}`);

        puzzleGrid.setMarkingAt(row, col, newMarking);

        // TODO: update highlighted cells

        puzzleGrid.render();

        // check if puzzle is complete
    }
}

class GenerateMenuControls extends MenuControls {
    constructor(puzzleGrid) {
        super(puzzleGrid, 'generate-menu');
        this.stepsWidget = new GameStepsWidget('game-steps-container-generate', this.puzzleGrid);

        this.sizeInput = this.menu.querySelector('#size');
        this.seedInput = this.menu.querySelector('#seed');
        this.maxAttemptsInput = this.menu.querySelector('#max-attempts');
        this.batchInput = this.menu.querySelector('#batch');

        this.generateButton = this.menu.querySelector('.button');
        this.generateButton.addEventListener('click', () => {
            const N = parseInt(this.sizeInput.value);
            const seed = this.seedInput.value || 'colored-n-queens';
            const maxAttempts = parseInt(this.maxAttemptsInput.value) || 1000;
            const batch = parseInt(this.batchInput.value) || 1;

            this.generatePuzzle(N, seed, maxAttempts, batch);
        });
    }

    async generatePuzzle(N, seed, maxAttempts, batch) {
        console.log(`Generating puzzleGrid with N=${N}, seed='${seed}', maxAttempts=${maxAttempts}, batch=${batch}`);

        const generator = new PuzzleGenerator();

        this.stepsWidget.clearSteps();
        try {
            const result = await generator.run(N, this.stepsWidget, seed, maxAttempts);

            console.log("Puzzle generated successfully:", result.puzzleGrid);
            console.log("Stats:", result.stats);
            //console.log("Event Log:", eventLog);
            this.puzzleGrid = result.puzzleGrid;

            console.log(result)

            console.log(result)

            this.stepsWidget.puzzleGrid = this.puzzleGrid;
            this.stepsWidget.updateSliderMax();
        } catch (error) {
            console.error("Puzzle generation failed:", error);
            alert("Puzzle generation failed. See console for details.");
        }
    }
}

class SolveMenuControls extends MenuControls {
    constructor(puzzleGrid) {
        super(puzzleGrid, 'solve-menu');
        this.stepsWidget = new GameStepsWidget('game-steps-container-solve', this.puzzleGrid);

        this.backtrackingButton = document.getElementById('backtrackingButton');
        this.deductiveButton = document.getElementById('deductiveButton');

        this.backtrackingButton.addEventListener('click', () => this.runAlgorithm('backtracking'));
        this.deductiveButton.addEventListener('click', () => this.runAlgorithm('deductive'));

        this.selectedAlgorithm = 'backtracking';
    }

    runAlgorithm(algorithm) {
        this.selectedAlgorithm = algorithm;
        this.puzzleGrid.clearState();
        this.stepsWidget.clearSteps();

        if (algorithm === 'backtracking') {
            const result = solvePuzzleBacktracking(this.puzzleGrid.N, this.puzzleGrid.labels, this.stepsWidget);

            if (result.solved) {
                console.log("Solution found:", result.solution);
            } else {
                console.log("No solution found.");
            }

            this.stepsWidget.updateSliderMax();
        } else if (algorithm === 'deductive') {
            const result = solvePuzzleDeductive(this.puzzleGrid, this.stepsWidget);

            if (result.solved) {
                console.log("Solution found:", result.solution);
            } else {
                console.log("No solution found.");
            }

            this.stepsWidget.updateSliderMax();
        }
    }
}

class UploadMenuControls extends MenuControls {
    constructor(puzzleGrid) {
        super(puzzleGrid, 'upload-menu');
        // Add upload-specific logic here if needed
    }
}

class EditMenuControls extends MenuControls {
    constructor(puzzleGrid) {
        super(puzzleGrid, 'edit-menu');
        this.clearGridButton = document.getElementById('clearGridButton');
        this.clearGridButton.addEventListener('click', () => this.handleClearGridButtonClick());
    }

    handleClearGridButtonClick() {
        const confirmed = confirm("Clear all color group assignments?");
        if (confirmed) {
            this.puzzleGrid.clearColorGroups();
            this.puzzleGrid.render();
        }
    }

    onClick(puzzleGrid, row, col) {
        // cycle through color groups
        const currColor = puzzleGrid.getColorGroupAt(row, col);
        const newColor = (currColor === puzzleGrid.size()-1) ? COLOR_GROUP_NONE : (currColor + 1);
        console.log(`Cycling color group at ${row}, ${col} from ${currColor} to ${newColor}`);

        puzzleGrid.setColorGroupAt(row, col, newColor);
        puzzleGrid.render();
    }
}
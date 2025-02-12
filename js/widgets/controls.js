import { solvePuzzleBacktracking } from "../algorithms/backtracking.js"
import { solvePuzzleDeductive } from "../algorithms/deductive.js"
import { PuzzleGenerator } from "../algorithms/generation.js"
import { GameStepsWidget } from "./game_steps_widget.js"

export class SelectModeControls {
    constructor(puzzle) {
        this.puzzle = puzzle;

        this.buttons = {
            info: document.getElementById('infoButton'),
            play: document.getElementById('playButton'),
            generate: document.getElementById('generateButton'),
            solve: document.getElementById('solveButton'),
            upload: document.getElementById('uploadButton'),
            edit: document.getElementById('editButton'),
        };

        this.menus = { // Use a more descriptive name
            info: new InfoMenuControls(puzzle),
            play: new PlayMenuControls(puzzle),
            generate: new GenerateMenuControls(puzzle),
            solve: new SolveMenuControls(puzzle),
            upload: new UploadMenuControls(puzzle),
            edit: new EditMenuControls(puzzle),
        };

        for (const buttonName in this.buttons) {
            this.buttons[buttonName].addEventListener('click', () => this.showMenu(buttonName));
        }
    }

    showMenu(menuName) {
        this.hideAllMenus();
        this.unselectAllButtons();

        const menu = this.menus[menuName]; // Get menu reference

        if (menu) {
            menu.show();
            this.buttons[menuName].classList.add('selected');
        } else {
            console.error(`Menu with name ${menuName} not found.`);
        }

        this.puzzle.currentMode = menuName;
    }

    hideAllMenus() {
        for (const menu in this.menus) {
            this.menus[menu].hide();
        }
    }

    unselectAllButtons() {
        for (const button in this.buttons) {
            this.buttons[button].classList.remove('selected');
        }
    }
}

// Abstract base class for Menu Controls (DRY principle)
class MenuControls {
    constructor(puzzle, menuId) {
        this.puzzle = puzzle;
        this.menu = document.getElementById(menuId);
    }

    hide() {
        this.menu.style.display = 'none';
    }

    show() {
        this.menu.style.display = 'block';
    }
}

class InfoMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'info-menu'); // Call the super constructor
    }
}

class PlayMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'play-menu'); // Call the super constructor
        this.resetButton = document.getElementById('resetButton');
        this.hintButton = document.getElementById('hintButton');

        this.resetButton.addEventListener('click', () => this.handleResetButtonClick());
    }

    handleResetButtonClick() {
        const confirmed = confirm("Reset your progress in trying to solve the puzzle?");
        if (confirmed) {
            this.puzzle.clearState();
        }
    }
}

class GenerateMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'generate-menu');
        this.stepsWidget = new GameStepsWidget('game-steps-container-generate', this.puzzle);
        this.generateButton = this.menu.querySelector('.button'); // Use this.menu here!
        this.sizeInput = this.menu.querySelector('#size');      // Use this.menu here!
        this.seedInput = this.menu.querySelector('#seed');
        this.maxAttemptsInput = this.menu.querySelector('#max-attempts');
        this.batchInput = this.menu.querySelector('#batch');

        this.generateButton.addEventListener('click', () => {
            const N = parseInt(this.sizeInput.value);
            const seed = this.seedInput.value || 'colored-n-queens';
            const maxAttempts = parseInt(this.maxAttemptsInput.value) || 1000;
            const batch = parseInt(this.batchInput.value) || 1;

            this.generatePuzzle(N, seed, maxAttempts, batch);
        });
    }

    async generatePuzzle(N, seed, maxAttempts, batch) {
        console.log(`Generating puzzle with N=${N}, seed='${seed}', maxAttempts=${maxAttempts}, batch=${batch}`);

        const generator = new PuzzleGenerator();

        this.stepsWidget.clearSteps();
        try {
            const result = await generator.run(N, this.stepsWidget, seed, maxAttempts);

            console.log("Puzzle generated successfully:", result.puzzle);
            console.log("Stats:", result.stats);
            //console.log("Event Log:", eventLog);
            this.puzzle = result.puzzle;

            console.log(result)

            console.log(result)

            this.stepsWidget.puzzle = this.puzzle;
            this.stepsWidget.updateSliderMax();
        } catch (error) {
            console.error("Puzzle generation failed:", error);
            alert("Puzzle generation failed. See console for details.");
        }
    }
}

class SolveMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'solve-menu');
        this.stepsWidget = new GameStepsWidget('game-steps-container-solve', this.puzzle);

        this.backtrackingButton = document.getElementById('backtrackingButton');
        this.deductiveButton = document.getElementById('deductiveButton');

        this.backtrackingButton.addEventListener('click', () => this.runAlgorithm('backtracking'));
        this.deductiveButton.addEventListener('click', () => this.runAlgorithm('deductive'));

        this.selectedAlgorithm = 'backtracking';
    }

    runAlgorithm(algorithm) {
        this.selectedAlgorithm = algorithm;
        this.puzzle.clearState();
        this.stepsWidget.clearSteps();

        if (algorithm === 'backtracking') {
            const result = solvePuzzleBacktracking(this.puzzle.N, this.puzzle.labels, this.stepsWidget);

            if (result.solved) {
                console.log("Solution found:", result.solution);
            } else {
                console.log("No solution found.");
            }

            this.stepsWidget.updateSliderMax();
        } else if (algorithm === 'deductive') {
            const result = solvePuzzleDeductive(this.puzzle, this.stepsWidget);

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
    constructor(puzzle) {
        super(puzzle, 'upload-menu');
        // Add upload-specific logic here if needed
    }
}

class EditMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'edit-menu');
        this.clearGridButton = document.getElementById('clearGridButton'); // Direct reference
        this.clearGridButton.addEventListener('click', () => this.handleClearGridButtonClick());
    }

    handleClearGridButtonClick() {
        const confirmed = confirm("Clear all puzzle labels?");
        if (confirmed) {
            this.puzzle.clearLabels();
        }
    }
}
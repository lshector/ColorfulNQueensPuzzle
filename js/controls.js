import { solvePuzzleBacktracking, solvePuzzleDeductive } from "./solvers.js"

function createAlgorithmStepsWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container element not found:", containerId);
        return;
    }

    // Load the HTML template (using a fetch request or by adding it directly to the page)
    fetch('html/algorithm_steps_widget.html')
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html; // Add the widget HTML to the container

            // Initialize widget elements (after they are in the DOM):
            const widget = container.querySelector('.algorithm-steps-widget');
            const minusButton = widget.querySelector('.minus-button');
            const playButton = widget.querySelector('.play-button');
            const plusButton = widget.querySelector('.plus-button');
            const slider = widget.querySelector('.step-slider');
            const sliderValue = widget.querySelector('.slider-value');

            // Add event listeners (widget logic)
            slider.addEventListener('input', () => {
                sliderValue.value = slider.value;
            });

            minusButton.addEventListener('click', () => {
                slider.value = Math.max(parseInt(slider.value) - 1, 0);
                sliderValue.value = slider.value;
            });

            plusButton.addEventListener('click', () => {
                slider.value = Math.min(parseInt(slider.value) + 1, 100);
                sliderValue.value = slider.value;
            });

            playButton.addEventListener('click', () => {
                console.log("Play button clicked. Value:", slider.value, "in container:", containerId);
                // Implement your play logic here, specific to this widget instance
            });
        });
}

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

        if (menuName === 'play') {
            this.puzzle.clickResponse = 'setState';
        }
        else if (menuName === 'edit') {
            this.puzzle.clickResponse = 'setLabel';
        }
        else {
            this.puzzle.clickResponse = 'none';
        }
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
        createAlgorithmStepsWidget('alg-steps-container-generate');
    }
}

class SolveMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'solve-menu');
        createAlgorithmStepsWidget('alg-steps-container-solve');

        this.backtrackingButton = document.getElementById('backtrackingButton');
        this.deductiveButton = document.getElementById('deductiveButton');

        this.backtrackingButton.addEventListener('click', () => this.selectAlgorithm('backtracking'));
        this.deductiveButton.addEventListener('click', () => this.selectAlgorithm('deductive'));

        this.selectedAlgorithm = 'backtracking';
    }

    selectAlgorithm(algorithm) {
        this.selectedAlgorithm = algorithm;
        this.puzzle.clearState();

        if (algorithm === 'backtracking') {
            const result = solvePuzzleBacktracking(this.puzzle.N, this.puzzle.labels);

            if (result.solved) {
                console.log("Solution found:", result.solution);
                this.puzzle.setSolution(result.solution);
            } else {
                console.log("No solution found.");
            }
        } else if (algorithm === 'deductive') {
            solvePuzzleDeductive(this.puzzle);
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
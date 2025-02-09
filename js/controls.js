export class SelectModeControls {
    constructor(puzzle) {
        this.puzzle = puzzle;

        this.buttons = {
            play: document.getElementById('playButton'),
            generate: document.getElementById('generateButton'),
            solve: document.getElementById('solveButton'),
            upload: document.getElementById('uploadButton'),
            edit: document.getElementById('editButton'),
        };

        this.menus = { // Use a more descriptive name
            play: new PlayMenuControls(puzzle),
            generate: new GenerateMenuControls(puzzle),
            solve: new SolveMenuControls(puzzle),
            upload: new UploadMenuControls(puzzle),
            edit: new EditMenuControls(puzzle),
        };

        for (const buttonName in this.buttons) { // More efficient loop
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

class PlayMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'play-menu'); // Call the super constructor
    }
}

class GenerateMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'generate-menu');
        // Add generate-specific logic here if needed
    }
}

class SolveMenuControls extends MenuControls {
    constructor(puzzle) {
        super(puzzle, 'solve-menu');
        this.backtrackingButton = document.getElementById('backtrackingButton');
        this.deductiveButton = document.getElementById('deductiveButton');

        this.backtrackingButton.addEventListener('click', () => this.selectAlgorithm('backtracking'));
        this.deductiveButton.addEventListener('click', () => this.selectAlgorithm('deductive'));

        this.selectedAlgorithm = 'backtracking';
    }

    selectAlgorithm(algorithm) {
        this.selectedAlgorithm = algorithm;

        this.backtrackingButton.classList.remove('selected');
        this.deductiveButton.classList.remove('selected');

        if (algorithm === 'backtracking') {
            this.backtrackingButton.classList.add('selected');
        } else if (algorithm === 'deductive') {
            this.deductiveButton.classList.add('selected');
        }
    }

    solvePuzzleBacktracking() {
        console.log("Solving puzzle using backtracking...");
        this.solvePuzzleBacktracking();
    }

    solvePuzzleDeductive() {
        console.log("Solving puzzle using deduction...");
        this.solvePuzzleDeductive();
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
        this.clearGridButton.addEventListener('click', () => this.puzzle.clearLabels());
    }
}
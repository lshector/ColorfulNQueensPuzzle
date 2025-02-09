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

        this.menuElements = {
            play: new PlayMenuControls(puzzle),
            generate: new GenerateMenuControls(puzzle),
            solve: new SolveMenuControls(puzzle),
            upload: new UploadMenuControls(puzzle),
            edit: new EditMenuControls(puzzle),
        };

        playButton.addEventListener('click', () => this.showMenu('play'));
        generateButton.addEventListener('click', () => this.showMenu('generate'));
        solveButton.addEventListener('click', () => this.showMenu('solve'));
        uploadButton.addEventListener('click', () => this.showMenu('upload'));
        editButton.addEventListener('click', () => this.showMenu('edit'));
    }

    showMenu(menuName) {
        this.hideAllMenus();
        this.unselectAllButtons(); // Clear previous selections

        if (this.menuElements[menuName]) {
            this.menuElements[menuName].show();

            if (this.buttons[menuName]) {
                this.buttons[menuName].classList.add('selected');
            }
        } else {
            console.error(`Menu with name ${menuName} not found.`);
        }

        this.puzzle.clickResponseEnabled = menuName === 'play';
    }

    hideAllMenus() {
        for (const menu in this.menuElements) {
            this.menuElements[menu].hide();
        }
    }

    unselectAllButtons() {  // Helper function to clear button styles
        for (const button in this.buttons) {
            this.buttons[button].classList.remove('selected');
        }
    }
}

class PlayMenuControls {
    constructor(puzzle) {
        this.puzzle = puzzle
        this.menu = document.getElementById('play-menu');
    }

    hide() {
        this.menu.style.display = 'none';
    }

    show() {
        this.menu.style.display = 'block';
    }
}

class GenerateMenuControls {
    constructor(puzzle) {
        this.puzzle = puzzle
        this.menu = document.getElementById('generate-menu');
    }

    hide() {
        this.menu.style.display = 'none';
    }

    show() {
        this.menu.style.display = 'block';
    }
}

class SolveMenuControls {
    constructor(puzzle) {
        this.puzzle = puzzle
        this.menu = document.getElementById('solve-menu');

        this.backtrackingButton = document.getElementById('backtrackingButton')
        this.deductiveButton = document.getElementById('deductiveButton')
        
        
        this.backtrackingButton.addEventListener('click', () => this.selectAlgorithm('backtracking'));
        this.deductiveButton.addEventListener('click', () => this.selectAlgorithm('deductive'));
        
        this.selectedAlgorithm = 'backtracking'; // Initial selection
    }

    hide() {
        this.menu.style.display = 'none';
    }

    show() {
        this.menu.style.display = 'block';
    }

    selectAlgorithm(algorithm) {
        this.selectedAlgorithm = algorithm;

        this.backtrackingButton.classList.remove('selected');
        this.deductiveButton.classList.remove('selected');

        if (algorithm === 'backtracking') {
            this.backtrackingButton.classList.add('selected');
            this.solvePuzzleBacktracking();
        } else if (algorithm === 'deductive') {
            this.deductiveButton.classList.add('selected');
            this.solvePuzzleDeductive();
        }
    }

    solvePuzzleBacktracking() {
        console.log("Solving puzzle using backtracking...")
    }

    solvePuzzleDeductive() {
        console.log("Solving puzzle using deduction...")
    }
}

class UploadMenuControls {
    constructor(puzzle) {
        this.puzzle = puzzle
        this.menu = document.getElementById('upload-menu');
    }

    hide() {
        this.menu.style.display = 'none';
    }

    show() {
        this.menu.style.display = 'block';
    }
}

class EditMenuControls {
    constructor(puzzle) {
        this.puzzle = puzzle
        this.menu = document.getElementById('edit-menu');

        this.buttons = {
            clearGrid: document.getElementById('clearGridButton'),
        };

        this.buttons.clearGrid.addEventListener('click', () => this.puzzle.clearLabels());
    }

    hide() {
        this.menu.style.display = 'none';
    }

    show() {
        this.menu.style.display = 'block';
    }
}

const playButton = document.getElementById('playButton');
const generateButton = document.getElementById('generateButton');

const solveButton = document.getElementById('solveButton');
const solvePuzzleButton = document.getElementById('solvePuzzleButton');

const uploadButton = document.getElementById('uploadButton');
const editButton = document.getElementById('editButton');

const playMenu = document.getElementById('play-menu');
const generateMenu = document.getElementById('generate-menu');
const solveMenu = document.getElementById('solve-menu');
const uploadMenu = document.getElementById('upload-menu');
const editMenu = document.getElementById('edit-menu');
const defaultMessage = document.getElementById('default-message');

export class PuzzleControls {
    constructor(puzzle) {
        this.puzzle = puzzle;
        this.menuElements = {
            play: playMenu,
            generate: generateMenu,
            solve: solveMenu,
            upload: uploadMenu,
            edit: editMenu,
            default: defaultMessage,
        };

        this.buttons = { // Store buttons for easy access and styling
            play: playButton,
            generate: generateButton,
            solve: solveButton,
            solvePuzzle: solvePuzzleButton,
            upload: uploadButton,
            edit: editButton,
        };

        playButton.addEventListener('click', () => this.handlePlayClick());
        generateButton.addEventListener('click', () => this.handleGenerateClick());
        solveButton.addEventListener('click', () => this.handleSolveClick());
        solvePuzzleButton.addEventListener('click', () => this.handleSolvePuzzleButtonClick());
        uploadButton.addEventListener('click', () => this.handleUploadClick());
        editButton.addEventListener('click', () => this.handleEditClick());

        playButton.click(); // Start in play mode
    }

    handlePlayClick() {
        this.showMenu('play');
    }

    handleGenerateClick() {
        this.showMenu('generate');
        const sizeInput = document.getElementById('size');
        sizeInput.addEventListener('change', () => {
            console.log("New Grid Size:", sizeInput.value);
        });
    }

    handleSolveClick() {
        this.showMenu('solve');
    }
    
    handleSolvePuzzleButtonClick() {
        // Implement your puzzle solving logic here
        this.puzzle.clearState();
        console.log("Solving the puzzle...");
        // ... your code to solve the puzzle ...
    }

    handleUploadClick() {
        this.showMenu('upload');
        const fileElem = document.getElementById("fileElem");
        fileElem.addEventListener("change", this.handleFiles.bind(this), false);
    }

    handleEditClick() {
        this.showMenu('edit');
    }

    showMenu(menuName) {
        this.hideAllMenus();
        this.unselectAllButtons(); // Clear previous selections

        if (this.menuElements[menuName]) {
            this.menuElements[menuName].style.display = 'block';
            if (this.buttons[menuName]) { // Style the selected button
                this.buttons[menuName].classList.add('selected'); // Add a 'selected' class
            }
        } else {
            console.error(`Menu with name ${menuName} not found.`);
        }

        this.puzzle.clickResponseEnabled = menuName === 'play';
    }

    hideAllMenus() {
        for (const menu in this.menuElements) {
            this.menuElements[menu].style.display = 'none';
        }
    }

    unselectAllButtons() {  // Helper function to clear button styles
        for (const button in this.buttons) {
            this.buttons[button].classList.remove('selected');
        }
    }

    handleFiles(e) {
        const fileList = e.target.files;
        console.log(fileList);
    }
}

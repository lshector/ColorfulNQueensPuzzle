import { MenuControls }from "./menu_controls.js";

export class PlayMenuControls extends MenuControls {
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

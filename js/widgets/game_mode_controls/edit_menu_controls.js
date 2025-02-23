import { MenuControls }from "./menu_controls.js";

export class EditMenuControls extends MenuControls {
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
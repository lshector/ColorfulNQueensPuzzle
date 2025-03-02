export class MenuControls {
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

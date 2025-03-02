import { MenuControls } from "./menu_controls.js";
import { GameStepsWidget } from "../game_steps_widget.js";
import { solvePuzzleBacktracking } from "../../algorithms/backtracking.js"
import { solvePuzzleDeductive } from "../../algorithms/deductive.js"

export class SolveMenuControls extends MenuControls {
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
        this.stepsWidget.clearSteps();
        this.puzzleGrid.clearMarkings();
        this.stepsWidget.toggleEnableReplay(false);
        if (algorithm === 'backtracking') {
            const result = solvePuzzleBacktracking(this.puzzleGrid, this.stepsWidget);

            if (result.solved) {
                console.log("Solution found:", result.solution);
            } else {
                console.log("No solution found.");
            }
        } else if (algorithm === 'deductive') {
            const result = solvePuzzleDeductive(this.puzzleGrid, this.stepsWidget);

            if (result.solved) {
                console.log("Solution found:", result.solution);
            } else {
                console.log("No solution found.");
            }
        }
        this.stepsWidget.toggleEnableReplay(true);
        this.puzzleGrid.render();
    }
}

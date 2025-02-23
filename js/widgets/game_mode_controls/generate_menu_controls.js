import { MenuControls }from "./menu_controls.js";
import { GameStepsWidget } from "../game_steps_widget.js";
import { PuzzleGenerator } from "../../algorithms/generation.js";

export class GenerateMenuControls extends MenuControls {
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

        this.stepsWidget.clearSteps();
        this.stepsWidget.toggleEnableReplay(false);
        try {
            const generator = new PuzzleGenerator(this.puzzleGrid);
            const stats = generator.run(N, this.stepsWidget, seed, maxAttempts);
            console.log("Puzzle generated successfully:", this.puzzleGrid);
            console.log("Stats:", stats);
        } catch (error) {
            console.error("Puzzle generation failed:", error);
            alert("Puzzle generation failed. See console for details.");
        }
        this.stepsWidget.toggleEnableReplay(true);
    }
}


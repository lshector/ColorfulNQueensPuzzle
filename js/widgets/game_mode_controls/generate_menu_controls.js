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

        const generator = new PuzzleGenerator();

        this.stepsWidget.clearSteps();
        try {
            const result = await generator.run(N, this.stepsWidget, seed, maxAttempts);

            console.log("Puzzle generated successfully:", result.puzzleGrid);
            console.log("Stats:", result.stats);
            //console.log("Event Log:", eventLog);
            this.puzzleGrid = result.puzzleGrid;

            console.log(result)

            this.stepsWidget.puzzleGrid = this.puzzleGrid;
        } catch (error) {
            console.error("Puzzle generation failed:", error);
            alert("Puzzle generation failed. See console for details.");
        }
    }
}


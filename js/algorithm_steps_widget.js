export class AlgorithmStepsWidget {
    constructor(containerId, steps, puzzle) {
        this.containerId = containerId;
        this.steps = steps;
        this.puzzle = puzzle;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error("Container not found:", containerId);
            return;
        }

        this.playing = false;
        this.intervalId;

        this.loadHTML().then(() => {  // Load HTML and THEN initialize
          this.initialize();
        });
    }

    loadHTML() {
        return fetch('html/algorithm_steps_widget.html')
            .then(response => response.text())
            .then(html => {
                this.container.innerHTML = html; // Add the widget HTML
                // Now that HTML is loaded, get element references:
                this.slider = this.container.querySelector('.step-slider');
                this.sliderValue = this.container.querySelector('.slider-value');
                this.playButton = this.container.querySelector('.play-button');
                this.plusButton = this.container.querySelector('.plus-button');
                this.minusButton = this.container.querySelector('.minus-button');
                this.stepsText = this.container.querySelector('.algorithm-steps-text');

                if (!this.slider || !this.sliderValue || !this.playButton || !this.plusButton || !this.minusButton || !this.stepsText) {
                    console.error("Required elements not found in container:", this.containerId);
                    return Promise.reject("Elements not found"); // Reject if elements missing

                }
            }).catch(error => {
              console.error("Error loading HTML or elements:", error);
            });
    }

    initialize() {
        this.updateSliderMax();
        this.initializeSlider();
        this.initializePlayButton();
    }

    updateSliderValue(new_value) {
        this.slider.value = new_value;
        this.sliderValue.value = new_value;
        this.updatePuzzleState(new_value);
    }

    updateSliderMax() {
        if (this.steps && this.steps.length > 0) {
            this.slider.max = this.steps.length - 1;
            this.updateSliderValue(this.slider.max);
        } else {
            this.slider.max = 0;
            this.updateSliderValue(0);
        }
    }

    initializeSlider() {
        this.slider.addEventListener('input', () => this.handleSliderInput());
        this.plusButton.addEventListener('click', () => this.handlePlusMinusClick(1));
        this.minusButton.addEventListener('click', () => this.handlePlusMinusClick(-1));
    }

    handleSliderInput() {
        if (this.playing) {
            this.interruptPlay();
        }
        const stepIndex = parseInt(this.slider.value);
        this.updateSliderValue(stepIndex);
    }

    handlePlusMinusClick(direction) {
        this.interruptPlay();
        let stepIndex = parseInt(this.slider.value);
        const maxStep = this.steps.length - 1;
        stepIndex = Math.max(0, Math.min(stepIndex + direction, maxStep));
        this.updateSliderValue(stepIndex);
    }


    initializePlayButton() {
        this.playButton.addEventListener('click', () => {
            this.playing = !this.playing;

            if (this.playing) {
                if (this.steps.length === 0) {
                    return;
                }

                this.playButton.textContent = "⏸";
                let currentStep = parseInt(this.slider.value);
                const totalSteps = this.steps.length - 1;
                const stepIncrementPercent = 0.01; // Customizable
                const frameDelay = 100; // Customizable

                if (currentStep === totalSteps) {
                    currentStep = 0;
                }

                this.intervalId = setInterval(() => {
                    const stepIncrement = Math.ceil(totalSteps * stepIncrementPercent);
                    currentStep = Math.min(currentStep + stepIncrement, totalSteps);

                    this.updateSliderValue(currentStep);

                    if (currentStep === totalSteps) {
                        this.interruptPlay();
                    }
                }, frameDelay);
            } else {
                this.interruptPlay();
            }
        });
    }

    interruptPlay() {
        clearInterval(this.intervalId);
        this.playing = false;
        this.playButton.textContent = "▶";
    }

    updatePuzzleState(stepIndex) {
        const N = this.puzzle.N;

        if (this.steps.length === 0) {
            return;
        }

        let stepsText = this.stepsText;
        function appendLineToSteps(newLine) {
            stepsText.value += (stepsText.value ? '\n' : '') + newLine; // Add newline if text exists
            stepsText.scrollTop = stepsText.scrollHeight;
        }
        stepsText.value = "";

        this.puzzle.clearState();
        for (let i = 0; i <= stepIndex; i++) {
            const step = this.steps[i];
            if (step.action === "Place Queen") {
                this.puzzle.placeQueenFromSolver(step.row, step.col);
                appendLineToSteps(`Placed queen at (${step.row}, ${step.col})`);
            } else if (step.action === "Backtrack") {
                this.puzzle.removeQueenFromSolver(step.row, step.col);
                appendLineToSteps(`Backtracking by removing queen from (${step.row}, ${step.col})`);
            } else if (step.action === "addConstraintToRow") {
                this.puzzle.addConstraintToRow(step.row, step.excludeColors);
                appendLineToSteps(`Marking all cells in row ${step.row} excluding colors: ${step.excludeColors}`);
            } else if (step.action === "addConstraintToColumn") {
                this.puzzle.addConstraintToColumn(step.col, step.excludeColors);
                appendLineToSteps(`Marking all cells in col ${step.col} excluding colors: ${step.excludeColors}`);
            } else if (step.action === "addConstraintToCell") {
                this.puzzle.addConstraintToCell(step.row, step.col);
                appendLineToSteps(`Marking cell (${step.row}, ${step.col})`);
            }
        }

        this.puzzle.refreshAppearanceAllCells();
    }
}

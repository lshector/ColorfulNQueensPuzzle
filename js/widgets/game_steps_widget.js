export class GameStep {
    constructor(action, note, args) {
        this.action = null;
        this.note = null;
        this.args = null;
    }
}

export class GameStepsWidget {
    constructor(containerId, puzzle) {
        this.containerId = containerId;
        this.steps = [];
        this.puzzle = puzzle;
        this.container = document.getElementById(containerId);
        this.animationFrameId = null;

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

    push(data) {
        this.steps.push(data);
    }

    clearSteps() {
        this.steps = [];
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
                this.stepsText = this.container.querySelector('.game-steps-text');

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

    updateSliderValue(newValue) {
        //const prevValue = this.slider.value;
        this.slider.value = newValue;
        this.sliderValue.value = newValue;
        this.updatePuzzleState(newValue);
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


    initializePlayButton(animationSpeed = 100) {
        this.playButton.addEventListener('click', () => {
            this.playing = !this.playing;
    
            if (this.playing) {
                if (this.steps.length === 0) {
                    return;
                }
    
                this.playButton.textContent = "⏸";
                let currentStep = parseInt(this.slider.value);
                const totalSteps = this.steps.length - 1;
    
                if (currentStep === totalSteps) {
                    currentStep = 0;
                }
    
                let startTime;
    
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp; // Initialize startTime on the first frame
                    const elapsedTime = timestamp - startTime;
    
                    if (elapsedTime >= animationSpeed) {
                        startTime = timestamp; // Reset startTime for the next step
                        currentStep++;
    
                        if (currentStep > totalSteps) {
                            this.interruptPlay();
                            return;
                        }
    
                        this.updateSliderValue(currentStep);
    
                        if (currentStep === totalSteps) {
                            this.interruptPlay();
                        }
                    }
    
                    this.animationFrameId = requestAnimationFrame(animate);
                };
    
                this.animationFrameId = requestAnimationFrame(animate);
    
            } else {
                this.interruptPlay();
            }
        });
    }
    
    interruptPlay() {
        console.log("Interrupting play");
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = null;
        this.playButton.textContent = "▶️";
        this.playing = false;
    }    

    updatePuzzleState(stepIndex) {
        if (this.steps.length === 0) return;
    
        const N = this.puzzle.N;
        const stepsText = this.stepsText;
        stepsText.value = ""; // Clear steps text
    
        const appendLine = (newLine) => {
            stepsText.value += (stepsText.value ? '\n' : '') + newLine;
            stepsText.scrollTop = stepsText.scrollHeight;
        };
    
        const handleBeginSolver = () => {
            this.puzzle.clearState();
            return new Set();
        }

        const handleBeginGeneration = () => {
            this.puzzle.clearState();
            this.puzzle.clearLabels();
            return new Set();
        }

        const handleDone = () => {
            return new Set();
        }

        for (let i = 0; i <= stepIndex; i++) {
            const step = this.steps[i];
            this.puzzle.highlightedCells = new Set();
    
            const actionHandlers = {
                "Begin Solver": () => handleBeginSolver(),
                "Begin Generation": () => handleBeginGeneration(),
                "Place Queen": () => this.puzzle.placeQueenFromSolver(step.row, step.col),
                "Backtrack": () => this.puzzle.removeQueenFromSolver(step.row, step.col),
                "addConstraintToRows": () => this.puzzle.addConstraintToRows(step.rows, step.excludeColors),
                "addConstraintToColumns": () => this.puzzle.addConstraintToColumns(step.cols, step.excludeColors),
                "addConstraintToCell": () => this.puzzle.addConstraintToCell(step.row, step.col),
                "removeConstraintFromRows": () => this.puzzle.removeConstraintFromRows(step.rows),
                "removeConstraintFromColumns": () => this.puzzle.removeConstraintFromColumns(step.cols),
                "removeConstraintFromCell": () => this.puzzle.removeConstraintFromCell(step.row, step.col),
                "paintCell": () => this.puzzle.setLabel(step.row, step.col, step.label),
                "unpaintCell": () => this.puzzle.setLabel(step.row, step.col, -1),
                "clearLabels": () => this.puzzle.clearLabels(),
                "Done": () => handleDone()
            };
    
            if (step.action in actionHandlers) {
                const updatedCells = actionHandlers[step.action]();
                this.puzzle.highlightedCells = updatedCells;
                appendLine(this.getActionDescription(step));
            }
        }
    
        this.puzzle.refreshAppearanceAllLabels();
        this.puzzle.refreshAppearanceAllCells();
    }
    
    // Helper function to generate action descriptions
    getActionDescription(step) {
        switch (step.action) {
            case "Begin Solver":
                return `Starting solver algorithm`;
            case "Begin Generation":
                return `Starting generation algorithm`;
            case "Place Queen":
                return `Placed queen at (${step.row}, ${step.col})`;
            case "Backtrack":
                return `Backtracking by removing queen from (${step.row}, ${step.col})`;
            case "addConstraintToRows":
                return `Marking all cells in row(s) ${step.rows} excluding colors: ${step.excludeColors}`;
            case "addConstraintToColumns":
                return `Marking all cells in col(s) ${step.cols} excluding colors: ${step.excludeColors}`;
            case "addConstraintToCell":
                return `Marking cell (${step.row}, ${step.col})`;
            case "removeConstraintFromRows": // New descriptions
                return `Removing constraints from row(s) ${step.rows}`;
            case "removeConstraintFromColumns":
                return `Removing constraints from column(s) ${step.cols}`;
            case "removeConstraintFromCell":
                return `Removing constraint from cell (${step.row}, ${step.col})`;
            case "paintCell":
                return `Painting cell (${step.row}, ${step.col}) with color ${step.label}`;
            case "unpaintCell":
                return `Removing label from cell (${step.row}, ${step.col})`;
            case "clearLabels":
                return "Clearing all labels";
            case "Done":
                return `Completed algorithm`;
            default:
                return `Unknown action ${step.action}`;
        }
    }    
}

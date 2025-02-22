export class GameStepsWidget {
  constructor(containerId, puzzleGrid) {
    this.containerId = containerId;
    this.puzzleGrid = puzzleGrid;
    this.steps = [];
    this.container = document.getElementById(containerId);
    this.slider = null;
    this.sliderValue = null;
    this.playButton = null;
    this.plusButton = null;
    this.minusButton = null;
    this.stepsText = null;
    this.playing = false;
    this.animationFrameId = null;

    if (!this.container) {
      console.error("Container not found:", containerId);
      return;
    }

    this.loadHTML()
      .then(() => this.initialize())
      .catch(error => console.error("Error during initialization:", error));
  }

  push(data) {
    this.steps.push(data);
    this.updateSliderMax(); // Update slider max when new steps are added

    if (data.message) {
      console.log(data.message);
    }
  }

  clearSteps() {
    this.steps = [];
    this.updateSliderMax(); // Update slider max when steps are cleared
  }

  async loadHTML() {
    try {
      const response = await fetch('html/algorithm_steps_widget.html');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      this.container.innerHTML = html;
      this.cacheElementReferences();
    } catch (error) {
      console.error("Error loading HTML:", error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  cacheElementReferences() {
    this.slider = this.container.querySelector('.step-slider');
    this.sliderValue = this.container.querySelector('.slider-value');
    this.playButton = this.container.querySelector('.play-button');
    this.plusButton = this.container.querySelector('.plus-button');
    this.minusButton = this.container.querySelector('.minus-button');
    this.stepsText = this.container.querySelector('.game-steps-text');

    if (!this.slider || !this.sliderValue || !this.playButton || !this.plusButton || !this.minusButton || !this.stepsText) {
      const errorMessage = "Required elements not found in container:" + this.containerId;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  initialize() {
    this.updateSliderMax();
    this.initializeSlider();
    this.initializePlayButton();
  }

  updateSliderValue(newCount) {
    let prevCount = this.slider.value;
    if (prevCount === newCount) {
        return;
    }

    // update slider HTML elements
    this.slider.value = newCount;
    this.sliderValue.value = newCount;

    // TODO: optimize traveling backwards
//    if (newCount < prevCount) {
//        prevCount = 0;
//    }

    // replay the game steps
//    for (let currCount = prevCount; currCount <= newCount; ++currCount) {

//    }

//    this.puzzleGrid.render();
  }

  updateSliderMax() {
    const max = this.steps.length > 0 ? this.steps.length - 1 : 0;
    this.slider.max = max;
    this.updateSliderValue(Math.min(this.slider.value, max));
  }

  initializeSlider() {
    this.slider.addEventListener('input', () => this.handleSliderInput());
    this.plusButton.addEventListener('click', () => this.handleStepChange(1));
    this.minusButton.addEventListener('click', () => this.handleStepChange(-1));
  }

  handleSliderInput() {
    this.interruptPlay();
    this.updateSliderValue(parseInt(this.slider.value, 10)); // Explicitly parse as base 10
  }

  handleStepChange(direction) {
    this.interruptPlay();
    let newStep = parseInt(this.slider.value, 10) + direction;
    newStep = Math.max(0, Math.min(newStep, this.steps.length - 1));
    this.updateSliderValue(newStep);
  }

  initializePlayButton(animationSpeed = 100) {
    this.playButton.addEventListener('click', () => {
      this.playing = !this.playing;
      this.playButton.textContent = this.playing ? "⏸" : "▶️";

      if (this.playing) {
        if (this.steps.length === 0) return;

        let currentStep = parseInt(this.slider.value, 10);
        if (currentStep === this.steps.length - 1) currentStep = 0;

        let startTime;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsedTime = timestamp - startTime;

          if (elapsedTime >= animationSpeed) {
            startTime = timestamp;
            currentStep++;

            if (currentStep > this.steps.length - 1) {
              this.interruptPlay();
              return;
            }

            this.updateSliderValue(currentStep);
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
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.playing = false;
    this.playButton.textContent = "▶️";
  }
}


    // updatePuzzleState(stepIndex) {
    //     if (this.steps.length === 0) return;

    //     const N = this.puzzleGrid.N;
    //     const stepsText = this.stepsText;
    //     stepsText.value = ""; // Clear steps text

    //     const appendLine = (newLine) => {
    //         stepsText.value += (stepsText.value ? '\n' : '') + newLine;
    //         stepsText.scrollTop = stepsText.scrollHeight;
    //     };

    //     const handleBeginSolver = () => {
    //         this.puzzleGrid.clearMarkings();
    //         return new Set();
    //     }

    //     const handleBeginGeneration = () => {
    //         this.puzzleGrid.clearMarkings();
    //         this.puzzleGrid.clearColorGroups();
    //         return new Set();
    //     }

    //     const handleDone = () => {
    //         return new Set();
    //     }

    //     for (let i = 0; i <= stepIndex; i++) {
    //         const step = this.steps[i];
    //         this.puzzleGrid.highlightedCells = new Set();

    //         const actionHandlers = {
    //             "Begin Solver": () => this.puzzleGrid.clearMarkings(),
    //             "Begin Generation": () => {
    //                 this.puzzleGrid.clearMarkings();
    //                 this.puzzleGrid.clearColorGroups();
    //             },
    //             "Place Queen": () => {
    //                 const affectedCells = this.puzleGrid.placeQueen(step.row, step.col);
    //                 for (cell in affectedCells) {
    //                     this.puzzleGrid.setMarking
    //                 }
    //             }
    //             "Backtrack": () => this.puzzleGrid.removeQueen(step.row, step.col, applyLogicCheck=false),

    //             "addConstraintToRows": () => runner.addConstraintToRows(step.rows, step.excludeColors),
    //             "addConstraintToColumns": () => runner.addConstraintToColumns(step.cols, step.excludeColors),
    //             "addConstraintToCell": () => runner.addConstraintToCell(step.row, step.col),
    //             "removeConstraintFromRows": () => runner.removeConstraintFromRows(step.rows),
    //             "removeConstraintFromColumns": () => runner.removeConstraintFromColumns(step.cols),
    //             "removeConstraintFromCell": () => runner.removeConstraintFromCell(step.row, step.col),
    //             "paintCell": () => runner.setLabel(step.row, step.col, step.label),
    //             "unpaintCell": () => runner.setLabel(step.row, step.col, -1),
    //             "clearColorGroups": () => runner.clearColorGroups(),
    //             "Done": () => runner.done()
    //         };

    //         if (step.action in actionHandlers) {
    //             const updatedCells = actionHandlers[step.action]();
    //             this.puzzleGrid.highlightedCells = updatedCells;
    //             appendLine(this.getActionDescription(step));
    //         }
    //     }

    //     this.puzzleGrid.render();
    // }

    // // Helper function to generate action descriptions
    // getActionDescription(step) {
    //     switch (step.action) {
    //         case "Begin Solver":
    //         return `Starting solver algorithm`;
    //         case "Begin Generation":
    //         return `Starting generation algorithm`;
    //         case "Place Queen":
    //         return `Placed queen at (${step.row}, ${step.col})`;
    //         case "Backtrack":
    //         return `Backtracking by removing queen from (${step.row}, ${step.col})`;
    //         case "addConstraintToRows":
    //         return `Marking all cells in row(s) ${step.rows} excluding colors: ${step.excludeColors}`;
    //         case "addConstraintToColumns":
    //         return `Marking all cells in col(s) ${step.cols} excluding colors: ${step.excludeColors}`;
    //         case "addConstraintToCell":
    //         return `Marking cell (${step.row}, ${step.col})`;
    //         case "removeConstraintFromRows": // New descriptions
    //         return `Removing constraints from row(s) ${step.rows}`;
    //         case "removeConstraintFromColumns":
    //         return `Removing constraints from column(s) ${step.cols}`;
    //         case "removeConstraintFromCell":
    //         return `Removing constraint from cell (${step.row}, ${step.col})`;
    //         case "paintCell":
    //         return `Painting cell (${step.row}, ${step.col}) with color ${step.label}`;
    //         case "unpaintCell":
    //         return `Removing label from cell (${step.row}, ${step.col})`;
    //         case "clearColorGroups":
    //         return "Clearing all labels";
    //         case "Done":
    //         return `Completed algorithm`;
    //         default:
    //         return `Unknown action ${step.action}`;
    //     }
    // }
// }

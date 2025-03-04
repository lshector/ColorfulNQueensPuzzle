import { GameLogicHandler } from "./game_logic_handler.js";

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
    this.replayEnabled = true;
    this.recordingEnabled = true;
    this.gameLogicHandler = new GameLogicHandler(this.puzzleGrid);

    if (!this.container) {
      console.error("Container not found:", containerId);
      return;
    }

    this.loadHTML()
      .then(() => this.initialize())
      .catch(error => console.error("Error during initialization:", error));
  }

  disableRecording() {
    this.recordingEnabled = false;
  }

  enableRecording() {
    this.recordingEnabled = true;
  }

  toggleEnableReplay(value) {
    this.replayEnabled = value;
  }

  clearSteps() {
    this.steps = [];
    this.slider.max = 0;
    this.updateSliderValue(this.slider.max);
  }

  push(data) {
    if (this.recordingEnabled === false) {
      return;
    }

    this.steps.push(data);
    this.slider.max = this.steps.length - 1;
    this.updateSliderValue(this.slider.max);

    //if (data.message) {
    //  console.log(data.message);
    //}
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
    this.initializeSlider();
    this.initializePlayButton();
    this.clearSteps();
  }

  updateSliderValue(newCount) {
    let prevCount = Number(this.sliderValue.value);
    if (prevCount == newCount) {
      return;
    }

    // update slider HTML elements
    this.slider.value = newCount;
    this.sliderValue.value = newCount;

    // TODO: optimize traveling backwards
    if (newCount < prevCount) {
      prevCount = -1;
    }

    if (this.replayEnabled) {
      // replay the game steps
      console.log(`Replaying steps ${prevCount+1} to ${newCount}`);
      for (let currCount = prevCount+1; currCount <= newCount; ++currCount) {
        console.log(`Replaying step ${currCount}`);
        this.replayStep(currCount);
      }

      this.puzzleGrid.render();
    }
  }

  replayStep(stepNumber) {
    if (stepNumber === 0) {
      this.gameLogicHandler = new GameLogicHandler(this.puzzleGrid);
    }

    if (this.steps.length === 0) {
      return;
    }

    const step = this.steps[stepNumber];
    this.stepsText.value = `[Step ${stepNumber}]\n${step.message}`;
    console.log(this.stepsText.value);

    this.gameLogicHandler.replayStep(step);
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
      this.playButton.textContent = this.playing ? "⏸" : "▶";

      if (this.playing) {
        if (this.steps.length === 0) return;

        let currentStep = parseInt(this.slider.value, 10);
        if (currentStep === this.steps.length - 1) {
          currentStep = 0;
        }

        let startTime;
        const animate = (timestamp) => {
          if (!startTime) {
            startTime = timestamp;
          }

          const elapsedTime = timestamp - startTime;

          if (elapsedTime >= animationSpeed) {
            startTime = timestamp;
            currentStep++;

            if (currentStep === this.steps.length) {
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
    this.puzzleGrid.render();
  }
}

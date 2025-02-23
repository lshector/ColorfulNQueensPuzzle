import { GameLogicHandler } from "../widgets/game_logic_handler.js";
import { GameSteps, GameStepsWidget } from "../widgets/game_steps_widget.js";

function deduceQueenPlacement(gameLogicHandler, stepsWidget) {
  let numDeductions = 0;
  const emptyCellsPerColor = gameLogicHandler.getEmptyCellsPerColor();

  const matchingColors = Array.from(Array(gameLogicHandler.puzzleSize()).keys()).filter(
    (colorGroup) => emptyCellsPerColor[colorGroup].length === 1
  );

  if (matchingColors.length > 0) {
    for (const colorGroup of matchingColors) {
      const [row, col] = emptyCellsPerColor[colorGroup].values().next().value;
      const updatedCells = gameLogicHandler.placeQueen(row, col);
      const numUpdatedCells = updatedCells.length;

      if (numUpdatedCells > 0) {
        stepsWidget.push({
          message: `Color group ${colorGroup} only has one empty cell (${row}, ${col}).\n` +
                   `Therefore, a queen must be placed there.\n` +
                   `Gained information about ${numUpdatedCells} cells.`,
          action: GameSteps.PLACE_QUEEN,
          args: { row, col }
        });
        numDeductions += 1;
      }
    }
  }

  return numDeductions;
}

function deduceSingleRowCol(gameLogicHandler, stepsWidget) {
  let numDeductions = 0;
  const emptyCellsPerColor = gameLogicHandler.getEmptyCellsPerColor();

  const deductionRules = {
    color_in_single_row: (colorGroup) => new Set(Array.from(emptyCellsPerColor[colorGroup].values()).map(([row]) => row)).size === 1,
    color_in_single_column: (colorGroup) => new Set(Array.from(emptyCellsPerColor[colorGroup].values()).map(([, col]) => col)).size === 1,
  };

  const deductionActions = {
    color_in_single_row: (colorGroup) => {
      const [row] = emptyCellsPerColor[colorGroup].values().next().value;
      return [gameLogicHandler.addConstraintToRows(row, [colorGroup]), row];
    },
    color_in_single_column: (colorGroup) => {
      const [, col] = emptyCellsPerColor[colorGroup].values().next().value;
      return [gameLogicHandler.addConstraintToColumns(col, [colorGroup]), col];
    },
  };

  for (const name in deductionRules) {
    const colorGroupMeetsCondition = deductionRules[name];
    const matchingColors = Array.from(Array(gameLogicHandler.puzzleSize()).keys()).filter(colorGroup => colorGroupMeetsCondition(colorGroup));

    if (matchingColors.length > 0) {
      for (const colorGroup of matchingColors) {
        const [updatedCells, key] = deductionActions[name](colorGroup);
        const numUpdatedCells = updatedCells.length;

        if (numUpdatedCells > 0) {
          numDeductions += 1;
          if (name === 'color_in_single_row') {
            stepsWidget.push({
              message: `Color group ${colorGroup} only appears in one row (${key}).\n` +
                       `Therefore, all cells in that row which don't have that color can be marked with an 'X'.\n` +
                       `Gained information about ${numUpdatedCells} cells.`,
              action: GameSteps.ADD_CONSTRAINT_TO_ROWS,
              args: { rows: key, excludeColors: [colorGroup] }
            });
          }
          else if (name === 'color_in_single_col') {
            stepsWidget.push({
              message: `Color group ${colorGroup} only appears in one column (${key}).\n` +
                       `Therefore, all cells in that column which don't have that color can be marked with an 'X'.\n` +
                       `Gained information about ${numUpdatedCells} cells.`,
              action: GameSteps.ADD_CONSTRAINT_TO_COLS,
              args: { cols: key, excludeColors: [colorGroup] }
            });
          }
        }
      }
    }
  }

  return numDeductions;
}

  function deduceUsingColorExclusivity(puzzle, stepsWidget) {
    let numDeductions = 0;
    const N = puzzle.N;

    // Map each color to the set of rows and columns where it has empty cells
    const emptyCellsPerColor = puzzle.getEmptyCellsPerColor();
    const colorToEmptyRows = {};
    const colorToEmptyColumns = {};

    for (let colorGroup = 0; colorGroup < N; colorGroup++) {
      const cells = emptyCellsPerColor[colorGroup];
      colorToEmptyRows[colorGroup] = new Set();
      colorToEmptyColumns[colorGroup] = new Set();
      for (const [row, _] of cells) {
        colorToEmptyRows[colorGroup].add(row);
      }
      for (const [_, col] of cells) {
        colorToEmptyColumns[colorGroup].add(col);
      }
    }

    // Convert sets to intervals and filter out empty sets
    const colorRowIntervals = {};
    const colorColumnIntervals = {};

    for (let color = 0; color < N; color++) {
      if (colorToEmptyRows[color].size > 0) {
        const rows = Array.from(colorToEmptyRows[color]).sort((a,b) => a-b);
        colorRowIntervals[color] = [rows[0], rows[rows.length-1]];
      }
      if (colorToEmptyColumns[color].size > 0) {
        const cols = Array.from(colorToEmptyColumns[color]).sort((a,b) => a-b);
        colorColumnIntervals[color] = [cols[0], cols[cols.length-1]];
      }
    }

    function processColorGroups(colorIntervals, cellGroupType, groupSize) {
      for (let start = 0; start <= N - groupSize; start++) {
        const end = start + groupSize;
        const containedIntervals = [];

        for (const color in colorIntervals) {
          const interval = colorIntervals[color];
          if (interval[0] >= start && interval[1] <= end - 1) {
            containedIntervals.push(parseInt(color)); // Parse color to int
          }
        }

        if (containedIntervals.length !== groupSize) {
          continue;
        }

        // Successful deduction
        let updatedCells = [];
        let newStep = null;

        if (cellGroupType === "Rows") {
          const rowsToUpdate = [];
          for (let row = start; row < end; row++) {
            rowsToUpdate.push(row);
          }
          newStep = { action: 'addConstraintToRows', rows: rowsToUpdate, excludeColors: containedIntervals };
          updatedCells = updatedCells.concat(gameLogicHandler.addConstraintToRows(rowsToUpdate, containedIntervals));
        } else { // cellGroupType === "Columns"
          const colsToUpdate = [];
          for (let col = start; col < end; col++) {
            colsToUpdate.push(col);
          }
          newStep = { action: 'addConstraintToColumns', cols: colsToUpdate, excludeColors: containedIntervals };
          updatedCells = updatedCells.concat(gameLogicHandler.addConstraintToColumns(colsToUpdate, containedIntervals));
        }

        // Log the deduction for rows or columns
        const numUpdatedCells = updatedCells.size;
        if (numUpdatedCells > 0) {
          numDeductions++;

          if (stepsWidget) {
            stepsWidget.push(newStep);
          }

          console.debug(`${cellGroupType} ${start}-${end - 1} must place in a queen in colors ${containedIntervals}`);
          console.debug(`   Gained information about ${numUpdatedCells} cells`);
        }
      }
    }

    // Iterate over group sizes from 2 to N-1
    for (let groupSize = 2; groupSize < N; groupSize++) {
      processColorGroups(colorRowIntervals, "Rows", groupSize);
      processColorGroups(colorColumnIntervals, "Cols", groupSize);
    }

    return numDeductions;
  }

  function deduceInvalidPlacements(gameLogicHandler, stepsWidget) {
    let numDeductions = 0;
    const emptyCellsPerColor = gameLogicHandler.getEmptyCellsPerColor();
    for (let colorIndex = 0; colorIndex < emptyCellsPerColor.length; colorIndex++) {
      for (const cell of emptyCellsPerColor[colorIndex]) {
        // begin by assuming that the placement is valid
        let isInvalidPlacement = false;
        let reason;
        let highlightedCells;

        // temporarily place a queen in this cell
        const [row, col] = cell;
        gameLogicHandler.placeQueen(row, col);

        // check if a color is left with no valid moves
        const tmpEmptyCellsPerColor = gameLogicHandler.getEmptyCellsPerColor();
        for (let i = 0; i < tmpEmptyCellsPerColor.length; i++) {
          if (tmpEmptyCellsPerColor[i].length === 0 && !gameLogicHandler.colorGroupHasQueen(i)) {
            isInvalidPlacement = true;
            reason = `Placing a queen at (${row}, ${col}) would result in no valid moves for color ${i}.`;
            highlightedCells = [[row, col]].concat(emptyCellsPerColor[i]);
            break; // Important: Exit the inner loop once invalidity is found
          }
        }

        // remove the temporarily placed queen
        gameLogicHandler.removeQueen(row, col);

        if (isInvalidPlacement) {
          gameLogicHandler.addConstraintToCell(row, col);
          stepsWidget.push({
            message: `${reason}\n` +
                     `Therefore, the cell can be marked with an 'X'.\n` +
                     `Gained information about 1 cell.`,
            action: GameSteps.ADD_CONSTRAINT_TO_CELL,
            highlightedCells: highlightedCells,
            args: { row: row, col: col }
          });
          numDeductions += 1;
          return numDeductions;
        }
      }
    }

    return numDeductions;
  }

  export function solvePuzzleDeductive(puzzleGrid, stepsWidget) {
    const deductionMethods = [
      deduceQueenPlacement,
      deduceSingleRowCol,
      //deduceUsingColorExclusivity,
      deduceInvalidPlacements,
    ];

    const gameLogicHandler = new GameLogicHandler(puzzleGrid);
    stepsWidget.push({
      message: "Starting deductive solver",
      action: GameSteps.CLEAR_MARKINGS,
    });

    while (gameLogicHandler.isSolved() === false) {
      let numDeductions = 0;
      for (const method of deductionMethods) {
        numDeductions += method(gameLogicHandler, stepsWidget);
        if (numDeductions > 0) {
          break;
        }
      }

      if (numDeductions === 0) {
        stepsWidget.push({
          message: "Cannot make any further deductions",
          action: GameSteps.MESSAGE
        });
        break;
      }
    }

    if (gameLogicHandler.isSolved()) {
      stepsWidget.push({
        message: "Found a solution!",
        action: GameSteps.MESSAGE
      });

      let solution = gameLogicHandler.getPlacedQueens();
      return { solution, solved: true };
    } else {
      return { solution: null, solved: false };
    }
  }
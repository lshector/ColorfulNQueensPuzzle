function deduceQueenPlacement(puzzle, stepsWidget) {
    let numDeductions = 0;
    const emptyCellsPerColor = puzzle.getEmptyCellsPerColor();

    const matchingColors = Array.from(Array(puzzle.N).keys()).filter(
      (label) => emptyCellsPerColor[label].size === 1 // Use .size for Set length
    );

    if (matchingColors.length > 0) {
      for (const label of matchingColors) {
        const [row, col] = emptyCellsPerColor[label].values().next().value; // Get the single cell from Set
        const updatedCells = puzzle.placeQueenFromSolver(row, col);
        const numUpdatedCells = updatedCells.size;

        if (numUpdatedCells > 0) {
          numDeductions += 1;
          if (stepsWidget) {
            stepsWidget.push({ action: "Place Queen", row, col });
          }
          console.debug(`Deduced rule 'queen_placement' for color ${label}`);
          console.debug(`   Gained information about ${numUpdatedCells} cells`);
          //DeductiveSolver.displayAlgorithmStep(moveHandler, renderer);
        }
      }
    }

    return numDeductions;

}

function deduceSingleRowCol(puzzle, stepsWidget) {
    let numDeductions = 0;
    const emptyCellsPerColor = puzzle.getEmptyCellsPerColor();

    const deductionRules = {
      color_in_single_row: (label) => new Set(Array.from(emptyCellsPerColor[label].values()).map(([row]) => row)).size === 1,
      color_in_single_column: (label) => new Set(Array.from(emptyCellsPerColor[label].values()).map(([, col]) => col)).size === 1,
    };

    const deductionActions = {
      color_in_single_row: (label) => {
        const [row] = emptyCellsPerColor[label].values().next().value;
        return [puzzle.addConstraintToRows(row, [label]), row];
      },
      color_in_single_column: (label) => {
        const [, col] = emptyCellsPerColor[label].values().next().value;
        return [puzzle.addConstraintToColumns(col, [label]), col];
      },
    };

    for (const name in deductionRules) {
      const labelMeetsCondition = deductionRules[name];
      const matchingColors = Array.from(Array(puzzle.N).keys()).filter(label => labelMeetsCondition(label));

      if (matchingColors.length > 0) {
        for (const label of matchingColors) {
          const [updatedCells, key] = deductionActions[name](label);
          const numUpdatedCells = updatedCells.size;

          if (numUpdatedCells > 0) {
            numDeductions += 1;
            if (stepsWidget) {
              if (name === 'color_in_single_row') {
                stepsWidget.push({ action: 'addConstraintToRows', rows: key, excludeColors: [label] });
              }
              else if (name === 'color_in_single_col') {
                stepsWidget.push({ action: 'addConstraintToColumns', cols: key, excludeColors: [label] });
              }
            }

            console.debug(`Deduced rule '${name}' for color ${label}`);
            console.debug(`   Gained information about ${numUpdatedCells} cells`);
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

  for (let label = 0; label < N; label++) {
    const cells = emptyCellsPerColor[label];
    colorToEmptyRows[label] = new Set();
    colorToEmptyColumns[label] = new Set();
    for (const [row, _] of cells) {
      colorToEmptyRows[label].add(row);
    }
    for (const [_, col] of cells) {
      colorToEmptyColumns[label].add(col);
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
          updatedCells = updatedCells.concat(puzzle.addConstraintToRows(rowsToUpdate, containedIntervals));
      } else { // cellGroupType === "Columns"
          const colsToUpdate = [];
          for (let col = start; col < end; col++) {
              colsToUpdate.push(col);
          }
          newStep = { action: 'addConstraintToColumns', cols: colsToUpdate, excludeColors: containedIntervals };
          updatedCells = updatedCells.concat(puzzle.addConstraintToColumns(colsToUpdate, containedIntervals));
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

function deduceInvalidPlacements(puzzle, stepsWidget) {
    let numDeductions = 0;
    const emptyCells = puzzle.getEmptyCells();

    for (const cell of emptyCells) {
      const [row, col] = cell;
      let isInvalidPlacement = false;
      puzzle.placeQueenFromSolver(row, col);
      const newEmptyCells = puzzle.getEmptyCellsPerColor();

      for (let i = 0; i < puzzle.N; i++) {
        if (newEmptyCells[i].size === 0 && !puzzle.placedQueensColors.has(i)) { // Use .size for Set length
          console.log(`Placing a queen at (${row}, ${col}) would result in no valid moves for color ${i}`);
          isInvalidPlacement = true;
          break; // Important: Exit the inner loop once invalidity is found
        }
      }

      puzzle.removeQueenFromSolver(row, col);

      if (isInvalidPlacement) {
        if (stepsWidget) {
          stepsWidget.push({ action: 'addConstraintToCell', row, col });
        }

        puzzle.addConstraintToCell(row, col);
        numDeductions += 1;
      }
    }

    return numDeductions;
}

export function solvePuzzleDeductive(puzzle, stepsWidget) {
  const deductionMethods = [
    deduceQueenPlacement,
    deduceSingleRowCol,
    deduceUsingColorExclusivity,
    deduceInvalidPlacements,
  ];

  if (stepsWidget) {
    stepsWidget.push({ action: "Begin Solver" });
  }

    while (puzzle.isSolved() === false) {
      let numDeductions = 0;
      for (const method of deductionMethods) {
        numDeductions += method(puzzle, stepsWidget);
        if (numDeductions > 0) {
          break;
        }
      }

      if (numDeductions === 0) {
        console.warn("Ran out of deductions");
        break;
      }
    }

    if (stepsWidget) {
      stepsWidget.push({ action: "Done" });
    }

    if (puzzle.isSolved()) {
        let solution = puzzle.placedQueens;
        return { solution, solved: true };
    } else {
        return { solution: null, solved: false };
    }
}
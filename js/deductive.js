function deduceQueenPlacement(puzzle, steps) {
    let numDeductions = 0;
    const emptyCellsPerColor = puzzle.getEmptyCellsPerColor();

    const matchingColors = Array.from(Array(puzzle.N).keys()).filter(
      (label) => emptyCellsPerColor[label].size === 1 // Use .size for Set length
    );

    if (matchingColors.length > 0) {
      for (const label of matchingColors) {
        const [row, col] = emptyCellsPerColor[label].values().next().value; // Get the single cell from Set
        const updatedCells = puzzle.placeQueenFromSolver(row, col);
        const numUpdatedCells = updatedCells.length;

        if (numUpdatedCells > 0) {
          numDeductions += 1;
          steps.push({ action: "Place Queen", row, col });
          console.debug(`Deduced rule 'queen_placement' for color ${label}`);
          console.debug(`   Gained information about ${numUpdatedCells} cells`);
          //DeductiveSolver.displayAlgorithmStep(moveHandler, renderer);
        }
      }
    }

    return numDeductions;

}

function deduceSingleRowCol(puzzle, steps) {
    let numDeductions = 0;
    const emptyCellsPerColor = puzzle.getEmptyCellsPerColor();

    const deductionRules = {
      color_in_single_row: (label) => new Set(Array.from(emptyCellsPerColor[label].values()).map(([row]) => row)).size === 1,
      color_in_single_column: (label) => new Set(Array.from(emptyCellsPerColor[label].values()).map(([, col]) => col)).size === 1,
    };

    const deductionActions = {
      color_in_single_row: (label) => {
        const [row] = emptyCellsPerColor[label].values().next().value;
        return [puzzle.addConstraintToRow(row, [label]), row];
      },
      color_in_single_column: (label) => {
        const [, col] = emptyCellsPerColor[label].values().next().value;
        return [puzzle.addConstraintToColumn(col, [label]), col];
      },
    };

    for (const name in deductionRules) {
      const labelMeetsCondition = deductionRules[name];
      const matchingColors = Array.from(Array(puzzle.N).keys()).filter(label => labelMeetsCondition(label));

      if (matchingColors.length > 0) {
        for (const label of matchingColors) {
          const [updatedCells, key] = deductionActions[name](label);
          const numUpdatedCells = updatedCells.length;

          if (numUpdatedCells > 0) {
            numDeductions += 1;
            if (name === 'color_in_single_row') {
                steps.push({ action: 'addConstraintToRow', row: key, excludeColors: [label] });
            }
            else if (name === 'color_in_single_col') {
                steps.push({ action: 'addConstraintToColumn', col: key, excludeColors: [label] });
            }

            console.debug(`Deduced rule '${name}' for color ${label}`);
            console.debug(`   Gained information about ${numUpdatedCells} cells`);
          }
        }
      }
    }

    return numDeductions;
}

function deduceUsingColorExclusivity(puzzle, steps) {
    return 0;
}

function deduceInvalidPlacements(puzzle, steps) {
    let numDeductions = 0;
    const emptyCells = puzzle.getEmptyCells();

    for (const cell of emptyCells) {
      const [row, col] = cell;
      let isInvalidPlacement = false;
      puzzle.placeQueenFromSolver(row, col);
      const newEmptyCells = puzzle.getEmptyCellsPerColor();

      for (let i = 0; i < puzzle.N; i++) {
        if (newEmptyCells[i].size === 0 && !puzzle.placedQueensColors.has(i)) { // Use .size for Set length
          console.debug(`Placing a queen at (${row}, ${col}) would result in no valid moves for color ${i}`);
          isInvalidPlacement = true;
          break; // Important: Exit the inner loop once invalidity is found
        }
      }

      puzzle.removeQueenFromSolver(row, col);

      if (isInvalidPlacement) {
        steps.push({ action: 'addConstraintToCell', row, col });
        puzzle.addConstraintToCell(row, col);
        numDeductions += 1;
      }
    }

    return numDeductions;
}

function deduce(puzzle, steps) {
    const deductionMethods = [
        deduceQueenPlacement,
        deduceSingleRowCol,
        deduceUsingColorExclusivity,
        deduceInvalidPlacements,
    ];

    for (const method of deductionMethods) {
        const numDeductions = method(puzzle, steps);
        if (numDeductions > 0) {
            return numDeductions;
        }
    }

    return 0;
}

export function solvePuzzleDeductive(puzzle) {
    const steps = [];
    steps.push({ action: "Begin" });

    while (puzzle.isSolved() === false) {
        const numDeductions = deduce(puzzle, steps);
        if (numDeductions === 0) {
            console.warn("Ran out of deductions");
            break;
        }
    }

    if (puzzle.isSolved()) {
        let solution = puzzle.placedQueens;
        return { solution, solved: true, steps };
    } else {
        return { solution: null, solved: false, steps };
    }
}
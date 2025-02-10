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
        steps.push({ action: "Place Queen", row, col });

        if (numUpdatedCells > 0) {
          numDeductions += 1;
          console.debug(`Deduced rule 'queen_placement' for color ${label}`);
          console.debug(`   Gained information about ${numUpdatedCells} cells`);
          //DeductiveSolver.displayAlgorithmStep(moveHandler, renderer);
        }
      }
    }

    return numDeductions;

}

function deduceSingleRowCol(puzzle, steps) {

}

function deduceUsingColorExclusivity(puzzle, steps) {

}

function deduceInvalidPlacements(puzzle, steps) {

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
        return { solution, solved: true, steps };
    } else {
        return { solution: null, solved: false, steps };
    }
}
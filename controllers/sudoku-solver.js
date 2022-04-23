"use strict";

class SudokuSolver {

  validate(puzzleString) {
    const rule = /[^1-9\.]+/i;

    if (puzzleString.length != 81) {
      return {
        isValid: false,
        error: "Expected puzzle to be 81 characters long"
      };
    }

    if (rule.test(puzzleString)) {
      return { isValid: false, error: "Invalid characters in puzzle" }
    } else {
      return { isValid: true, error: "" }
    }
  }

  checkRowPlacement(puzzleString, row, value) {
    const rows      = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
    const rowStart  = rows.indexOf(row.toLowerCase()) * 9;
    const rowEnd    = rowStart + 9;
    const rowValues = puzzleString.slice(rowStart, rowEnd);

    return !rowValues.includes(value);
  }

  checkColPlacement(puzzleString, column, value) {
    const cols = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    let colValues = "",
        colStart  = cols.indexOf(column);

    for (let i = 0; i < 9; i++) {
      colValues += puzzleString[colStart];
      colStart  += 9;
    }

    return !colValues.includes(value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const matrix = [];
    const region = [];
    const rows   = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
    const cols   = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const rowIndex = rows.indexOf(row.toLowerCase());
    const colIndex = cols.indexOf(column);

    let regionValues = "";

    [rowIndex, colIndex].forEach(el => {
      if (el % 3 === 0) matrix.push([el, el + 1, el + 2]);
      if (el % 3 === 1) matrix.push([el - 1, el, el + 1]);
      if (el % 3 === 2) matrix.push([el - 2, el - 1, el]);
    });

    const [rowsMatrix, colsMatrix] = matrix;

    rowsMatrix.forEach(r => {
      colsMatrix.forEach(c => region.push((r * 9) + c));
    });

    region.forEach(i => regionValues += puzzleString[i]);

    return !regionValues.includes(value);
  }

  checkConflicts(puzzleString, row, column, value) {
    const conflict = [];

    const rows = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
    const cols = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const rowIndex = rows.indexOf(row.toLowerCase());
    const colIndex = cols.indexOf(column);

    if (puzzleString[(rowIndex * 9) + colIndex] == value) {
      return { valid: true };
    }

    if (!this.checkRowPlacement(puzzleString, row, value)) {
      conflict.push("row");
    }

    if (!this.checkColPlacement(puzzleString, column, value)) {
      conflict.push("column");
    }

    if (!this.checkRegionPlacement(puzzleString, row, column, value)) {
      conflict.push("region");
    }
    
    if (conflict.length > 0) {
      return { valid: false, conflict };
    } else {
      return { valid: true };
    }
    
  }

  solve(puzzleString) {
    
    // Starting point
    const splitPuzzle = puzzleString.split("");
    const rowsIndexes = [];
    const colsIndexes = [];
    const regsIndexes = [];

    let checkSpaces = splitPuzzle.includes(".");

    // Define starting indexes for rows, cols and regions
    const firstRow    = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const firstCol    = firstRow.map(el => el * 9);
    const firstRegion = firstRow.slice(0, 3).map(el => [el * 9, el * 9 + 1, el * 9 + 2]).flat();

    // Map all indexes
    for (let i = 0; i < 9; i++) {
      rowsIndexes.push(firstRow.map(r => (i * 9) + r));
      colsIndexes.push(firstCol.map(c => c + i));
      regsIndexes.push(firstRegion.map(m => (Math.floor(i / 3) * 18) + (i * 3) + m));
    }

    // Sudoku resolver
    do {

      // Check for spaces ==> "."
      checkSpaces = splitPuzzle.includes(".");

      // Define rows, cols and regions
      const rowsValues = [];
      const colsValues = [];
      const regsValues = [];
      const answers    = [];

      // Fetch row, col & region values
      rowsIndexes.forEach(r => rowsValues.push(r.reduce((prev, curr) => { return prev + splitPuzzle[curr]; }, "")));
      colsIndexes.forEach(c => colsValues.push(c.reduce((prev, curr) => { return prev + splitPuzzle[curr]; }, "")));
      regsIndexes.forEach(r => regsValues.push(r.reduce((prev, curr) => { return prev + splitPuzzle[curr]; }, "")));

      // Calculate answer
      for (let value = 1; value <= 9; value++) {
        
        regsValues.forEach((reg, regIndex) => {
          if (reg.includes(value)) return;

          const possibleAnswers = [];
          
          for (let i = 0; i < 3; i++) {
            const currentRow = rowsValues[Math.floor(regIndex / 3) * 3 + i];

            if (currentRow.includes(value)) continue;

            for (let j = 0; j < 3; j++) {

              const currentCol = colsValues[(regIndex % 3) * 3 + j];

              if (currentCol.includes(value)) continue;

              const intersection   = (i * 3) + j;
              const puzzlePosition = ((Math.floor(regIndex / 3) * 3 + i) * 9) + (((regIndex % 3) * 3) + j);

              if (!parseInt(reg[intersection])) possibleAnswers.push({ value, puzzlePosition });

            }

            answers.push(possibleAnswers);
          }
        });
      }

      const uniqueAnswers = answers.filter(el => el.length === 1).flat();

      if (uniqueAnswers.length === 0) break;

      uniqueAnswers.forEach(ans => splitPuzzle[ans.puzzlePosition] = `${ans.value}`);
      
    } while (checkSpaces);

    return (!checkSpaces) ? { solution: splitPuzzle.join("") } : { error: "Puzzle cannot be solved" };
  }
}

module.exports = SudokuSolver;
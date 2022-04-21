"use strict";

class SudokuSolver {
  
  createRegion(x, y) {
    const puzzlePos = [],
          matrix    = [];

    [x, y].forEach(el => {
      if (el % 3 == 0) matrix.push([el, el + 1, el + 2]);
      if (el % 3 == 1) matrix.push([el - 1, el, el + 1]);
      if (el % 3 == 2) matrix.push([el - 2, el - 1, el]);
    });

    const [rows, cols] = matrix;

    rows.forEach(r => {
      cols.forEach(c => puzzlePos.push((r * 9) + c));
    });

    return puzzlePos;
  }

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

  checkValue(value) {
    return parseInt(value) >= 1 && parseInt(value) <= 9;
  }

  checkCoordinate(coordinate) {
    if (coordinate.length != 2) return false;
    
    const xy   = coordinate.toLowerCase(),
          rule = /^[a-z][0-9]$/i,
          rows = ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
          cols = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const validations = [
      rows.includes(xy[0]),
      cols.includes(xy[1]),
      rule.test(xy)
    ];

    const testCoordinate = validations.every(v => v == true);

    if (!testCoordinate) return false;
    
    return { rowIndex: rows.indexOf(xy[0]), colIndex: cols.indexOf(xy[1]) };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const { rowIndex } = this.checkCoordinate(row + column),
            rowStart   = rowIndex * 9,
            rowEnd     = rowStart + 9,
            rowValues  = puzzleString.slice(rowStart, rowEnd);

    return !rowValues.includes(value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    const { colIndex } = this.checkCoordinate(row + column);

    let colValues = "",
        colStart  = colIndex;

    for (let i = 0; i < 9; i++) {
      colValues += puzzleString[colStart];
      colStart  += 9;
    }

    return !colValues.includes(value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const { rowIndex, colIndex } = this.checkCoordinate(row + column),
                         indexes = this.createRegion(rowIndex, colIndex);

    let regionValues = "";

    indexes.forEach(i => regionValues += puzzleString[i]);

    return !regionValues.includes(value);
  }

  checkConflicts(puzzleString, row, column, value) {
    const conflict = [];

    if (!this.checkRowPlacement(puzzleString, row, column, value)) {
      conflict.push("row");
    }

    if (!this.checkColPlacement(puzzleString, row, column, value)) {
      conflict.push("column");
    }

    if (!this.checkRegionPlacement(puzzleString, row, column, value)) {
      conflict.push("region");
    }
    
    if (conflict.length > 0) {
      return { valid: false, conflict }
    } else {
      return { valid: true }
    }
  }

  solve(puzzleString) {
    
    // Starting point
    let splitPuzzle = puzzleString.split("");
    let checkSpaces = splitPuzzle.includes(".");

    // Define starting indexes for rows, cols and regions
    const rowIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const colIndex = rowIndex.map(el => el * 9);
    const regIndex = rowIndex.slice(0, 3).map(el => [el * 9, el * 9 + 1, el * 9 + 2]).flat();

    // Sudoku resolver
    do {

      // Check for spaces ==> "."
      checkSpaces = splitPuzzle.includes(".");

      // Define rows, cols and regions
      const rows    = [];
      const cols    = [];
      const regions = [];
      const answers = [];

      // Fetch row & col values
      for (let i = 0; i < 9; i++) {
        let row = rowIndex.map(r => (i * 9) + r);
        rows.push(row.reduce((prev, curr) => { return prev + splitPuzzle[curr] }, ""));
      
        let col = colIndex.map(c => c + i);
        cols.push(col.reduce((prev, curr) => { return prev + splitPuzzle[curr] }, ""));
      
        let reg = regIndex.map(m => (Math.floor(i / 3) * 18) + (i * 3) + m);
        regions.push(reg.reduce((prev, curr) => { return prev + splitPuzzle[curr] }, ""));
      }

      // Calculate answer
      for (let value = 1; value <= 9; value++) {
        
        regions.forEach((reg, regIndex) => {
          if (reg.includes(value)) return;

          const possibleAnswers = [];
          
          for (let i = 0; i < 3; i++) {
            
            const currentRow = rows[Math.floor(regIndex / 3) * 3 + i];
            
            if (currentRow.includes(value)) continue;

            for (let j = 0; j < 3; j++) {

              const currentCol = cols[(regIndex % 3) * 3 + j];

              if (currentCol.includes(value)) continue;

              const position = (i * 3) + j;

              if (!parseInt(reg[position])) {
                possibleAnswers.push({
                  validValue: value,
                  stringPos: ((Math.floor(regIndex / 3) * 3 + i) * 9) + (((regIndex % 3) * 3) + j)
                });
              }
            }

            answers.push(possibleAnswers);
          }
        });
      }

      const uniqueAnswers = answers.filter(el => el.length == 1).flat();

      if (uniqueAnswers.length == 0) break;

      uniqueAnswers.forEach(ans => splitPuzzle[ans.stringPos] = `${ans.validValue}`);
      
    } while (checkSpaces)

    return (!checkSpaces) ? { solution: splitPuzzle.join("") } : { error: "Puzzle cannot be solved" };
  }
}

module.exports = SudokuSolver;
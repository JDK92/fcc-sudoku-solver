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
    console.clear();

    // Define rows, cols and regions
    const rows = [];
    const cols = [];
    const matr = [];
    const answ = [];

    // Define starting indexes for rows, cols and regions
    const ri = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const ci = ri.map(el => el * 9);
    const mi = ri.slice(0, 3).map(el => [el * 9, el * 9 + 1, el * 9 + 2]).flat();


    // Fetch row & col values
    for (let i = 0; i < 9; i++) {
      let currentRow = ri.map(r => (i * 9) + r);
      rows.push(currentRow.reduce((prev, curr) => { return prev + puzzleString[curr] }, ""));

      let currentCol = ci.map(c => c + i);
      cols.push(currentCol.reduce((prev, curr) => { return prev + puzzleString[curr] }, ""));

      let currentReg = mi.map(m => (Math.floor(i / 3) * 18) + (i * 3) + m);
      matr.push(currentReg.reduce((prev, curr) => { return prev + puzzleString[curr] }, ""));
    }


    // Calculate answer
    let value = 1;

    do {
      matr.forEach((m, mi) => { 
        let options = 0;

        if (!m.includes(value)) {

          const possibleAnswers = [];

  
          for (let i = 0; i < 3; i++) {
            const currentRow = rows[Math.floor(mi / 3) * 3 + i];
            
            if (currentRow.includes(value)) continue;
      
            for (let j = 0; j < 3; j++) {
              const currentCol = cols[(mi % 3) * 3 + j];
              
              if (currentCol.includes(value)) continue;
              
              const position = (i * 3) + j;
  
              if (!parseInt(m[position])) {
                options++;
                possibleAnswers.push({m, value, position});
              }
            }
            
          }
          
          answ.push(possibleAnswers);
        }
  
      });

      value++;

    } while (value < 9);

    const uniqueAnswer = answ.filter(el => el.length === 1);

    console.log(uniqueAnswer);



  }
}

module.exports = SudokuSolver;
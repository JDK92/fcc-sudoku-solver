class SudokuSolver {
  
  createRegion(x, y) {
    const indexes   = [],
          xyIndexes = [];

    [x, y].forEach(el => {
      if (el % 3 == 0) xyIndexes.push([el, el + 1, el + 2]);
      if (el % 3 == 1) xyIndexes.push([el - 1, el, el + 1]);
      if (el % 3 == 2) xyIndexes.push([el - 2, el - 1, el]);
    });

    const [rows, cols] = xyIndexes;

    rows.forEach(r => {
      cols.forEach(c => indexes.push((r * 9) + c));
    });

    return indexes;
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

  solve(puzzleString) {

  }
}

module.exports = SudokuSolver;
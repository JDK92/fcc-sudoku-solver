'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: "Required field(s) missing" });
      }
      
      const [ row, col ] = coordinate;

      const conflict    = [];
      const checkPuzzle = solver.validate(puzzle);
      const checkCoord  = solver.checkCoordinate(coordinate);
      const checkValue  = solver.checkValue(value);

      console.log({checkValue});

      if (!checkPuzzle.isValid) {
        return res.json({ error: checkPuzzle.error })
      }

      if (!checkCoord) {
        return res.json({ error: "Invalid coordinate" });
      }

      if (!checkValue) {
        return res.json({ error: "Invalid value" });
      }

      if (!solver.checkRowPlacement(puzzle, row, col, value)) {
        conflict.push("row");
      }

      if (!solver.checkColPlacement(puzzle, row, col, value)) {
        conflict.push("column");
      }

      if (!solver.checkRegionPlacement(puzzle, row, col, value)) {
        conflict.push("region");
      }

      if (conflict.length > 0) {
        return res.json({ valid: false, conflict });
      } else {
        return res.json({ valid: true });
      }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
     
    });
};

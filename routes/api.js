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
      
      const [ row, col ]  = coordinate;
      const checkPuzzle   = solver.validate(puzzle);
      const checkCoord    = solver.checkCoordinate(coordinate);
      const checkValue    = solver.checkValue(value);
      const checkConflict = solver.checkConflicts(puzzle, row, col, value);

      if (!checkPuzzle.isValid) {
        return res.json({ error: checkPuzzle.error })
      }

      if (!checkCoord) {
        return res.json({ error: "Invalid coordinate" });
      }

      if (!checkValue) {
        return res.json({ error: "Invalid value" });
      }

      return res.json(checkConflict);

    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle }  = req.body;
      const checkPuzzle = solver.validate(puzzle);
      
      if (!req.body.puzzle) {
        return res.json({ error: "Required field missing" });
      }

      if (!checkPuzzle.isValid) {
        return res.json({ error: checkPuzzle.error });
      }

      console.log("All good");

      solver.solve(puzzle);

      return res.json({solution: puzzle});

    });
};

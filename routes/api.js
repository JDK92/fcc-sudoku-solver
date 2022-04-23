'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res, next) => {
      // Middleware - Check for missing fields
      if (!req.body.puzzle || !req.body.coordinate || !req.body.value) {
        return res.json({ error: "Required field(s) missing" });
      }

      next();

    }, (req, res, next) => {
      // Middleware - Check for value between 1 and 9
      const { value } = req.body;

      const validation = [ parseInt(value) >= 1, parseInt(value) <= 9];

      if (!validation.every(v => v == true)) {
        return res.json({ error: "Invalid value" });
      }

      next();

    }, (req, res, next) => {
      // Middleware - Check for valid puzzle string
      let { isValid, error } = solver.validate(req.body.puzzle);

      if (!isValid) return res.json({ error });

      next();

    }, (req, res, next) => {
      // Middleware - Check for valid coordinate
      const { coordinate } = req.body;

      const xy = coordinate.toLowerCase(),
          rule = /^[a-z][0-9]$/i,
          rows = ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
          cols = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

      const validations = [
            rows.includes(xy[0]),
            cols.includes(xy[1]),
            rule.test(xy),
            coordinate.length == 2];
      
      if (!validations.every(v => v == true)) {
        return res.json({ error: "Invalid coordinate" });
      }

      next();

    }, (req, res) => {
      const { puzzle, coordinate, value } = req.body;
      const [ row, col ]  = coordinate;

      const checkConflict = solver.checkConflicts(puzzle, row, col, value);

      return res.json(checkConflict);

    });
    

  app.route('/api/solve')
    .post((req, res, next) => {
      
      // Middleware - Check for required field
      
      if (!req.body.puzzle) return res.json({ error: "Required field missing" });

      next();
    }, (req, res, next) => {
      
      // Middleware - Check for valid puzzle string
      
      const { isValid, error } = solver.validate(req.body.puzzle);

      if (!isValid) return res.json({error});

      next();
    } , (req, res) => {
      const answer = solver.solve(req.body.puzzle);
      
      return res.json(answer);
    });
};

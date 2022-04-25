const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const validAnswer = "135762984946381257728459613694517832812936745357824196473298561581673429269145378";

const impossiblePuzzle    = '5.1..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const invalidLengthPuzzle = '5.1..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37....';
const invalidCharsPuzzle  = '5.1..2.84..63.12.7.2..5.....9..1...%8.2.3674.3!7.2.x9.47a..8..1..16....926914.37.';

suite('UnitTests', () => {
  // Logic handles a valid puzzle string of 81 characters
  test("81 characters valid puzzle", () => {
    assert.isObject(solver.validate(validPuzzle), "Must return an object");
    assert.isTrue(solver.validate(validPuzzle).isValid, "Must be true");
  });        

  // Logic handles a puzzle string with invalid characters (not 1-9 or .)
  test("Puzzle with invalid characters", () => {
    assert.isObject(solver.validate(invalidCharsPuzzle), "Must return an object");
    assert.isFalse(solver.validate(invalidCharsPuzzle).isValid, "isValid must be false");
    assert.equal(solver.validate(invalidCharsPuzzle).error, "Invalid characters in puzzle", "Invalid characters in puzzle");
  });

  // Logic handles a puzzle string that is not 81 characters in length
  test("Puzzle is over or under 81 characters in length", () => {
    assert.isObject(solver.validate(invalidLengthPuzzle), "Must return an object");
    assert.isFalse(solver.validate(invalidLengthPuzzle).isValid, "isValid must be false");
    assert.equal(solver.validate(invalidLengthPuzzle).error, "Expected puzzle to be 81 characters long");
  });

  // Logic handles a valid row placement
  test("Valid row placement", () => {
    assert.isTrue(solver.checkRowPlacement(validPuzzle, "a", "7"), "Must return true");
  });

  // Logic handles an invalid row placement
  test("Invalid row placement", () => {
    assert.isFalse(solver.checkRowPlacement(validPuzzle, "a", "4"), "Must return false");
  });

  // Logic handles a valid column placement
  test("Valid col placement", () => {
    assert.isTrue(solver.checkColPlacement(validPuzzle, 3, "6"), "Must return true");
  });

  // Logic handles an invalid column placement
  test("Invalid col placement", () => {
    assert.isFalse(solver.checkColPlacement(validPuzzle, 2, "9"), "Must return false");
  });

  // Logic handles a valid region (3x3 grid) placement
  test("Valid region placement", () => {
    assert.isTrue(solver.checkRegionPlacement(validPuzzle, "a", "1", "7"), "Must return true");
  });

  // Logic handles an invalid region (3x3 grid) placement
  test("Invalid region placement", () => {
    assert.isFalse(solver.checkRegionPlacement(validPuzzle, "h", "7", "9"), "Must return false");
  });

  // Valid puzzle strings pass the solver
  test("Valid puzzle string in solver", () => {
    assert.hasAllKeys(solver.solve(validPuzzle), ["solution"], "Must have a solution property");
  });

  // Invalid puzzle strings fail the solver
  test("Invalid puzzle string fails the solver", () => {
    assert.equal(solver.solve(impossiblePuzzle).error, "Puzzle cannot be solved", "Impossible puzzle");
  });

  // Solver returns the expected solution for an incomplete puzzle
  test("Solver returns solution", () => {
    assert.equal(solver.solve(validPuzzle).solution, validAnswer, "Puzzle can be solved");
  });

});

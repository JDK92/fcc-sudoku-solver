const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

// Testing puzzles
const validPuzzle      = "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";
const validSolution    = "135762984946381257728459613694517832812936745357824196473298561581673429269145378";
const impossiblePuzzle = "5.1..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";
const invalidChars     = "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..!..16xx..926914.37a";
const invalidLength    = "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8";

// Testing coordinates & values
const validCoord   = "A2";
const validValue   = 3;
const invalidCoord = "B10";
const invalidValue = 99;

// Conflicts
const uniqueConflict    = { coord: "B5", value: 4 };
const multipleConflicts = { coord: "A5", value: 4 };
const allConflicts      = { coord: "B2", value: 6 };


chai.use(chaiHttp);

suite("Functional Tests", () => {
  // Solve a puzzle with valid puzzle string: POST request to /api/solve
  test("POST - /api/solve - valid puzzle string", (done) => {
    chai.request(server)
      .post("/api/solve")
      .send({
        puzzle: validPuzzle
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "solution", "solution must be a property");
        assert.equal(res.body.solution, validSolution);
        done();
      });
  });

  // Solve a puzzle with missing puzzle string: POST request to /api/solve
  test("POST - /api/solve - missing puzzle", (done) => {
    chai.request(server)
      .post("/api/solve")
      .send({})
      .end((err, res) => {
        assert.property(res.body, "error", "error must be a property");
        assert.equal(res.body.error, "Required field missing", "Puzzle is missing");
        done();
      });
  });

  // Solve a puzzle with invalid characters: POST request to /api/solve
  test("POST - /api/solve - puzzle with invalid characters", (done) => {
    chai.request(server)
      .post("/api/solve")
      .send({
        puzzle: invalidChars
      })
      .end((err, res) => {
        assert.property(res.body, "error", "Error must be a property");
        assert.equal(res.body.error, "Invalid characters in puzzle");
        done();
      });
  });

  // Solve a puzzle with incorrect length: POST request to /api/solve
  test("POST - /api/solve - puzzle with incorrect length", (done) => {
    chai.request(server)
      .post("/api/solve")
      .send({
        puzzle: invalidLength
      })
      .end((err, res) => {
        assert.property(res.body, "error", "Error must be a property");
        assert.equal(res.body.error, "Expected puzzle to be 81 characters long");
        done();
      });
  });

  // Solve a puzzle that cannot be solved: POST request to /api/solve
  test("POST - /api/solve - impossible puzzle (cannot be solved)", (done) => {
    chai.request(server)
      .post("/api/solve")
      .send({
        puzzle: impossiblePuzzle
      })
      .end((err, res) => {
        assert.property(res.body, "error", "Error must be a property");
        assert.equal(res.body.error, "Puzzle cannot be solved");
        done();
      });
  });

  // Check a puzzle placement with all fields: POST request to /api/check
  test("POST - /api/check - check puzzle placement with all fields", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: validCoord,
        value: validValue
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "valid", "Valid must be a property");
        assert.isTrue(res.body.valid, "The value is valid in the given coordinate");
        done();
      });
  });

  // Check a puzzle placement with single placement conflict: POST request to /api/check
  test("POST - /api/check - single conflict", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: uniqueConflict.coord,
        value: uniqueConflict.value
      })
      .end((err, res) => {
        assert.property(res.body, "valid", "Valid is a property");
        assert.isFalse(res.body.valid, "The given values must return false");
        assert.property(res.body, "conflict", "Conflict is a property");
        assert.isArray(res.body.conflict, "Conflict is an array");
        assert.equal(res.body.conflict.length, 1, "Only one conflict with the given coord & value");
        done();
      });
  });

  // Check a puzzle placement with multiple placement conflicts: POST request to /api/check
  test("POST - /api/check - multiple conflicts", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: multipleConflicts.coord,
        value: multipleConflicts.value
      })
      .end((err, res) => {
        assert.property(res.body, "valid", "Valid is a property");
        assert.isFalse(res.body.valid, "The given values must return false");
        assert.property(res.body, "conflict", "Conflict is a property");
        assert.isArray(res.body.conflict, "Conflict is an array");
        assert.equal(res.body.conflict.length, 2, "Two conflicts with the given values");
        done();
      });
  });

  // Check a puzzle placement with all placement conflicts: POST request to /api/check
  test("POST - /api/check - all placement conflicts", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: allConflicts.coord,
        value: allConflicts.value
      })
      .end((err, res) => {
        assert.property(res.body, "valid", "Valid is a property");
        assert.isFalse(res.body.valid, "The given values must return false");
        assert.property(res.body, "conflict", "Conflict is a property");
        assert.isArray(res.body.conflict, "Conflict is an array");
        assert.equal(res.body.conflict.length, 3, "All placement conflicts");
        done();
      });
  });

  // Check a puzzle placement with missing required fields: POST request to /api/check
  test("POST - /api/check - missing required fields", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle
      })
      .end((err, res) => {
        assert.property(res.body, "error", "Error is a property");
        assert.equal(res.body.error, "Required field(s) missing");
        done();
      });
  });

  // Check a puzzle placement with invalid characters: POST request to /api/check
  test("POST - /api/check - Invalid characters in puzzle", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: invalidChars,
        coordinate: validCoord,
        value: validValue
      })
      .end((err, res) => {
        assert.property(res.body, "error", "error is a property");
        assert.equal(res.body.error, "Invalid characters in puzzle");
        done();
      });
  });  

  // Check a puzzle placement with incorrect length: POST request to /api/check
  test("POST - /api/check - puzzle", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: invalidLength,
        coordinate: validCoord,
        value: validValue
      })
      .end((err, res) => {
        assert.property(res.body, "error", "error is a property");
        assert.equal(res.body.error, "Expected puzzle to be 81 characters long");
        done();
      });
  });

  // Check a puzzle placement with invalid placement coordinate: POST request to /api/check
  test("POST - /api/check - Invalid placement coordinate", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: invalidCoord,
        value: validValue
      })
      .end((err, res) => {
        assert.property(res.body, "error", "error is a property");
        assert.equal(res.body.error, "Invalid coordinate");
        done();
      });
  });

  // Check a puzzle placement with invalid placement value: POST request to /api/check
  test("POST - /api/check - Invalid placement value", (done) => {
    chai.request(server)
      .post("/api/check")
      .send({
        puzzle: validPuzzle,
        coordinate: validCoord,
        value: invalidValue
      })
      .end((err, res) => {
        assert.property(res.body, "error", "error is a property");
        assert.equal(res.body.error, "Invalid value");
        done();
      });
  });

});
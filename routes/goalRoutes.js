const express = require("express");
const router = express.Router();

const { goalValidator } = require("../middleware/validator.js");
const goalController = require("../controllers/goalController.js");

// Rota: POST /goal/:userId
router.post("/:userId", goalValidator.create, goalController.createGoal);

// Rota: DELETE /goal/:userId/:goalId
router.delete(
  "/:userId/:goalId",
  goalValidator.delete,
  goalController.deleteGoal
);

module.exports = router;

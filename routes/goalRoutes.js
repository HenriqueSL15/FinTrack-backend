const express = require("express");
const router = express.Router();

const {
  goalValidator,
  validateRequest,
} = require("../middleware/validator.js");
const goalController = require("../controllers/goalController.js");

// Rota: POST /goal/:userId
router.post(
  "/:userId",
  goalValidator.create,
  validateRequest,
  goalController.createGoal
);

// Rota: GET /goal/:userId
router.get(
  "/:userId",
  goalValidator.get,
  validateRequest,
  goalController.getGoals
);

// Rota: DELETE /goal/:userId/:goalId
router.delete(
  "/:userId/:goalId",
  goalValidator.delete,
  validateRequest,
  goalController.deleteGoal
);

module.exports = router;

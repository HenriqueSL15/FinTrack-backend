const express = require("express");
const router = express.Router();

const goalController = require("../controllers/goalController.js");

// Rota: POST /goal/:userId
router.post("/:userId", goalController.createGoal);

// Rota: DELETE /goal/:userId/:goalId
router.delete("/:userId/:goalId", goalController.deleteGoal);

module.exports = router;

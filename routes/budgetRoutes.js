const express = require("express");
const router = express.Router();

const { budgetValidator } = require("../middleware/validator.js");
const budgetController = require("../controllers/budgetController.js");

// Rota: POST /budget/:userId/:categoryId
router.post(
  "/:userId/:categoryId",
  budgetValidator.create,
  budgetController.createBudget
);

// Rota: DELETE /budget/:userId/:budgetId
router.delete(
  "/:userId/:budgetId",
  budgetValidator.delete,
  budgetController.deleteBudget
);

// Rota: GET /budget/:userId
router.get("/:userId", budgetValidator.get, budgetController.getBudgets);

module.exports = router;

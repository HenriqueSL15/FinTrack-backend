const express = require("express");
const router = express.Router();

const {
  budgetValidator,
  validateRequest,
} = require("../middleware/validator.js");
const budgetController = require("../controllers/budgetController.js");

// Rota: POST /budget/:userId/:categoryId
router.post(
  "/:userId/:categoryId",
  budgetValidator.create,
  validateRequest,
  budgetController.createBudget
);

// Rota: DELETE /budget/:userId/:budgetId
router.delete(
  "/:userId/:budgetId",
  budgetValidator.delete,
  validateRequest,
  budgetController.deleteBudget
);

// Rota: GET /budget/:userId
router.get(
  "/:userId",
  budgetValidator.get,
  validateRequest,
  budgetController.getBudgets
);

module.exports = router;

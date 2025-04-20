const express = require("express");
const router = express.Router();

const budgetController = require("../controllers/budgetController.js");

// Rota: POST /budget/:userId/:categoryId
router.post("/:userId/:categoryId", budgetController.createBudget);

module.exports = router;

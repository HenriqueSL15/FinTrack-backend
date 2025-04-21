const express = require("express");
const router = express.Router();

const {
  transactionValidator,
  validateRequest,
} = require("../middleware/validator.js");
const transactionController = require("../controllers/transactionController.js");

// Rota: POST /transaction/:userId/:categoryId
router.post(
  "/:userId/:categoryId",
  transactionValidator.create,
  validateRequest,
  transactionController.createTransaction
);

// Rota: DELETE /transaction/:userId/:transactionId
router.delete(
  "/:userId/:transactionId",
  transactionValidator.delete,
  validateRequest,
  transactionController.deleteOneTransaction
);

// Rota: GET /transaction/:userId
router.get(
  "/:userId",
  transactionValidator.get,
  validateRequest,
  transactionController.getTransactions
);

module.exports = router;

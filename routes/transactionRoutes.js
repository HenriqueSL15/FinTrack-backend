const express = require("express");
const router = express.Router();

const { transactionValidator } = require("../middleware/validator.js");
const transactionController = require("../controllers/transactionController.js");

// Rota: POST /transaction/:userId/:categoryId
router.post(
  "/:userId/:categoryId",
  transactionValidator.create,
  transactionController.createTransaction
);

// Rota: DELETE /transaction/:userId/:transactionId
router.delete(
  "/:userId/:transactionId",
  transactionValidator.delete,
  transactionController.deleteOneTransaction
);

// Rota: GET /transaction/:userId
router.get(
  "/:userId",
  transactionValidator.get,
  transactionController.getTransactions
);

module.exports = router;

const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController.js");

// Rota: POST /transaction/:userId/:categoryId
router.post("/:userId/:categoryId", transactionController.createTransaction);

// Rota: DELETE /transaction/:userId/:transactionId
router.delete(
  "/:userId/:transactionId",
  transactionController.deleteOneTransaction
);

// Rota: GET /transaction/:userId
router.get("/:userId", transactionController.getTransactions);

module.exports = router;

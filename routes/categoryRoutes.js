const express = require("express");
const router = express.Router();

const {
  categoryValidator,
  validateRequest,
} = require("../middleware/validator.js");
const categoryController = require("../controllers/categoryController.js");

// Rota: POST /category
router.post(
  "/",
  categoryValidator.create,
  validateRequest,
  categoryController.createCategory
);

// Rota: DELETE /category/:userId/:categoryId
router.delete(
  "/:userId/:categoryId",
  categoryValidator.delete,
  validateRequest,
  categoryController.deleteCategory
);

// Rota: GET /category/:userId
router.get(
  "/:userId",
  categoryValidator.get,
  validateRequest,
  categoryController.getCategories
);

module.exports = router;

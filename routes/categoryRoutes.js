const express = require("express");
const router = express.Router();

const { categoryValidator } = require("../middleware/validator.js");
const categoryController = require("../controllers/categoryController.js");

// Rota: POST /category
router.post("/", categoryValidator.create, categoryController.createCategory);

// Rota: DELETE /category/:userId/:categoryId
router.delete(
  "/:userId/:categoryId",
  categoryValidator.delete,
  categoryController.deleteCategory
);

// Rota: GET /category/:userId
router.get("/:userId", categoryValidator.get, categoryController.getCategories);

module.exports = router;

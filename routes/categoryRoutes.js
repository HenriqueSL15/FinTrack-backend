const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController.js");

// Rota: POST /category
router.post("/", categoryController.createCategory);

// Rota: DELETE /category/:userId/:categoryId
router.delete("/:userId/:categoryId", categoryController.deleteCategory);

// Rota: GET /category/:userId
router.get("/:userId", categoryController.getCategories);

module.exports = router;

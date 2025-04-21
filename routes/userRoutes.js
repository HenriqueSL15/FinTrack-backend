const express = require("express");
const router = express.Router();

const { userValidator } = require("../middleware/validator.js");
const userController = require("../controllers/userController.js");

// Rota: POST /users
router.post("/", userValidator.create, userController.createUser);

// Rota: GET /users
router.get("/", userController.getUsers);

// Rota: GET /user/:userId
router.get("/:userId", userValidator.get, userController.getOneUser);

// Rota: POST /users/login
router.post("/login", userValidator.login, userController.loginUser);

// Rota: PUT /users/:userId
router.put("/:userId", userValidator.update, userController.updateUser);

module.exports = router;

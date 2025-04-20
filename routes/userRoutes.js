const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController.js");

// Rota: POST /users
router.post("/", userController.createUser);

// Rota: GET /users
router.get("/", userController.getUsers);

// Rota: GET /user/:userId
router.get("/:userId", userController.getOneUser);

// Rota: POST /users/login
router.post("/login", userController.loginUser);

// Rota: PUT /users/:userId
router.put("/:userId", userController.updateUser);

module.exports = router;

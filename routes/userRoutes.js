const express = require("express");
const router = express.Router();

const {
  userValidator,
  validateRequest,
} = require("../middleware/validator.js");
const userController = require("../controllers/userController.js");

// Rota: POST /users
router.post(
  "/",
  userValidator.create,
  validateRequest,
  userController.createUser
);

// Rota: GET /users
router.get("/", userController.getUsers);

// Rota: GET /user/:userId
router.get(
  "/:userId",
  userValidator.get,
  validateRequest,
  userController.getOneUser
);

// Rota: POST /users/login
router.post(
  "/login",
  userValidator.login,
  validateRequest,
  userController.loginUser
);

// Rota: PUT /users/:userId
router.put(
  "/:userId",
  userValidator.update,
  validateRequest,
  userController.updateUser
);

module.exports = router;

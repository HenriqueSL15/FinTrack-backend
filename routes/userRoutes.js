const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  refreshTokens,
  authorizeUser,
} = require("../middleware/auth.js");

const {
  userValidator,
  validateRequest,
} = require("../middleware/validator.js");
const userController = require("../controllers/userController.js");

// Rota: GET /users/me
router.get("/me", authenticateUser, userController.getCurrentUser);

// Rota: POST /users/register
router.post(
  "/register",
  userValidator.create,
  validateRequest,
  userController.createUser
);

// Rota: GET /users
router.get("/", userController.getUsers);

// Rota: GET /users/:userId
router.get(
  "/:userId",
  authenticateUser,
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
  authenticateUser,
  authorizeUser,
  userValidator.update,
  validateRequest,
  userController.updateUser
);

// Rota: POST /users/refresh-token
router.post("/refresh-token", refreshTokens);

// Rota: POST /users/logout
router.post("/logout", authenticateUser, userController.logoutUser);

module.exports = router;

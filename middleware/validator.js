const { body, param, validationResult } = require("express-validator");

// Middleware para verificar erros de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validadores para usuários
const userValidator = {
  create: [
    body("name").notEmpty().withMessage("Nome é obrigatório"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Senha é obrigatória"),
  ],
  update: [
    param("userId").isInt().withMessage("ID de usuário inválido"),
    body("theme").optional().isString().withMessage("Tema inválido"),
    body("currency").optional().isString().withMessage("Moeda inválida"),
    body("weekStartDay")
      .optional()
      .isString()
      .withMessage("Dia da semana inválido"),
  ],
  login: [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Senha é obrigatória"),
  ],
  get: [param("userId").isInt().withMessage("ID de usuário inválido")],
};

// Validadores para transações
const transactionValidator = {
  create: [
    body("description").notEmpty().withMessage("Descrição é obrigatória"),
    body("amount").isFloat().withMessage("Valor inválido"),
    body("type").isString().withMessage("Tipo inválido"),
    param("userId").isInt().withMessage("ID de usuário inválido"),
    param("categoryId").isInt().withMessage("ID de categoria inválido"),
  ],
  delete: [
    param("userId").isInt().withMessage("ID de usuário inválido"),
    param("transactionId").isInt().withMessage("ID de transação inválido"),
  ],
  get: [param("userId").isInt().withMessage("ID de usuário inválido")],
};

// Validadores para objetivos
const goalValidator = {
  create: [
    body("description").notEmpty().withMessage("Descrição é obrigatória"),
    body("targetAmount").isFloat().withMessage("Valor inválido"),
    body("targetDate").isDate().withMessage("Data inválida"),
    param("userId").isInt().withMessage("ID de usuário inválido"),
  ],
  delete: [
    param("userId").isInt().withMessage("ID de usuário inválido"),
    param("goalId").isInt().withMessage("ID de objetivo inválido"),
  ],
};

// Validadores para categorias
const categoryValidator = {
  create: [
    body("name").notEmpty().withMessage("Nome é obrigatório"),
    body("type").isString().withMessage("Tipo inválido"),
    body("userId").isInt().withMessage("ID de usuário inválido"),
  ],
  delete: [
    param("userId").isInt().withMessage("ID de usuário inválido"),
    param("categoryId").isInt().withMessage("ID de categoria inválido"),
  ],
  get: [param("userId").isInt().withMessage("ID de usuário inválido")],
};

// Validadores para orçamentos
const budgetValidator = {
  create: [
    body("monthYear").isDate().withMessage("Data inválida"),
    body("limitAmount").isFloat().withMessage("Valor inválido"),
    param("userId").isInt().withMessage("ID de usuário inválido"),
    param("categoryId").isInt().withMessage("ID de categoria inválido"),
  ],
  delete: [
    param("userId").isInt().withMessage("ID de usuário inválido"),
    param("budgetId").isInt().withMessage("ID de orçamento inválido"),
  ],
  get: [param("userId").isInt().withMessage("ID de usuário inválido")],
};

module.exports = {
  validateRequest,
  userValidator,
  transactionValidator,
  goalValidator,
  categoryValidator,
  budgetValidator,
};

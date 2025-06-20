const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/auth.js");

// Criptografa uma senha para a criação de um usuário
const createCriptographedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
};

// Verifica a senha enviada com a armazenada no banco de dados
const verifyPassword = async (password, passwordHash) => {
  const match = await bcrypt.compare(password, passwordHash);
  return match;
};

// Criação do usuário
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  console.log("Dados recebidos:", req.body);

  if (!name || !email || !password)
    return res.status(400).json({ message: "Preencha todos os campos" });

  // Verifica se o usuário já existe
  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Caso já exista, retorna um erro
  if (userExists) {
    return res.status(409).json({ message: "Usuário já existe" });
  }

  // Criptografia da senha
  const passwordHash = await createCriptographedPassword(password);

  // Criação do usuário no banco
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  // Criação da categoria OBJETIVOS padrão
  const goalCategory = await prisma.category.create({
    data: {
      name: "Objetivos",
      type: "goal",
      userId: user.id,
    },
  });

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.passwordHash;

  res
    .status(201)
    .json({ message: "Usuário criado com sucesso!", userWithoutPassword });
};

// Atualização do usuário
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { theme, currency } = req.body;

  // Possíveis temas para update
  const possibleThemes = ["light", "dark", "system"];

  // Possíveis opções de moeda
  const possibleCurrencies = ["BRL", "USD", "EUR"];

  // Cria um ojeto de dados apenas com os campos que foram fornecidos
  const updatedData = {};

  // Adiciona ao objeto apenas os campos que existem no req.body e são válidos
  if (theme !== undefined && possibleThemes.includes(theme.toLowerCase()))
    updatedData.theme = theme.toLowerCase();

  if (!possibleThemes.includes(theme.toLowerCase())) {
    return res.status(400).json({ message: "Tema inválido" });
  }

  if (
    currency !== undefined &&
    possibleCurrencies.includes(currency.toUpperCase())
  )
    updatedData.currency = currency.toUpperCase();

  if (!possibleCurrencies.includes(currency.toUpperCase())) {
    return res.status(400).json({ message: "Moeda inválida" });
  }

  // Se nenhum campo foi fornecido, retorna erro
  if (Object.keys(updatedData).length == 0) {
    return res
      .status(400)
      .json({ message: "Nenhum dado fornecido / Dados inválidos" });
  }

  // Atualiza apenas os campos fornecidos
  const user = await prisma.user.update({
    where: {
      id: Number(userId),
    },
    data: updatedData,
  });

  // Cria uma nova cópia sem a senha para retornar
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.passwordHash;

  res.status(200).json({
    message: "Usuário atualizado com sucesso!",
    user: userWithoutPassword,
  });
};

// Loga em uma conta
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Verifica se o usuário existe
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Se não existir, retorna erro
  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  // Verifica se a senha está correta
  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);

  // Caso não esteja, retorna um erro
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Senha incorreta" });
  }

  // Gera tokens de acesso e atualização
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Remove a senha do objeto retornado
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.passwordHash;

  // Define os cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutos
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });

  res
    .status(200)
    .json({ message: "Login realizado com sucesso!", userWithoutPassword });
};

// Retorna todos os usuários
exports.getUsers = async (req, res) => {
  // Busca todos os usuários
  const users = await prisma.user.findMany();

  res.status(200).json({ users });
};

// Retorna um usuário em específico
exports.getOneUser = async (req, res) => {
  const userId = req.user.id;

  const user = prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.passwordHash;

  return res.status(200).json({ user: userWithoutPassword });
};

// Obtem usuário atual
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive data
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;

    return res.status(200).json({ user: userWithoutPassword });
  } catch (err) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Desloga o usuário
exports.logoutUser = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout realizado com sucesso!" });
};

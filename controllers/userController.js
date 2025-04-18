const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

const createCriptographedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
};

const verifyPassword = async (password, passwordHash) => {
  const match = await bcrypt.compare(password, passwordHash);
  return match;
};

//Criação do usuário
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const passwordHash = await createCriptographedPassword(password);
  // Criação do usuário no banco
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.passwordHash;

  res
    .status(201)
    .json({ message: "Usuário criado com sucesso!", userWithoutPassword });
};

//Loga em uma conta
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  const isPasswordCorrect = await verifyPassword(password, user.passwordHash);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Senha incorreta" });
  }

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.passwordHash;

  res
    .status(200)
    .json({ message: "Login realizado com sucesso!", userWithoutPassword });
};

//Retorna todos os usuários
exports.getUsers = async (req, res) => {
  const users = await prisma.user.findMany();

  res.status(200).json({ users });
};

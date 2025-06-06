const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

// Chaves secretas (coloque em variáveis de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_temporaria";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "sua_chave_refresh_temporaria";

// Gera um token JWT de acesso (curta duração)
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" } // Token expira em 15 minutos
  );
};

// Gera um refresh token (longa duração)
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" } // Refresh token expira em 7 dias
  );
};

// Middleware para verificar se o usuário está autenticado
exports.authenticateUser = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verifica se o usuário existe no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    // Se o token expirou, tenta usar o refresh token
    return res.status(401).json({
      message: "Token expirado ou inválido",
      tokenExpired: true,
    });
  }
};

// Middleware para verificar e renovar tokens
exports.refreshTokens = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token não encontrado" });
  }

  try {
    // Verifica se o refresh token é válido
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Gera novos tokens
    const accessToken = exports.generateAccessToken(user);
    const newRefreshToken = exports.generateRefreshToken(user);

    // Define os cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    // Remove a senha do objeto retornado
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;

    return res.status(200).json({
      message: "Tokens renovados com sucesso",
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido" });
  }
};

// Middleware para autorização
exports.authorizeUser = (req, res, next) => {
  const userId = parseInt(req.params.userId);

  if (req.user.id !== userId) {
    return res.status(403).json({ message: "Acesso negado" });
  }

  next();
};

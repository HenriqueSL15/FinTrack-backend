// Carrega o arquivo .env apropriado
if (process.env.NODE_ENV === "test") {
  // Durante testes, o .env.test já deve ter sido carregado pelo Jest
  // através do setupTests.js, então não fazemos nada aqui
} else if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env.production" });
} else {
  require("dotenv").config(); // Carrega o .env padrão para desenvolvimento
}

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const transactionRoutes = require("./routes/transactionRoutes.js");
const budgetRoutes = require("./routes/budgetRoutes.js");
const goalRoutes = require("./routes/goalRoutes.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const errorHandler = require("./middleware/errorHandler.js");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "https://fintrackbr.netlify.app",
      "https://fintrack-tests.netlify.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/test-db-connection", async (req, res) => {
  console.log("DB_URL atual:", process.env.DATABASE_URL);
  try {
    // Tenta fazer uma consulta simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    res.json({
      success: true,
      message: "Conexão com o banco de dados estabelecida com sucesso",
      result,
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao conectar ao banco de dados",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  }
});

// Rota raiz para verificar se o servidor está funcionando
app.get("/", (req, res) => {
  res.json({
    message: "FinTrack API está funcionando!",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

// Rotas do usuário
app.use("/users", userRoutes);

// Rotas de categoria
app.use("/category", categoryRoutes);

// Rotas de transação
app.use("/transaction", transactionRoutes);

// Rotas de orçamento
app.use("/budget", budgetRoutes);

// Rotas de objetivo
app.use("/goal", goalRoutes);

// Rota de teste para limpar o banco de dados
app.post("/test/clean", async (req, res) => {
  try {
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    res.status(200).json({ message: "Banco de dados limpo com sucesso!" });
  } catch (err) {
    console.error("Erro ao limpar banco de dados:", err);
  }
});

app.use(errorHandler);

module.exports = app;

// Iniciar servidor apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log("Servidor está sendo executado!", port));
}

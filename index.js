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

const errorHandler = require("./middleware/errorHandler.js");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["https://fintrackbr.netlify.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/env-check", (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
    cookieSettings: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  });
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

app.use(errorHandler);

module.exports = app;

// Iniciar servidor apenas se não estiver em aibmente de teste
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log("Servidor está sendo executado!", port));
}

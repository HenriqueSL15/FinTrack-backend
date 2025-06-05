if (process.env.NODE_ENV === "test") {
  require("dotenv").config({ path: ".env.test" });
} else {
  require("dotenv").config();
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
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

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

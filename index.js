const express = require("express");
require("dotenv").config();
// const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js");

const app = express();
const port = process.env.PORT || 3000;

//Middleware
// app.use(cors());
app.use(express.json());

//Rotas
app.use("/users", userRoutes);

//Iniciar servidor
app.listen(port, () => console.log("Servidor está sendo executado!", port));

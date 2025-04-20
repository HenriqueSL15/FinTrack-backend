/**
 * Middleware global para tratamento de erros
 * Captura todos os erros lançados durante o processamento de requisições
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Determina o código de status HTTP apropriado
  const statusCode = err.statusCode || 500;

  // Contrói a resposta de erro
  const errorResponse = {
    message: err.message || "Ocorreu um erro no servidor",
    // Inclui detalhes do erro apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.details,
    }),
  };
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;

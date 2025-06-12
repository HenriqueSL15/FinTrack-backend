const errorHandler = (err, req, res, next) => {
  // Log detalhado do erro
  console.error("ERROR HANDLER CAUGHT:");
  console.error(`Status: ${err.statusCode || 500}`);
  console.error(`Message: ${err.message}`);
  console.error(`Path: ${req.path}`);
  console.error(`Method: ${req.method}`);
  console.error(`Headers:`, req.headers);
  console.error(`Body:`, req.body);
  console.error(`Stack:`, err.stack);

  // Determina o código de status HTTP apropriado
  const statusCode = err.statusCode || 500;

  // Contrói a resposta de erro
  const errorResponse = {
    message: err.message || "Ocorreu um erro no servidor",
    path: req.path,
    method: req.method,
    // Inclui detalhes do erro apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
      details: err.details,
    }),
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;

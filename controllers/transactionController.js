const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cria nova transação
exports.createTransaction = async (req, res) => {
  const { description, amount, type } = req.body;
  const { userId, categoryId } = req.params;

  // Verifica se algum campo está vazio
  const isEmpty = !description || !amount || !type;

  // Se estiver vazio, retorna erro
  if (isEmpty) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  const possibleTypes = ["income", "expense"];

  // Verifica se o type é válido
  if (!possibleTypes.includes(type.toLowerCase())) {
    return res.status(400).json({ message: "Tipo inválido" });
  }

  // Cria a transação
  const transaction = await prisma.transaction.create({
    data: {
      description,
      amount,
      type: type.toLowerCase(),
      userId: Number(userId),
      categoryId: Number(categoryId),
    },
  });

  res
    .status(201)
    .json({ message: "Transação criada com sucesso!", transaction });
};

// Delete uma transação
exports.deleteOneTransaction = async (req, res) => {
  const { transactionId, userId } = req.params;

  const transaction = await prisma.transaction.delete({
    where: {
      id: Number(transactionId),
      userId: Number(userId),
    },
  });

  return res
    .status(200)
    .json({ message: "Transação deletada com sucesso!", transaction });
};

// Retorna todas as transações de um usuário
exports.getTransactions = async (req, res) => {
  const { userId } = req.params;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: Number(userId),
    },
  });

  return res.status(200).json({ transactions });
};

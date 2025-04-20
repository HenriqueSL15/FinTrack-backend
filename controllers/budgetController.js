const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cria um orçamento
exports.createBudget = async (req, res) => {
  const { monthYear, limitAmount } = req.body;
  const { userId, categoryId } = req.params;

  // Verifica se algum campo está vazio
  const anythingEmpty = !monthYear || !limitAmount;

  // Se estiver vazio, retorna erro
  if (anythingEmpty) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  // Verifica se o usuário existe
  if (
    !(await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    }))
  ) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  // Verifica se o usuário existe
  if (
    !(await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
    }))
  ) {
    return res.status(404).json({ message: "Categoria não encontrada" });
  }

  const budget = await prisma.budget.create({
    data: {
      monthYear,
      limitAmount,
      userId: Number(userId),
      categoryId: Number(categoryId),
    },
  });

  return res
    .status(201)
    .json({ message: "Orçamento criado com sucesso!", budget });
};

// Deleta um orçamento
exports.deleteBudget = async (req, res) => {
  const { budgetId, userId } = req.params;

  // Verifica se o usuário existe
  if (
    !(await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    }))
  ) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  // Verifica se a budget existe
  if (
    !(await prisma.budget.findUnique({
      where: {
        id: Number(budgetId),
        userId: Number(userId),
      },
    }))
  ) {
    return res.status(404).json({ message: "Orçamento não encontrado" });
  }

  const budget = await prisma.budget.delete({
    where: {
      id: Number(budgetId),
      userId: Number(userId),
    },
  });

  return res
    .status(200)
    .json({ message: "Orçamento deletado com sucesso!", budget });
};

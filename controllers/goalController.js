const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cria um novo objetivo
exports.createGoal = async (req, res) => {
  const { description, targetAmount, targetDate } = req.body;
  const { userId } = req.params;

  // Verifica se algum campo está vazio
  const isAnythingEmpty = !description || !targetAmount || !targetDate;

  // Se estiver vazio, retorna erro
  if (isAnythingEmpty) {
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

  // Cria o objetivo
  const goal = await prisma.goal.create({
    data: {
      description,
      targetAmount,
      targetDate,
      userId: Number(userId),
    },
  });

  return res
    .status(201)
    .json({ message: "Objetivo criado com sucesso!", goal });
};

// Retorna todos os objetivos de um usuário
exports.getGoals = async (req, res) => {
  const { userId } = req.params;

  const goals = await prisma.goal.findMany({
    where: {
      userId: Number(userId),
    },
  });
  console.log(goals);
  return res.status(200).json({ goals });
};

// Deleta o objetivo de um usuário
exports.deleteGoal = async (req, res) => {
  const { goalId, userId } = req.params;

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

  // Deleta o objetivo
  const goal = await prisma.goal.delete({
    where: {
      id: goalId,
      userId: userId,
    },
  });

  return res
    .status(200)
    .json({ message: "Objetivo deletado com sucesso!", goal });
};

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

  return res.status(200).json({ goals });
};

// Atualiza um objetivo de um usuário
exports.updateGoal = async (req, res) => {
  const { goalId, userId } = req.params;
  const { description, targetAmount, currentAmount, targetDate } = req.body;

  // Procura o objetivo
  const goal = await prisma.goal.findUnique({
    where: {
      id: Number(goalId),
      userId: Number(userId),
    },
    include: {
      transactions: true,
    },
  });

  // Retorna erro se o objetivo não existir
  if (!goal) {
    return res.status(404).json({ message: "Objetivo não encontrado" });
  }

  // Verifica se algo foi alterado
  const isEverythingEqual =
    goal.description === description &&
    goal.targetAmount === targetAmount &&
    goal.currentAmount === currentAmount &&
    goal.targetDate.toISOString() === targetDate;

  // Se nada foi alterado, retorna erro
  if (isEverythingEqual) {
    return res.status(400).json({ message: "Nada foi alterado" });
  }

  // Preenche os campos que não foram preenchidos para só atualizar o que foi alterado
  const data = {
    description:
      description != goal.description ? description : goal.description,
    targetAmount:
      targetAmount != goal.targetAmount ? targetAmount : goal.targetAmount,
    currentAmount:
      currentAmount != goal.currentAmount ? currentAmount : goal.currentAmount,
    targetDate:
      targetDate != goal.targetDate.toISOString()
        ? targetDate
        : goal.targetDate,
  };

  // Atualiza o objetivo
  const updatedGoal = await prisma.goal.update({
    where: {
      id: Number(goalId),
      userId: Number(userId),
    },
    data: {
      ...data,
    },
  });

  // Retorna o objetivo atualizado
  return res.status(200).json({
    message: "Objetivo atualizado com sucesso!",
    goal: updatedGoal,
  });
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
      id: Number(goalId),
      userId: Number(userId),
    },
  });

  return res
    .status(200)
    .json({ message: "Objetivo deletado com sucesso!", goal });
};

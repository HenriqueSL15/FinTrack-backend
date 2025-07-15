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

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

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
  const { description, targetAmount, currentAmount, targetDate, status } =
    req.body;

  let updatedAmount = currentAmount;

  if (status) {
    const goal = await prisma.goal.update({
      where: {
        id: Number(goalId),
        userId: Number(userId),
      },
      data: {
        status,
      },
    });

    return res
      .status(200)
      .json({ message: "Status do objetivo atualizado com sucesso!", goal });
  }

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

  // Verifica se o targetAmount é um número
  if (typeof targetAmount !== "number" && isNaN(Number(targetAmount))) {
    return res.status(400).json({ message: "Valor inválido" });
  }

  // Verifica se algo foi alterado
  const isEverythingEqual =
    goal.description === description &&
    goal.targetAmount === targetAmount &&
    goal.currentAmount === updatedAmount &&
    goal.targetDate.toISOString() === targetDate;

  // Se nada foi alterado, retorna erro
  if (isEverythingEqual) {
    return res.status(400).json({ message: "Nada foi alterado" });
  }

  if (updatedAmount > goal.targetAmount) updatedAmount = goal.targetAmount;

  const amount = updatedAmount - goal.currentAmount;

  if (amount < 0) {
    return res.status(400).json({
      message: "O valor atual não pode ser menor que o valor atual do objetivo",
    });
  }

  if (typeof amount !== "number" || isNaN(amount)) {
    return res.status(400).json({ message: "Valor de amount inválido" });
  }

  // Preenche os campos que não foram preenchidos para só atualizar o que foi alterado
  const data = {
    description:
      description != goal.description ? description : goal.description,
    targetAmount:
      targetAmount != goal.targetAmount ? targetAmount : goal.targetAmount,
    currentAmount: updatedAmount,
    targetDate,
  };

  // Cria transação de tipo Goal
  const goalTransaction = await prisma.transaction.create({
    data: {
      description: data.description,
      amount: amount,
      type: "goal",
      user: {
        connect: { id: Number(userId) },
      },
      goal: {
        connect: { id: Number(goalId) },
      },
      date: new Date(),
    },
  });

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
    goalTransaction,
  });
};

// Deleta o objetivo de um usuário
exports.deleteGoal = async (req, res) => {
  const { goalId, userId, percentage } = req.params;

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

  if (percentage) {
    if (percentage == 100) {
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
    } else {
      await prisma.transaction.deleteMany({
        where: {
          type: "goal",
          goalId: Number(goalId),
        },
      });

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
    }
  }
};

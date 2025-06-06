const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cria nova transação
exports.createTransaction = async (req, res) => {
  const { description, amount, type, goalId } = req.body;
  const { userId, categoryId } = req.params;

  // Verifica se algum campo está vazio
  const isEmpty = !description || !amount || !type;

  // Se estiver vazio, retorna erro
  if (isEmpty) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  const possibleTypes = ["income", "expense", "goal"];

  // Verifica se o type é válido
  if (!possibleTypes.includes(type.toLowerCase())) {
    return res.status(400).json({ message: "Tipo inválido" });
  }

  if (type.toLowerCase() === "goal" && !goalId) {
    return res.status(400).json({
      message: "ID do objetivo é obrigatório para transações do tipo 'goal'",
    });
  }

  try {
    // Se for uma transação para objetivo, usa uma transação do Prisma para garantir consistência
    if (type.toLowerCase() === "goal") {
      const result = await prisma.$transaction(async (tx) => {
        // Verifica se o objetivo existe
        const goal = await tx.goal.findUnique({
          where: {
            id: Number(goalId),
            userId: Number(userId),
          },
        });

        if (!goal) {
          throw new Error("Objetivo não encontrado");
        }

        // Verifica se o usuário existe
        const user = await tx.user.findUnique({
          where: {
            id: Number(userId),
          },
        });

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        // Verifica se a categoria existe
        const category = await tx.category.findUnique({
          where: {
            id: Number(categoryId),
          },
        });

        if (!category) {
          throw new Error("Categoria não encontrada");
        }

        // Cria a transação
        const transaction = await tx.transaction.create({
          data: {
            description,
            amount: Number(amount),
            type: type.toLowerCase(),
            userId: Number(userId),
            categoryId: Number(categoryId),
            goalId: Number(goalId),
          },
        });

        // Atualiza o valor atual do objetivo
        const updatedGoal = await tx.goal.update({
          where: {
            id: Number(goalId),
          },
          data: {
            currentAmount: goal.currentAmount + Number(amount),
            status:
              goal.currentAmount + Number(amount) >= goal.targetAmount
                ? "completed"
                : goal.status,
          },
        });

        return { transaction, updatedGoal };
      });

      return res.status(201).json({
        message: "Transação para objetivo criada com sucesso!",
        transaction: result.transaction,
        goal: result.updatedGoal,
      });
    } else {
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

      // Verifica se a categoria existe
      if (
        !(await prisma.category.findUnique({
          where: {
            id: Number(categoryId),
          },
        }))
      ) {
        return res.status(404).json({ message: "Categoria não encontrada" });
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
    }
  } catch (err) {
    console.error("Erro ao criar transação:", err);
    return res.status(500).json({
      message: "Erro ao criar transação",
      error: err.message,
    });
  }
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

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: Number(userId),
    },
    include: {
      category: true,
      goal: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({ transactions });
};

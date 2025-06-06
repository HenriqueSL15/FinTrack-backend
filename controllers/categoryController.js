const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cria uma nova categoria
exports.createCategory = async (req, res) => {
  const { name, type, userId } = req.body;

  const possibleTypes = ["income", "expense"];

  // Verifica se algum campo está vazio
  const anythingEmpty = !name || !type || !userId;

  // Se estiver vazio, retorna erro
  if (anythingEmpty) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  // Procura se a categoria já existe
  const categoryExists = await prisma.category.findFirst({
    where: {
      name,
      type,
      userId: Number(userId),
    },
  });

  // Retorna um erro caso ela já exista
  if (categoryExists) {
    return res.status(409).json({ message: "Categoria já existe" });
  }
  // Verifica se o type é válido
  if (!possibleTypes.includes(type.toLowerCase())) {
    return res.status(400).json({ message: "Tipo inválido" });
  }

  //Verifica se o usuário existe
  if (
    !(await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    }))
  ) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  // Caso não exista, cria a categoria
  const category = await prisma.category.create({
    data: {
      name,
      type: type.toLowerCase(),
      userId: Number(userId),
    },
  });

  res.status(201).json({ message: "Categoria criada com sucesso!", category });
};

// Deleta uma categoria
exports.deleteCategory = async (req, res) => {
  const { categoryId, userId } = req.params;

  // Procura a categoria e deleta
  const category = await prisma.category.delete({
    where: {
      userId: Number(userId),
      id: Number(categoryId),
    },
  });

  return res
    .status(200)
    .json({ message: "Categoria deletada com sucesso!", category });
};

// Retorna todas as categorias
exports.getCategories = async (req, res) => {
  const { userId } = req.params;

  if (!userId)
    return res.status(400).json({ message: "Preencha todos os campos" });

  //Verifica se o usuário existe
  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  // Obtem todas as categorias
  const categories = await prisma.category.findMany({
    where: {
      userId: Number(userId),
    },
  });

  return res.status(200).json({ categories });
};

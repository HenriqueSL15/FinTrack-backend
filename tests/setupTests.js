require("dotenv").config({ path: ".env.test" });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

beforeEach(async () => {
  if (!process.env.DATABASE_URL.includes("test")) {
    throw new Error("NUNCA rode testes em banco de produção/desenvolvimento!");
  }
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

require("dotenv").config({ path: ".env.test" });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

beforeEach(async () => {
  console.log("DB_URL atual:", process.env.DATABASE_URL);
  if (!process.env.DATABASE_URL.includes("@ep-dark-sunset-accun349-pooler")) {
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

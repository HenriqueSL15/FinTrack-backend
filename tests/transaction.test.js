const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

let userId, categoryId, transactionId;

// Transaction Endpoints
describe("Transaction endpoints", () => {
  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Tran",
        email: "tran@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    userId = user.id;
    const category = await prisma.category.create({
      data: { name: "Salário", type: "income", userId },
    });
    categoryId = category.id;
  });

  it("POST /transaction/:userId/:categoryId - cria transação", async () => {
    const res = await request(app)
      .post(`/transaction/${userId}/${categoryId}`)
      .send({ description: "Salário", amount: 1000, type: "income" });
    expect(res.statusCode).toBe(201);
    expect(res.body.transaction).toBeDefined();
    transactionId = res.body.transaction.id;
  });

  it("GET /transaction/:userId - lista transações", async () => {
    await prisma.transaction.create({
      data: {
        description: "Salário",
        amount: 1000,
        type: "income",
        userId,
        categoryId,
      },
    });
    const res = await request(app).get(`/transaction/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });
});

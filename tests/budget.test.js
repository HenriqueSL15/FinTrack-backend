const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

let userId, categoryId, budgetId;

// Budget Endpoints
describe("Budget endpoints", () => {
  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Budget",
        email: "budget@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    userId = user.id;
    const category = await prisma.category.create({
      data: { name: "Alimentação", type: "expense", userId },
    });
    categoryId = category.id;
  });

  it("POST /budget/:userId/:categoryId - cria orçamento", async () => {
    const res = await request(app)
      .post(`/budget/${userId}/${categoryId}`)
      .send({ monthYear: "2024-06-01T00:00:00.000Z", limitAmount: 1000 });
    expect(res.statusCode).toBe(201);
    expect(res.body.budget).toBeDefined();
    budgetId = res.body.budget.id;
  });

  it("GET /budget/:userId - lista orçamentos", async () => {
    await prisma.budget.create({
      data: {
        monthYear: new Date("2024-06-01T00:00:00.000Z"),
        limitAmount: 1000,
        userId,
        categoryId,
      },
    });
    const res = await request(app).get(`/budget/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.budgets)).toBe(true);
  });
});

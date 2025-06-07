const request = require("supertest");
const app = require("../../index");
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

  describe("POST /budget/:userId/:categoryId", () => {
    it("SUCESSO - cria orçamento", async () => {
      const res = await request(app)
        .post(`/budget/${userId}/${categoryId}`)
        .send({ monthYear: "2024-06-01T00:00:00.000Z", limitAmount: 1000 });
      expect(res.statusCode).toBe(201);
      expect(res.body.budget).toBeDefined();
      budgetId = res.body.budget.id;
    });

    it("FALHA - campos vazios", async () => {
      const res1 = await request(app)
        .post(`/budget/${userId}/${categoryId}`)
        .send({ monthYear: "", limitAmount: 1000 });

      const res2 = await request(app)
        .post(`/budget/${userId}/${categoryId}`)
        .send({ monthYear: "2024-06-01T00:00:00.000Z", limitAmount: "" });

      expect(res1.statusCode).toBe(400);
      expect(res2.statusCode).toBe(400);
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app)
        .post(`/budget/99999/${categoryId}`)
        .send({ monthYear: "2024-06-01T00:00:00.000Z", limitAmount: 1000 });

      expect(res.statusCode).toBe(404);
    });

    it("FALHA - categoria inválida", async () => {
      const res = await request(app)
        .post(`/budget/${userId}/99999`)
        .send({ monthYear: "2024-06-01T00:00:00.000Z", limitAmount: 1000 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /budget/:userId", () => {
    it("SUCESSO - lista orçamentos", async () => {
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
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app).get(`/budget/99999`);
      expect(res.statusCode).toBe(404);
    });

    it("FALHA - usuário não existe", async () => {
      const res = await request(app).get(`/budget/0`);
      expect(res.statusCode).toBe(404);
    });
  });
});

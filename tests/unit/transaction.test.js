const request = require("supertest");
const app = require("../../index");
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

  describe("POST /transaction/:userId/:categoryId", () => {
    it("SUCESSO - cria transação", async () => {
      const res = await request(app)
        .post(`/transaction/${userId}/${categoryId}`)
        .send({
          description: "Salário",
          amount: 1000,
          type: "income",
          date: new Date(),
        });
      expect(res.statusCode).toBe(201);
    });

    it("SUCESSO - cria transação para objetivo", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
        date: new Date(),
      });
      const goalId = goal.body.goal.id;

      const res = await request(app)
        .post(`/transaction/${userId}/${categoryId}`)
        .send({
          description: "Viagem",
          amount: 1000,
          type: "goal",
          goalId,
          date: "01-01-2025",
        });

      expect(res.statusCode).toBe(201);
    });

    it("FALHA - tipo inválido", async () => {
      const res = await request(app)
        .post(`/transaction/${userId}/${categoryId}`)
        .send({
          description: "Salário",
          amount: 1000,
          type: "invalid_type",
          date: "01-01-2025",
        });

      expect(res.statusCode).toBe(400);
    });

    it("FALHA - campos vazios", async () => {
      const res1 = await request(app)
        .post(`/transaction/${userId}/${categoryId}`)
        .send({
          description: "",
          amount: 1000,
          type: "income",
          date: "01-01-2025",
        });

      const res2 = await request(app)
        .post(`/transaction/${userId}/${categoryId}`)
        .send({
          description: "Salário",
          amount: "",
          type: "income",
          date: "01-01-2025",
        });
      const res3 = await request(app)
        .post(`/transaction/${userId}/${categoryId}`)
        .send({
          description: "Salário",
          amount: 1000,
          type: "",
          date: "01-01-2025",
        });

      expect(res1.statusCode).toBe(400);
      expect(res2.statusCode).toBe(400);
      expect(res3.statusCode).toBe(400);
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app)
        .post(`/transaction/99999/${categoryId}`)
        .send({
          description: "Salário",
          amount: 1000,
          type: "income",
          date: "01-01-2025",
        });

      expect(res.statusCode).toBe(404);
    });

    it("FALHA - categoria inválida", async () => {
      const res = await request(app).post(`/transaction/${userId}/99999`).send({
        description: "Salário",
        amount: 1000,
        type: "income",
        date: new Date(),
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /transaction/:userId", () => {
    it("SUCESSO - lista transações", async () => {
      const date = new Date();

      await prisma.transaction.create({
        data: {
          description: "Salário",
          amount: 1000,
          type: "income",
          userId,
          categoryId,
          date: date,
        },
      });
      const res = await request(app).get(`/transaction/${userId}`);
      expect(res.statusCode).toBe(200);
    });

    it("SUCESSO - lista transações para objetivo", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });
      const goalId = goal.body.goal.id;

      const date = new Date();

      await prisma.transaction.create({
        data: {
          description: "Viagem",
          amount: 1000,
          type: "goal",
          userId,
          categoryId,
          goalId,
          date: date,
        },
      });
      const res = await request(app).get(`/transaction/${userId}`);
      expect(res.statusCode).toBe(200);
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app).get(`/transaction/99999`);
      expect(res.statusCode).toBe(404);
    });
  });
});

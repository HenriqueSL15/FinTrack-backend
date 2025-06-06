const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

let userId, goalId;

// Goal Endpoints
describe("Goal endpoints", () => {
  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Goal",
        email: "goal@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    userId = user.id;
  });

  describe("POST /goal/:userId", () => {
    it("SUCESSO - cria objetivo", async () => {
      const res = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

      expect(res.statusCode).toBe(201);
      goalId = res.body.goal.id;
    });

    it("FALHA - campos vazios", async () => {
      const res1 = await request(app).post(`/goal/${userId}`).send({
        description: "",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

      const res2 = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: "",
        targetDate: "2025-01-01T00:00:00.000Z",
      });

      const res3 = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "",
      });

      expect(res1.statusCode).toBe(400);
      expect(res2.statusCode).toBe(400);
      expect(res3.statusCode).toBe(400);
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app).post(`/goal/99999`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /goal/:userId", () => {
    it("SUCESSO - lista objetivos", async () => {
      await prisma.goal.create({
        data: {
          description: "Viagem",
          targetAmount: 5000,
          targetDate: new Date("2025-01-01T00:00:00.000Z"),
          userId,
        },
      });
      const res = await request(app).get(`/goal/${userId}`);
      expect(res.statusCode).toBe(200);
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app).get(`/goal/99999`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /goal/:userId/:goalId", () => {
    it("SUCESSO - atualiza objetivo", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });
      goalId = goal.body.goal.id;

      const res = await request(app).put(`/goal/${userId}/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

      expect(res.statusCode).toBe(200);
    });

    it("FALHA - objetivo inválido", async () => {
      const res = await request(app).put(`/goal/${userId}/99999`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

      expect(res.statusCode).toBe(404);
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app).put(`/goal/99999/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: "2025-01-01T00:00:00.000Z",
      });

      expect(res.statusCode).toBe(404);
    });
  });
});

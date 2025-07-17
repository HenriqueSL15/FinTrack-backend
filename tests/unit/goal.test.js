const request = require("supertest");
const app = require("../../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

let userId, goalId;

// Goal Endpoints
describe("Goal endpoints", () => {
  beforeEach(async () => {
    await prisma.goal.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        name: "Goal",
        email: "goal@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.goal.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
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
    const date = new Date();

    it("SUCESSO - atualiza objetivo", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: date,
      });
      goalId = goal.body.goal.id;

      const res = await request(app).put(`/goal/${userId}/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 500,
        targetDate: date,
      });

      expect(res.statusCode).toBe(200);
    });

    it("FALHA - objetivo inválido", async () => {
      const res = await request(app).put(`/goal/${userId}/99999`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: date,
      });

      expect(res.statusCode).toBe(404);
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app).put(`/goal/99999/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: date,
      });

      expect(res.statusCode).toBe(404);
    });

    it("SUCESSO - atualiza apenas o status do objetivo", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: date,
      });
      goalId = goal.body.goal.id;

      const res = await request(app).put(`/goal/${userId}/${goalId}`).send({
        status: "completed",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.goal.status).toBe("completed");
    });

    it("FALHA - retorna 400 se nada foi alterado", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 0,
        targetDate: date,
      });
      goalId = goal.body.goal.id;

      const res = await request(app).put(`/goal/${userId}/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 0,
        targetDate: date,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Nada foi alterado");
    });

    it("FALHA - retorna 400 se amount for menor que currentAmount", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        targetDate: date,
      });
      goalId = goal.body.goal.id;

      await request(app).put(`/goal/${userId}/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 900,
        targetDate: date,
      });

      const res = await request(app).put(`/goal/${userId}/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 500,
        targetDate: date,
      });

      expect(res.statusCode).toBe(400);
    });

    it("FALHA - retorna 400 se amount for NaN", async () => {
      const goal = await request(app).post(`/goal/${userId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: 1000,
        targetDate: date,
      });
      goalId = goal.body.goal.id;

      const res = await request(app).put(`/goal/${userId}/${goalId}`).send({
        description: "Viagem",
        targetAmount: 5000,
        currentAmount: "not-a-number",
        targetDate: date,
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("DELETE /goal/:userId/:goalId/:percentage", () => {
    it("SUCESSO - deleta objetivo com 100% de porcentagem", async () => {
      let date = new Date();
      date.setTime(date.getTime() + 1000 * 60 * 60 * 24);

      // Create a goal to delete
      const goal = await prisma.goal.create({
        data: {
          description: "Viagem",
          targetAmount: 5000,
          targetDate: date,
          userId,
        },
      });
      goalId = goal.id;

      const res = await request(app).delete(`/goal/${userId}/${goalId}/100`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Objetivo deletado com sucesso!");
    });

    it("FALHA - usuário inválido", async () => {
      const res = await request(app).delete(`/goal/99999/${goalId}`);
      expect(res.statusCode).toBe(404);
    });

    it("FALHA - objetivo inválido", async () => {
      const res = await request(app).delete(`/goal/${userId}/99999`);
      expect(res.statusCode).toBe(404);
    });

    it("SUCESSO - deleta objetivo com porcentagem diferente de 100", async () => {
      let date = new Date();
      date.setTime(date.getTime() + 1000 * 60 * 60 * 24);

      // Create a goal to delete
      const goal = await prisma.goal.create({
        data: {
          description: "Viagem",
          targetAmount: 5000,
          targetDate: date,
          userId,
        },
      });
      goalId = goal.id;

      const res = await request(app).delete(`/goal/${userId}/${goalId}/50`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Objetivo deletado com sucesso!");
    });
  });
});

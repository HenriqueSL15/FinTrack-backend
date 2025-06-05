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

  it("POST /goal/:userId - cria objetivo", async () => {
    const res = await request(app).post(`/goal/${userId}`).send({
      description: "Viagem",
      targetAmount: 5000,
      targetDate: "2025-01-01T00:00:00.000Z",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.goal).toBeDefined();
    goalId = res.body.goal.id;
  });

  it("GET /goal/:userId - lista objetivos", async () => {
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
    expect(Array.isArray(res.body.goals)).toBe(true);
  });
});

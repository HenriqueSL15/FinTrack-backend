const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

let userId, categoryId;

// Category Endpoints
describe("Category endpoints", () => {
  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Cat",
        email: "cat@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    userId = user.id;
  });

  it("POST /category - cria categoria", async () => {
    const res = await request(app)
      .post("/category")
      .send({ name: "Alimentação", type: "expense", userId });
    expect(res.statusCode).toBe(201);
    expect(res.body.category).toBeDefined();
    categoryId = res.body.category.id;
  });

  it("GET /category/:userId - lista categorias", async () => {
    await prisma.category.create({
      data: { name: "Alimentação", type: "expense", userId },
    });
    const res = await request(app).get(`/category/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.categories)).toBe(true);
  });
});

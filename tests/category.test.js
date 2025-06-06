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

  afterEach(async () => {
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("POST /category", () => {
    it("SUCESSO - cria categoria (201)", async () => {
      const res = await request(app)
        .post("/category")
        .send({ name: "Alimentação", type: "expense", userId });
      expect(res.statusCode).toBe(201);
      expect(res.body.category).toBeDefined();
      categoryId = res.body.category.id;
    });

    it("FALHA - tipo inválido(400)", async () => {
      const res = await request(app)
        .post("/category")
        .send({ name: "Viagem", type: "invalid_type", userId });
      expect(res.statusCode).toBe(400);
    });

    it("FALHA - campos vazios(400)", async () => {
      const res1 = await request(app)
        .post("/category")
        .send({ name: "Viagem", type: "income", userId: "" });

      const res2 = await request(app)
        .post("/category")
        .send({ name: "", type: "invalid_type", userId });

      const res3 = await request(app)
        .post("/category")
        .send({ name: "Viagem", type: "", userId });

      expect(res1.statusCode).toBe(400);
      expect(res2.statusCode).toBe(400);
      expect(res3.statusCode).toBe(400);
    });

    it("FALHA - categoria já existe(409)", async () => {
      await request(app)
        .post("/category")
        .send({ name: "Alimentação", type: "expense", userId });

      const res = await request(app)
        .post("/category")
        .send({ name: "Alimentação", type: "expense", userId });

      expect(res.statusCode).toBe(409);
    });

    it("FALHA - usuário não existe(404)", async () => {
      const res = await request(app).post("/category").send({
        name: "Alimentação",
        type: "expense",
        userId: 99999,
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /category/:userId", () => {
    it("SUCESSO - lista categorias (200)", async () => {
      await prisma.category.create({
        data: { name: "Alimentação", type: "expense", userId },
      });
      const res = await request(app).get(`/category/${userId}`);
      expect(res.statusCode).toBe(200);
    });

    it("FALHA - usuário não existe(404)", async () => {
      const res = await request(app).get(`/category/99999`);
      expect(res.statusCode).toBe(404);
    });
  });
});

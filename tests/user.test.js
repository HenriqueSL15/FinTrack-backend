const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

let userId, authToken;

// User Endpoints
describe("User endpoints", () => {
  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: "User",
        email: "user@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    userId = user.id;

    authToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15min" }
    );
  });

  describe("POST /users/register", () => {
    it("SUCESSO - cria usuário", async () => {
      const res = await request(app)
        .post("/users/register")
        .send({ name: "Test", email: "test@ex.com", password: "123456" });
      expect(res.statusCode).toBe(201);
      expect(res.body.userWithoutPassword).toBeDefined();
    });

    it("FALHA - usuário já existe", async () => {
      await request(app)
        .post("/users/register")
        .send({ name: "Test", email: "test@ex.com", password: "123456" });

      const res = await request(app)
        .post("/users/register")
        .send({ name: "Test", email: "test@ex.com", password: "123456" });
      expect(res.statusCode).toBe(409);
    });

    it("FALHA - campos vazios", async () => {
      const res1 = await request(app)
        .post("/users/register")
        .send({ name: "", email: "test@ex.com", password: "123456" });

      const res2 = await request(app)
        .post("/users/register")
        .send({ name: "Test", email: "", password: "123456" });
      const res3 = await request(app)
        .post("/users/register")
        .send({ name: "Test", email: "test@ex.com", password: "" });

      expect(res1.statusCode).toBe(400);
      expect(res2.statusCode).toBe(400);
      expect(res3.statusCode).toBe(400);
    });
  });

  describe("GET /users/:userId", () => {
    it("SUCESSO - retorna usuário", async () => {
      const res = await request(app)
        .get(`/users/${userId}`)
        .set("Cookie", "accessToken=" + authToken);
      expect(res.statusCode).toBe(200);
    });

    it("FALHA - usuário não existe", async () => {
      const newAuthToken = jwt.sign(
        {
          id: 999,
          email: "asdfasdf@asdfasf.com",
        },
        process.env.JWT_SECRET,
        { expiresIn: "15min" }
      );

      const res = await request(app)
        .get(`/users/999`)
        .set("Cookie", "accessToken=" + newAuthToken);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /users/:userId", () => {
    it("SUCESSO - atualiza usuário", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .send({
          theme: "light",
          currency: "EUR",
        })
        .set("Cookie", "accessToken=" + authToken);
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
    });

    it("FALHA - campos vazios", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .send({
          theme: "",
          currency: "",
        })
        .set("Cookie", "accessToken=" + authToken);

      expect(res.statusCode).toBe(400);
    });

    it("FALHA - tema inválido", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .send({
          theme: "invalid_theme",
          currency: "BRL",
        })
        .set("Cookie", "accessToken=" + authToken);

      expect(res.statusCode).toBe(400);
    });

    it("FALHA - moeda inválida", async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .send({
          theme: "light",
          currency: "invalid_currency",
        })
        .set("Cookie", "accessToken=" + authToken);

      expect(res.statusCode).toBe(400);
    });

    it("FALHA - usuário não existe", async () => {
      const newAuthToken = jwt.sign(
        {
          id: 999,
          email: "asdfasdf@asdfasf.com",
        },
        process.env.JWT_SECRET,
        { expiresIn: "15min" }
      );

      const res = await request(app)
        .put(`/users/999`)
        .send({
          name: "Test",
          email: "test@ex.com",
        })
        .set("Cookie", "accessToken=" + newAuthToken);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /users/login", () => {
    it("SUCESSO - autentica usuário", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: "user@ex.com", password: "123456" });

      expect(res.statusCode).toBe(200);
      expect(res.body.userWithoutPassword).toBeDefined();
    });

    it("FALHA - usuário não existe", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: "login@ex.com", password: "123456" });
      expect(res.statusCode).toBe(404);
    });

    it("FALHA - senha incorreta", async () => {
      await prisma.user.create({
        data: {
          name: "Test",
          email: "login@ex.com",
          passwordHash: await bcrypt.hash("123456", 10),
        },
      });

      const res = await request(app)
        .post("/users/login")
        .send({ email: "login@ex.com", password: "654321" });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /users", () => {
    it("SUCESSO - retorna todos usuários", async () => {
      await prisma.user.create({
        data: {
          name: "Test",
          email: "all@ex.com",
          passwordHash: await bcrypt.hash("123456", 10),
        },
      });
      const res = await request(app).get("/users");
      expect(res.statusCode).toBe(200);
    });
  });
});

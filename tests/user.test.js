const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

let userId;

// User Endpoints
describe("User endpoints", () => {
  it("POST /users/register - cria usuário", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ name: "Test", email: "test@ex.com", password: "123456" });
    expect(res.statusCode).toBe(201);
    expect(res.body.userWithoutPassword).toBeDefined();
    userId = res.body.userWithoutPassword.id;
  });

  it("POST /users/login - autentica usuário", async () => {
    await prisma.user.create({
      data: {
        name: "Test",
        email: "login@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    const res = await request(app)
      .post("/users/login")
      .send({ email: "login@ex.com", password: "123456" });
    expect(res.statusCode).toBe(200);
    expect(res.body.userWithoutPassword).toBeDefined();
  });

  it("GET /users - retorna todos usuários", async () => {
    await prisma.user.create({
      data: {
        name: "Test",
        email: "all@ex.com",
        passwordHash: await bcrypt.hash("123456", 10),
      },
    });
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});

const request = require("supertest");
const app = require("../index");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

beforeEach(async () => {
  if (!process.env.DATABASE_URL.includes("test")) {
    throw new Error("NUNCA rode testes em banco de produção/desenvolvimento!");
  }
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

let userId, categoryId, transactionId, goalId, budgetId;

beforeEach(async () => {
  // Garante isolamento dos testes
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

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

  it("POST /transaction/:userId/:categoryId - cria transação", async () => {
    const res = await request(app)
      .post(`/transaction/${userId}/${categoryId}`)
      .send({ description: "Salário", amount: 1000, type: "income" });
    expect(res.statusCode).toBe(201);
    expect(res.body.transaction).toBeDefined();
    transactionId = res.body.transaction.id;
  });

  it("GET /transaction/:userId - lista transações", async () => {
    await prisma.transaction.create({
      data: {
        description: "Salário",
        amount: 1000,
        type: "income",
        userId,
        categoryId,
      },
    });
    const res = await request(app).get(`/transaction/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });
});

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
